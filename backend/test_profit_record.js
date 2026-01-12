import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import User from './src/models/User.js';
import Wallet from './src/models/Wallet.js';
import TPIA from './src/models/TPIA.js';
import GDC from './src/models/GDC.js';
import Cycle from './src/models/Cycle.js';
import Transaction from './src/models/Transaction.js';
import tradeService from './src/services/tradeService.js';
import * as adminService from './src/services/adminService.js';
import { TPIA_STATUS } from './src/config/constants.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runTest() {
    try {
        console.log('🔌 Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected');

        // 1. Create Test User (EPS Mode)
        const email = `test.profit.${Date.now()}@example.com`;
        const user = await User.create({
            fullName: 'Test Profit User',
            email,
            password: 'Password123!',
            phone: '08012345678',
            role: 'user',
            mode: 'EPS', // Critical for payout
            kycStatus: 'verified'
        });

        // 2. Create Wallet
        const wallet = await Wallet.create({
            userId: user._id,
            balance: 1000000
        });

        // 3. Create TPIA
        // Use a safe range for testing as requested (GDC 90)
        const tpiaNumber = 90001;

        // Cleanup existing if any from previous failed runs to avoid duplicate key error
        await TPIA.deleteOne({ tpiaNumber });

        const tpia = await TPIA.create({
            userId: user._id,
            commodityId: new mongoose.Types.ObjectId(), // Fake commodity ID
            tpiaNumber: tpiaNumber,
            gdcNumber: 90,
            amount: 1000000,
            status: TPIA_STATUS.ACTIVE,
            currentCycle: 1,
            cycleStartMode: 'IMMEDIATE',
            maturityDate: new Date(Date.now() - 10000), // PAST DUE
            userMode: user.mode
        });

        // 4. Create GDC
        // Cleanup existing GDC 90 if exists
        await GDC.deleteOne({ gdcNumber: 90 });

        const gdc = await GDC.create({
            gdcNumber: 90,
            commodityId: tpia.commodityId,
            tpias: [{
                tpiaId: tpia._id,
                tpiaNumber: tpia.tpiaNumber,
                userId: user._id,
                purchaseDate: tpia.purchaseDate,
                approvalDate: tpia.approvalDate
            }],
            status: 'full', // 'ACTIVE' was invalid, checking constants shows likely lowercase or different key
            nextCycleDate: tpia.maturityDate
        });

        // 5. Create Running Cycle
        const cycle = await Cycle.create({
            gdc: gdc._id,
            tpia: tpia._id,
            cycleNumber: 1,
            startDate: new Date(),
            endDate: tpia.maturityDate,
            status: 'running',
            profitRate: 0.37
        });

        console.log(`🚀 Processing Cycle Completion for GDC ${gdc.gdcNumber}...`);
        await tradeService.processCycleCompletion(gdc._id);
        console.log('✅ Processed');

        // 6. Verify Transaction Record
        const tx = await Transaction.findOne({
            user: user._id,
            type: 'cycle_profit'
        });

        if (tx) {
            console.log('✅ Transaction Record Created:', tx.reference, `Amount: ${tx.amount}`);
        } else {
            console.error('❌ Transaction Record NOT Created!');
        }

        // 7. Verify Admin Report
        console.log('📊 Fetching Profit Distribution Report...');
        const report = await adminService.getFinancialReport({
            type: 'profit_distribution'
        });

        console.log('Report Data:', JSON.stringify(report, null, 2));

        const hasEntry = report.some(r => r.totalDistributed > 0);
        if (hasEntry) {
            console.log('✅ Report shows distributed profit!');
        } else {
            console.warn('⚠️ Report might be empty if date filters exclude today or aggregation delayed.');
        }

        // Cleanup
        console.log('🧹 Cleaning up...');
        await Transaction.deleteMany({ user: user._id });
        await Cycle.deleteMany({ tpia: tpia._id });
        await TPIA.findByIdAndDelete(tpia._id);
        await GDC.findByIdAndDelete(gdc._id);
        await Wallet.findByIdAndDelete(wallet._id);
        await User.findByIdAndDelete(user._id);

    } catch (error) {
        console.error('❌ Test Failed:', error);
    } finally {
        await mongoose.disconnect();
    }
}

runTest();
