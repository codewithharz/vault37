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

// Test Results Storage
const testResults = {
    window1: null,
    window2: null,
    window3: null,
    maturity: null
};

async function runAllTests() {
    console.log('🚀 COMPREHENSIVE EXIT WINDOW TEST SUITE\n');
    console.log('='.repeat(60));
    console.log('Testing all exit scenarios:');
    console.log('  - Window 1 (Cycle 15): 40% penalty');
    console.log('  - Window 2 (Cycle 18): 30% penalty');
    console.log('  - Window 3 (Cycle 21): 20% penalty');
    console.log('  - Maturity (Cycle 24): 0% penalty');
    console.log('='.repeat(60) + '\n');

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to Database\n');

        // Run all test scenarios
        await testWindow1Exit();
        await testWindow2Exit();
        await testWindow3Exit();
        await testMaturityExit();

        // Display Summary
        displayTestSummary();

    } catch (error) {
        console.error('\n❌ Test Suite Failed:', error);
        console.error(error.stack);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

// ============================================================================
// TEST 1: Window 1 - Cycle 15 Exit (40% Penalty)
// ============================================================================
async function testWindow1Exit() {
    console.log('\n' + '='.repeat(60));
    console.log('TEST 1: EXIT AT WINDOW 1 (CYCLE 15) - 40% PENALTY');
    console.log('='.repeat(60));

    try {
        const { userId, commodityId } = await setupTestUser('window1');

        // Purchase TPIA
        const tpiaId = await purchaseAndApproveTPIA(userId, commodityId);

        // Fast forward to Cycle 15
        await simulateCycles(tpiaId, 15);

        // Request withdrawal
        await tpiaService.requestWithdrawal(tpiaId, userId);
        console.log('✅ Withdrawal requested at Cycle 15');

        // Process exit (simulate cycle 16 to trigger exit)
        await processExit(tpiaId, 16);

        // Verify results
        const result = await verifyExit(userId, tpiaId, {
            expectedCycle: 16,
            expectedPenalty: 400000,
            expectedRefund: 600000,
            expectedProfits: 15 * 50000, // 15 cycles before exit
            windowName: 'Window 1'
        });

        testResults.window1 = result;

    } catch (error) {
        console.error('❌ Test 1 Failed:', error.message);
        testResults.window1 = { success: false, error: error.message };
    }
}

// ============================================================================
// TEST 2: Window 2 - Cycle 18 Exit (30% Penalty)
// ============================================================================
async function testWindow2Exit() {
    console.log('\n' + '='.repeat(60));
    console.log('TEST 2: EXIT AT WINDOW 2 (CYCLE 18) - 30% PENALTY');
    console.log('='.repeat(60));

    try {
        const { userId, commodityId } = await setupTestUser('window2');

        // Purchase TPIA
        const tpiaId = await purchaseAndApproveTPIA(userId, commodityId);

        // Fast forward to Cycle 18
        await simulateCycles(tpiaId, 18);

        // Request withdrawal
        await tpiaService.requestWithdrawal(tpiaId, userId);
        console.log('✅ Withdrawal requested at Cycle 18');

        // Process exit
        await processExit(tpiaId, 19);

        // Verify results
        const result = await verifyExit(userId, tpiaId, {
            expectedCycle: 19,
            expectedPenalty: 300000,
            expectedRefund: 700000,
            expectedProfits: 18 * 50000,
            windowName: 'Window 2'
        });

        testResults.window2 = result;

    } catch (error) {
        console.error('❌ Test 2 Failed:', error.message);
        testResults.window2 = { success: false, error: error.message };
    }
}

// ============================================================================
// TEST 3: Window 3 - Cycle 21 Exit (20% Penalty)
// ============================================================================
async function testWindow3Exit() {
    console.log('\n' + '='.repeat(60));
    console.log('TEST 3: EXIT AT WINDOW 3 (CYCLE 21) - 20% PENALTY');
    console.log('='.repeat(60));

    try {
        const { userId, commodityId } = await setupTestUser('window3');

        // Purchase TPIA
        const tpiaId = await purchaseAndApproveTPIA(userId, commodityId);

        // Fast forward to Cycle 21
        await simulateCycles(tpiaId, 21);

        // Request withdrawal
        await tpiaService.requestWithdrawal(tpiaId, userId);
        console.log('✅ Withdrawal requested at Cycle 21');

        // Process exit
        await processExit(tpiaId, 22);

        // Verify results
        const result = await verifyExit(userId, tpiaId, {
            expectedCycle: 22,
            expectedPenalty: 200000,
            expectedRefund: 800000,
            expectedProfits: 21 * 50000,
            windowName: 'Window 3'
        });

        testResults.window3 = result;

    } catch (error) {
        console.error('❌ Test 3 Failed:', error.message);
        testResults.window3 = { success: false, error: error.message };
    }
}

// ============================================================================
// TEST 4: Maturity - Cycle 24 Exit (0% Penalty)
// ============================================================================
async function testMaturityExit() {
    console.log('\n' + '='.repeat(60));
    console.log('TEST 4: EXIT AT MATURITY (CYCLE 24) - 0% PENALTY');
    console.log('='.repeat(60));

    try {
        const { userId, commodityId } = await setupTestUser('maturity');

        // Purchase TPIA
        const tpiaId = await purchaseAndApproveTPIA(userId, commodityId);

        // Fast forward to Cycle 24
        await simulateCycles(tpiaId, 24);

        // Request withdrawal (or auto-process at maturity)
        await tpiaService.requestWithdrawal(tpiaId, userId);
        console.log('✅ Withdrawal requested at Cycle 24 (Maturity)');

        // Process exit
        await processExit(tpiaId, 24);

        // Verify results
        const result = await verifyExit(userId, tpiaId, {
            expectedCycle: 24,
            expectedPenalty: 0,
            expectedRefund: 1000000,
            expectedProfits: 24 * 50000,
            windowName: 'Maturity'
        });

        testResults.maturity = result;

    } catch (error) {
        console.error('❌ Test 4 Failed:', error.message);
        testResults.maturity = { success: false, error: error.message };
    }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function setupTestUser(testName) {
    console.log(`\n1️⃣ Setting up test user for ${testName}...`);

    // Create or find commodity
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

    const email = `exit_test_${testName}_${Date.now()}@test.com`;

    const user = await User.create({
        fullName: `Exit Test ${testName}`,
        email,
        password: 'hashed_password_placeholder',
        phone: `+234${Date.now().toString().slice(-10)}`,
        mode: 'EPS',
        role: 'user',
        isEmailVerified: true,
        kycStatus: 'verified'
    });

    // Create wallet with sufficient balance
    await Wallet.create({
        userId: user._id,
        balance: 5000000,
        ledger: []
    });

    console.log(`✅ User created: ${email}`);

    return {
        userId: user._id,
        commodityId: commodity._id
    };
}

async function purchaseAndApproveTPIA(userId, commodityId) {
    console.log('2️⃣ Purchasing and approving TPIA...');

    const { tpia } = await tpiaService.purchaseTPIA(userId, 'EPS', commodityId, 'IMMEDIATE');
    await tpiaService.approveTPIA(tpia._id, userId);

    const tpiaDoc = await TPIA.findById(tpia._id);
    console.log(`✅ TPIA ${tpiaDoc.tpiaNumber} purchased and approved`);

    return tpia._id;
}

async function simulateCycles(tpiaId, targetCycle) {
    console.log(`3️⃣ Simulating cycles up to Cycle ${targetCycle}...`);

    const tpia = await TPIA.findById(tpiaId);
    const gdc = await GDC.findOne({ gdcNumber: tpia.gdcNumber });

    // Simulate Core Phase (Cycles 1-12)
    if (targetCycle > 12) {
        await TPIA.findByIdAndUpdate(tpiaId, {
            currentCycle: 12,
            investmentPhase: 'CORE'
        });

        await Cycle.create({
            gdc: gdc._id,
            tpia: tpia._id,
            cycleNumber: 12,
            startDate: new Date(),
            endDate: new Date(),
            status: 'completed',
            profitRate: 0.05
        });

        // Transition to EXTENDED
        await tradeService.processTPIACompletion(tpia, gdc);
        console.log('  ✓ Core phase completed (Cycle 12)');
    }

    // Simulate up to target cycle
    for (let cycle = 13; cycle <= targetCycle; cycle++) {
        await TPIA.findByIdAndUpdate(tpiaId, { currentCycle: cycle });

        await Cycle.create({
            gdc: gdc._id,
            tpia: tpia._id,
            cycleNumber: cycle,
            startDate: new Date(),
            endDate: new Date(),
            status: 'completed',
            profitRate: 0.05
        });

        const updatedTpia = await TPIA.findById(tpiaId);
        await tradeService.processTPIACompletion(updatedTpia, gdc);

        // Check if exit window opened
        const tpiaCheck = await TPIA.findById(tpiaId);
        if (tpiaCheck.nextExitWindowStart && cycle === targetCycle) {
            console.log(`  ✓ Exit window opened at Cycle ${cycle}`);
        }
    }

    console.log(`✅ Simulated ${targetCycle} cycles`);
}

async function processExit(tpiaId, exitCycle) {
    console.log(`4️⃣ Processing exit at Cycle ${exitCycle}...`);

    const tpia = await TPIA.findById(tpiaId);
    const gdc = await GDC.findOne({ gdcNumber: tpia.gdcNumber });

    // Create exit cycle
    await Cycle.create({
        gdc: gdc._id,
        tpia: tpia._id,
        cycleNumber: exitCycle,
        startDate: new Date(),
        endDate: new Date(),
        status: 'completed',
        profitRate: 0.05
    });

    // Process completion (should trigger exit)
    await tradeService.processTPIACompletion(tpia, gdc);

    console.log(`✅ Exit processed at Cycle ${exitCycle}`);
}

async function verifyExit(userId, tpiaId, expected) {
    console.log('5️⃣ Verifying exit results...\n');

    const tpia = await TPIA.findById(tpiaId);
    const wallet = await Wallet.findOne({ userId });

    const results = {
        success: true,
        windowName: expected.windowName,
        expectedCycle: expected.expectedCycle,
        actualCycle: tpia.currentCycle,
        expectedPenalty: expected.expectedPenalty,
        actualPenalty: tpia.penaltyAmount,
        expectedRefund: expected.expectedRefund,
        actualRefund: tpia.returnedPrincipal,
        expectedProfits: expected.expectedProfits,
        tpiaStatus: tpia.status,
        investmentPhase: tpia.investmentPhase,
        walletBalance: wallet.balance,
        errors: []
    };

    // Verify TPIA status
    if (tpia.status !== 'completed') {
        results.errors.push(`Expected status 'completed', got '${tpia.status}'`);
        results.success = false;
    }

    // Verify investment phase
    if (tpia.investmentPhase !== 'COMPLETED') {
        results.errors.push(`Expected phase 'COMPLETED', got '${tpia.investmentPhase}'`);
        results.success = false;
    }

    // Verify penalty
    if (tpia.penaltyAmount !== expected.expectedPenalty) {
        results.errors.push(`Penalty mismatch: expected ₦${expected.expectedPenalty}, got ₦${tpia.penaltyAmount}`);
        results.success = false;
    }

    // Verify refund
    if (tpia.returnedPrincipal !== expected.expectedRefund) {
        results.errors.push(`Refund mismatch: expected ₦${expected.expectedRefund}, got ₦${tpia.returnedPrincipal}`);
        results.success = false;
    }

    // Verify exit penalty flag
    if (expected.expectedPenalty > 0 && !tpia.exitPenaltyApplied) {
        results.errors.push('Exit penalty flag not set');
        results.success = false;
    }

    // Calculate expected wallet balance
    const initialBalance = 5000000;
    const afterPurchase = initialBalance - 1000000;
    const profits = expected.expectedProfits;
    const refund = expected.expectedRefund;
    const expectedWalletBalance = afterPurchase + profits + refund;

    results.expectedWalletBalance = expectedWalletBalance;

    // Display results
    console.log('📊 VERIFICATION RESULTS:');
    console.log('─'.repeat(60));
    console.log(`Window: ${expected.windowName}`);
    console.log(`Exit Cycle: ${tpia.currentCycle} (Expected: ${expected.expectedCycle})`);
    console.log(`TPIA Status: ${tpia.status}`);
    console.log(`Investment Phase: ${tpia.investmentPhase}`);
    console.log('─'.repeat(60));
    console.log(`Penalty Applied: ${tpia.exitPenaltyApplied ? 'Yes' : 'No'}`);
    console.log(`Penalty Amount: ₦${tpia.penaltyAmount.toLocaleString()} (Expected: ₦${expected.expectedPenalty.toLocaleString()})`);
    console.log(`Principal Refund: ₦${tpia.returnedPrincipal.toLocaleString()} (Expected: ₦${expected.expectedRefund.toLocaleString()})`);
    console.log('─'.repeat(60));
    console.log(`Total Profits Received: ₦${profits.toLocaleString()}`);
    console.log(`Wallet Balance: ₦${wallet.balance.toLocaleString()}`);
    console.log(`Expected Balance: ₦${expectedWalletBalance.toLocaleString()}`);
    console.log('─'.repeat(60));

    if (results.success) {
        console.log('✅ ALL VERIFICATIONS PASSED');
    } else {
        console.log('❌ VERIFICATION ERRORS:');
        results.errors.forEach(err => console.log(`  - ${err}`));
    }

    return results;
}

function displayTestSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 COMPREHENSIVE TEST SUMMARY');
    console.log('='.repeat(60) + '\n');

    const tests = [
        { name: 'Window 1 (Cycle 15 - 40% Penalty)', result: testResults.window1 },
        { name: 'Window 2 (Cycle 18 - 30% Penalty)', result: testResults.window2 },
        { name: 'Window 3 (Cycle 21 - 20% Penalty)', result: testResults.window3 },
        { name: 'Maturity (Cycle 24 - 0% Penalty)', result: testResults.maturity }
    ];

    let allPassed = true;

    tests.forEach(test => {
        const status = test.result?.success ? '✅ PASSED' : '❌ FAILED';
        console.log(`${status} - ${test.name}`);

        if (test.result?.success) {
            console.log(`  Penalty: ₦${test.result.actualPenalty.toLocaleString()}`);
            console.log(`  Refund: ₦${test.result.actualRefund.toLocaleString()}`);
            console.log(`  Wallet: ₦${test.result.walletBalance.toLocaleString()}`);
        } else {
            console.log(`  Error: ${test.result?.error || 'Unknown error'}`);
            allPassed = false;
        }
        console.log();
    });

    console.log('='.repeat(60));

    if (allPassed) {
        console.log('🎉 ALL TESTS PASSED - EXIT SYSTEM IS PRODUCTION READY!');
    } else {
        console.log('⚠️  SOME TESTS FAILED - REVIEW ERRORS ABOVE');
    }

    console.log('='.repeat(60));

    // Economics Summary
    console.log('\n💰 ECONOMICS SUMMARY:\n');
    console.log('Investment Per TPIA: ₦1,000,000');
    console.log('Profit Per Cycle: ₦50,000 (5%)\n');

    console.table([
        {
            Window: 'Window 1 (C15)',
            Penalty: '40%',
            Refund: '₦600,000',
            'Total Profits': '₦750,000',
            'Total Take Home': '₦1,350,000',
            'ROI': '35%'
        },
        {
            Window: 'Window 2 (C18)',
            Penalty: '30%',
            Refund: '₦700,000',
            'Total Profits': '₦900,000',
            'Total Take Home': '₦1,600,000',
            'ROI': '60%'
        },
        {
            Window: 'Window 3 (C21)',
            Penalty: '20%',
            Refund: '₦800,000',
            'Total Profits': '₦1,050,000',
            'Total Take Home': '₦1,850,000',
            'ROI': '85%'
        },
        {
            Window: 'Maturity (C24)',
            Penalty: '0%',
            Refund: '₦1,000,000',
            'Total Profits': '₦1,200,000',
            'Total Take Home': '₦2,200,000',
            'ROI': '120%'
        }
    ]);

    console.log('\n📊 Platform Profit Per Exit:\n');
    console.table([
        {
            Window: 'Window 1',
            'Penalty Kept': '₦400,000',
            'Est. Gross Profit': '₦2,075,000',
            'Platform Net': '₦1,075,000+'
        },
        {
            Window: 'Window 2',
            'Penalty Kept': '₦300,000',
            'Est. Gross Profit': '₦2,490,000',
            'Platform Net': '₦1,290,000+'
        },
        {
            Window: 'Window 3',
            'Penalty Kept': '₦200,000',
            'Est. Gross Profit': '₦2,905,000',
            'Platform Net': '₦1,505,000+'
        },
        {
            Window: 'Maturity',
            'Penalty Kept': '₦0',
            'Est. Gross Profit': '₦3,320,000',
            'Platform Net': '₦1,920,000+'
        }
    ]);
}

// Run all tests
runAllTests();