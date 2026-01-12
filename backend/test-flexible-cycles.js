
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './src/models/User.js';
import Wallet from './src/models/Wallet.js';
import TPIA from './src/models/TPIA.js';
import GDC from './src/models/GDC.js';
import Cycle from './src/models/Cycle.js';
import Commodity from './src/models/Commodity.js';
import * as tpiaService from './src/services/tpiaService.js';
import tradeService from './src/services/tradeService.js';
import { TPIA_CONSTANTS } from './src/config/constants.js';

// Load env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

let userId = '';
let tpiaId = '';
let gdcId = '';
let commodityId = '';

async function runTest() {
    console.log('🚀 Starting Flexible Cycles Verification (Direct Service Mode)\n');

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to Database');

        // 1. Setup User
        await setupUser();

        // 2. Purchase TPIA
        await purchaseStep();

        // 3. Simulate Core Phase (12 Cycles)
        await simulateCorePhase();

        // 4. Simulate Cycle 15 (First Exit Window)
        await simulateExitWindowOpening();

        // 5. Request Withdrawal
        await requestWithdrawalStep();

        // 6. Process Withdrawal
        await processWithdrawalStep();

        // Check final wallet balance
        const finalWallet = await Wallet.findOne({ userId: userId });
        const finalTPIA = await TPIA.findById(tpiaId);

        console.log('\n=== FINAL VERIFICATION ===');
        console.log('Final TPIA Status:', finalTPIA.status);
        console.log('Investment Phase:', finalTPIA.investmentPhase);
        console.log('Maturity Date:', finalTPIA.maturityDate);
        console.log('Exit Penalty Applied:', finalTPIA.exitPenaltyApplied);
        console.log('Penalty Amount:', finalTPIA.penaltyAmount);
        console.log('Returned Principal:', finalTPIA.returnedPrincipal);
        console.log('Wallet Balance:', finalWallet.balance);

        // Verification Logic for Cycle 15 Exit (40% Penalty)
        // Investment: 1,000,000
        // Expected Penalty: 400,000
        // Expected Return: 600,000
        // Wallet was 0 (after purchase) + 15 * 50,000 (profits) = 750,000
        // But profits are paid out? Let's check logic.
        // Assuming EPS: Wallet = 750,000 (profits) + 600,000 (principal) = 1,350,000

        if (finalTPIA.status === 'completed' && finalTPIA.exitPenaltyApplied === true) {
            console.log('✅ TPIA Successfully Exited with Penalty!');
            if (finalTPIA.returnedPrincipal === 600000) {
                console.log('✅ Correct Principal Returned (60%): ₦600,000');
            } else {
                console.log('❌ Incorrect Principal Return:', finalTPIA.returnedPrincipal);
            }
        } else {
            console.log('❌ TPIA Exit Verification Failed');
        }

    } catch (error) {
        console.error('\n❌ Test Failed:', error);
        console.error(error.stack);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

async function setupUser() {
    console.log('1️⃣ Setting up User & Commodity...');

    // Create or Find Commodity
    const commodity = await Commodity.findOneAndUpdate(
        { name: 'Test Gold' },
        {
            name: 'Test Gold',
            type: 'Metal',
            basePrice: 50000,
            navPrice: 50000,
            description: 'Test commodity'
        },
        { upsert: true, new: true }
    );
    commodityId = commodity._id;

    const email = `flex_svc_${Date.now()}@test.com`;

    const user = await User.create({
        fullName: 'Flex Service Tester',
        email,
        password: 'hashed_password_placeholder',
        phone: `+234${Date.now().toString().slice(-10)}`,
        mode: 'EPS',
        role: 'user',
        isEmailVerified: true,
        kycStatus: 'verified'
    });

    userId = user._id;

    // Create Wallet
    await Wallet.create({
        userId,
        balance: 5000000,
        ledger: []
    });

    console.log('✅ User Created & Wallet Credited');
}

async function purchaseStep() {
    console.log('2️⃣ Purchasing TPIA...');
    // Mock user object for service
    const { tpia } = await tpiaService.purchaseTPIA(userId, 'EPS', commodityId, 'IMMEDIATE');
    tpiaId = tpia._id;

    // Approve
    const tpiaDoc = await TPIA.findById(tpiaId);
    await tpiaService.approveTPIA(tpiaId, userId); // Self-approve for test

    console.log(`✅ TPIA ${tpiaDoc.tpiaNumber} Purchased & Approved`);
}

async function simulateCorePhase() {
    console.log('3️⃣ Simulating Core Phase Completion (Cycle 12)...');

    // Fast forward TPIA state to Cycle 12
    await TPIA.findByIdAndUpdate(tpiaId, {
        currentCycle: 12,
        investmentPhase: 'CORE'
    });

    const tpia = await TPIA.findById(tpiaId);
    const gdc = await GDC.findOne({ gdcNumber: tpia.gdcNumber });

    // Create completed Cycle 12 record
    await Cycle.create({
        gdc: gdc._id,
        tpia: tpia._id,
        cycleNumber: 12,
        startDate: new Date(),
        endDate: new Date(),
        status: 'running',
        profitRate: 0.05
    });

    // Run completion logic
    // This should transition to EXTENDED phase
    await tradeService.processTPIACompletion(tpia, gdc);

    // Verify
    const updatedTpia = await TPIA.findById(tpiaId);
    if (updatedTpia.investmentPhase !== 'EXTENDED') {
        throw new Error(`Expected EXTENDED phase, got ${updatedTpia.investmentPhase}`);
    }
    console.log('✅ Core Phase Completed -> EXTENDED Phase');
}

async function simulateExitWindowOpening() {
    console.log('4️⃣ Simulating Cycle 15 Completion (Window Opening)...');

    // Fast forward to Cycle 15
    await TPIA.findByIdAndUpdate(tpiaId, { currentCycle: 15 });

    const tpia = await TPIA.findById(tpiaId);
    const gdc = await GDC.findOne({ gdcNumber: tpia.gdcNumber });

    await Cycle.create({
        gdc: gdc._id,
        tpia: tpia._id,
        cycleNumber: 15,
        startDate: new Date(),
        endDate: new Date(),
        status: 'running',
        profitRate: 0.05
    });

    // Process
    await tradeService.processTPIACompletion(tpia, gdc);

    // Verify Window
    const updatedTpia = await TPIA.findById(tpiaId);
    if (!updatedTpia.nextExitWindowStart) {
        throw new Error('Exit window did not open!');
    }

    console.log(`✅ Exit Window Open: ${updatedTpia.nextExitWindowStart}`);
}

async function requestWithdrawalStep() {
    console.log('5️⃣ Requesting Withdrawal...');

    await tpiaService.requestWithdrawal(tpiaId, userId);

    const tpia = await TPIA.findById(tpiaId);
    if (!tpia.withdrawalRequested) {
        throw new Error('Withdrawal request flag not set');
    }

    console.log('✅ Withdrawal Requested Successfully');
}

async function processWithdrawalStep() {
    console.log('6️⃣ Processing Withdrawal (Cycle 16 End)...');

    const tpia = await TPIA.findById(tpiaId);
    const gdc = await GDC.findOne({ gdcNumber: tpia.gdcNumber });

    // Cycle 16 (which started when window opened) finishes
    // We want to process the exit at the END of the window cycle (Cycle 15).
    // The previous step fast-forwarded to 15 to *open* the window.
    // Now we need to process the completion of that window.
    // Actually, in our test logic:
    // Step 4: Fast fwd to 15 -> Create Cycle 15 -> Process Completion (Window Opens).
    // Step 5: User Requests Withdrawal.
    // Step 6: We need to trigger the *next* processing event to catch the withdrawal.
    // In real life, this would happen at the end of the *next* cycle (16)? 
    // OR immediately? 
    // If the window is 14 days, the next cycle (16) starts 37 days later. 
    // So the exit likely processes at the end of Cycle 16 or via a separate job?

    // For this test, let's assume we are re-running the completion logic for Cycle 15 
    // to pick up the withdrawal (simulating "processing at end of window").
    // OR simply assume the penalty logic we just fixed handles Cycle 16.

    await Cycle.create({
        gdc: gdc._id,
        tpia: tpia._id,
        cycleNumber: 16,
        startDate: new Date(),
        endDate: new Date(),
        status: 'running',
        profitRate: 0.05
    });

    // Process completion -> Should see withdrawal request and EXIT
    await tradeService.processTPIACompletion(tpia, gdc);

    // Verify
    const finalTpia = await TPIA.findById(tpiaId);
    if (finalTpia.status !== 'completed') {
        throw new Error(`Expected status 'completed', got ${finalTpia.status}`);
    }
    if (finalTpia.investmentPhase !== 'COMPLETED') {
        throw new Error(`Expected phase 'COMPLETED', got ${finalTpia.investmentPhase}`);
    }

    // Check Wallet for principal return
    const wallet = await Wallet.findOne({ userId });
    const lastTx = wallet.ledger[wallet.ledger.length - 1];
    if (!lastTx.description.includes('Principal Return')) {
        throw new Error('Principal return transaction not found');
    }

    console.log('✅ Cycle 16 Processed -> Withdrawal Executed & Principal Returned');
}

runTest();
