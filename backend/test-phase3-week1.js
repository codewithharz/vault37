import mongoose from 'mongoose';
import User from './src/models/User.js';
import TPIA from './src/models/TPIA.js';
import GDC from './src/models/GDC.js';
import Wallet from './src/models/Wallet.js';
import Cycle from './src/models/Cycle.js';
import Commodity from './src/models/Commodity.js';
import config from './src/config/env.js';
import { GDC_STATUS, TPIA_STATUS } from './src/config/constants.js';

const BASE_URL = 'http://127.0.0.1:5001/api';
const ADMIN_EMAIL = 'admin_trade@vault37.com';
const USER_EPS_EMAIL = 'user_eps@vault37.com';
const USER_TPM_EMAIL = 'user_tpm@vault37.com';
const PASSWORD = 'SecurePass123!';

async function runTests() {
    try {
        console.log('════════════════════════════════════════════════════════');
        console.log('🧪 GDIP Phase 3 Week 1 Verification');
        console.log('════════════════════════════════════════════════════════');

        await mongoose.connect(config.mongoUri);
        console.log('Connected to Database');

        // Cleanup
        await User.deleteMany({ email: { $in: [ADMIN_EMAIL, USER_EPS_EMAIL, USER_TPM_EMAIL] } });
        await GDC.deleteMany({});
        await TPIA.deleteMany({});
        await Cycle.deleteMany({});
        await Commodity.deleteMany({});
        console.log('Cleanup completed');

        // 1. Setup
        console.log('\n📋 Setup: Registering Test Entities');

        const register = async (email, fullName) => {
            const res = await fetch(`${BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, email, password: PASSWORD, confirmPassword: PASSWORD, phone: '+2348000000000' })
            });
            return res.json();
        };

        await register(ADMIN_EMAIL, 'Admin Trade');
        const epsRes = await register(USER_EPS_EMAIL, 'User EPS');
        const tpmRes = await register(USER_TPM_EMAIL, 'User TPM');

        await User.updateOne({ email: ADMIN_EMAIL }, { role: 'admin' });
        await User.updateOne({ email: USER_EPS_EMAIL }, { kycStatus: 'verified', mode: 'EPS' });
        await User.updateOne({ email: USER_TPM_EMAIL }, { kycStatus: 'verified', mode: 'TPM' });

        const adminLogin = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: ADMIN_EMAIL, password: PASSWORD })
        }).then(r => r.json());
        const adminToken = adminLogin.data.tokens.accessToken;

        const epsLogin = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: USER_EPS_EMAIL, password: PASSWORD })
        }).then(r => r.json());
        const epsToken = epsLogin.data.tokens.accessToken;

        const tpmLogin = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: USER_TPM_EMAIL, password: PASSWORD })
        }).then(r => r.json());
        const tpmToken = tpmLogin.data.tokens.accessToken;

        // Credit Wallets
        await Wallet.updateOne(
            { userId: epsRes.data.user.id },
            { $set: { balance: 1000000 } }
        );
        await Wallet.updateOne(
            { userId: tpmRes.data.user.id },
            { $set: { balance: 1000000 } }
        );

        // Create Commodity
        const comm = await Commodity.create({
            name: 'Standard TPIA',
            type: 'Investment',
            navPrice: 100000,
            basePrice: 100000,
            markup: 0,
            isActive: true
        });
        const commodityId = comm._id.toString();

        console.log('Test entities registered and funded');

        // 2. Dual Mode Verification
        console.log('\n📋 Step 1: Purchasing TPIAs with different start modes');

        // A. Purchase 1 TPIA with IMMEDIATE start
        console.log('Purchasing 1 TPIA (IMMEDIATE start)...');
        const immRes = await fetch(`${BASE_URL}/tpia/purchase`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${epsToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ mode: 'EPS', commodityId, cycleStartMode: 'IMMEDIATE' })
        }).then(r => r.json());

        if (!immRes.success) throw new Error('Immediate purchase failed');
        const immTpiaId = immRes.data.tpia.id;

        // B. Purchase 9 TPIAs with CLUSTER start
        console.log('Purchasing 9 TPIAs (CLUSTER start)...');
        for (let i = 0; i < 9; i++) {
            await fetch(`${BASE_URL}/tpia/purchase`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${tpmToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode: 'TPM', commodityId, cycleStartMode: 'CLUSTER' })
            }).then(r => r.json());
        }

        // C. Approve all
        const pending = await TPIA.find({ status: TPIA_STATUS.PENDING_APPROVAL });
        console.log(`Approving ${pending.length} TPIAs...`);
        for (const t of pending) {
            await fetch(`${BASE_URL}/tpia/admin/${t._id}/approve`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes: 'Test Approval' })
            });
        }

        // D. Verify statuses
        const immTpia = await TPIA.findById(immTpiaId);
        const clusterTpias = await TPIA.find({ cycleStartMode: 'CLUSTER' });

        console.log(`Immediate TPIA Status: ${immTpia.status}, Cycle: ${immTpia.currentCycle}`);
        console.log(`Cluster TPIAs Count: ${clusterTpias.length}`);
        clusterTpias.forEach(t => {
            console.log(`TPIA ${t.tpiaNumber}: Status=${t.status}, Cycle=${t.currentCycle}, Mode=${t.cycleStartMode}`);
        });
        if (immTpia.status === 'active' && immTpia.currentCycle === 1) {
            console.log('✅ IMMEDIATE TPIA started immediately upon approval');
        } else {
            console.log('❌ IMMEDIATE TPIA failed to start');
        }

        const clusterStartedCount = clusterTpias.filter(t => t.currentCycle > 0).length;
        if (clusterStartedCount === 0) {
            console.log('✅ CLUSTER TPIAs are waiting for cluster to be full');
        } else {
            console.log(`❌ ${clusterStartedCount} CLUSTER TPIAs started prematurely`);
        }

        // E. Activate the GDC (Manually trigger cluster start)
        console.log('\n📋 Step 2: Activating FULL GDC');
        const gdc = await GDC.findOne({ currentFill: 10 });
        console.log(`Calling startGDC for GDC ${gdc._id}...`);
        const triggerRes = await fetch(`${BASE_URL}/admin/cycles/gdc/${gdc._id}/start`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${adminToken}` }
        }).then(r => r.json());

        console.log('startGDC response:', triggerRes);

        const clusterTpiasAfter = await TPIA.find({ cycleStartMode: 'CLUSTER' });
        const clusterStartedAfter = clusterTpiasAfter.filter(t => t.currentCycle === 1).length;

        if (clusterStartedAfter === 9) {
            console.log('✅ All CLUSTER TPIAs started after GDC activation');
        } else {
            console.log(`❌ Only ${clusterStartedAfter}/9 CLUSTER TPIAs started`);
        }

        // F. Simulate maturity (Advance time)
        console.log('Simulating maturity (setting maturityDate to now)...');
        await TPIA.updateMany(
            { gdcNumber: gdc.gdcNumber, status: 'active' },
            { $set: { maturityDate: new Date() } }
        );

        // 4. Complete Cycle
        console.log('\n📋 Step 3: Completing Cycle 1');
        const completeRes = await fetch(`${BASE_URL}/admin/cycles/gdc/${gdc._id}/complete`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${adminToken}` }
        }).then(r => r.json());

        if (completeRes.success) {
            console.log('✅ Cycle 1 Processed');
        } else {
            console.log('❌ Failed to complete cycle:', completeRes);
        }

        // 5. Verification
        console.log('\n📊 Final Verification:');

        const epsWallet = await Wallet.findOne({ userId: epsRes.data.user.id });
        const tpmTpias = await TPIA.find({ userId: tpmRes.data.user.id });

        // EPS: Balance should have profit in earningsBalance
        // 1 TPIA * 37000 = 37000
        if (epsWallet.earningsBalance === 37000) {
            console.log('✅ EPS Payout Correct: ₦37,000 in earnings');
        } else {
            console.log(`❌ EPS Payout Incorrect: Found ₦${epsWallet.earningsBalance}`);
        }

        // TPM: currentValue should have increased
        // 100000 + 37000 = 137000
        const tpmCorrect = tpmTpias.every(t => t.currentValue === 137000);
        if (tpmCorrect) {
            console.log('✅ TPM Compounding Correct: ₦137,000 per TPIA');
        } else {
            console.log(`❌ TPM Compounding Incorrect: Check TPIA values`);
        }

        const cycleCount = await Cycle.countDocuments({ gdc: gdc._id });
        // Start: 1 (Immediate) + 9 (Cluster) = 10 running
        // Complete: 10 completed + 10 next-cycle-started = 20 records
        if (cycleCount === 20) {
            console.log('✅ 20 Cycle records found (10 Completed, 10 Running)');
        } else {
            console.log(`❌ Cycle count incorrect: ${cycleCount} (Expected 20)`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Test Suite Failed:', error.message);
        process.exit(1);
    }
}

runTests();
