/**
 * Seed User Dashboard Data
 * 
 * This script populates the dashboard for handyharz@gmail.com with:
 * - Multiple TPIAs across different GDCs (100-110)
 * - Wallet transactions (deposits, withdrawals, purchases)
 * - Realistic cycle progress and profit history
 * 
 * Usage: node seed-user-dashboard.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import TPIA from './src/models/TPIA.js';
import GDC from './src/models/GDC.js';
import Wallet from './src/models/Wallet.js';
import Transaction from './src/models/Transaction.js';
import Commodity from './src/models/Commodity.js';
import Cycle from './src/models/Cycle.js';
import { TPIA_STATUS, GDC_STATUS, TRANSACTION_TYPES } from './src/config/constants.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vault37';
const USER_EMAIL = 'handyharz@gmail.com';

// GDC range to use (100-110)
const GDC_START = 100;
const GDC_END = 110;

async function connectDB() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB connected');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

async function seedUserDashboard() {
    try {
        console.log('\n🌱 Starting User Dashboard Seed...\n');

        // 1. Find the user
        const user = await User.findOne({ email: USER_EMAIL });
        if (!user) {
            console.error(`❌ User ${USER_EMAIL} not found`);
            process.exit(1);
        }
        console.log(`✅ Found user: ${user.fullName} (${user.email})`);

        // 2. Get user's wallet
        let wallet = await Wallet.findOne({ userId: user._id });
        if (!wallet) {
            console.log('📝 Creating wallet for user...');
            wallet = await Wallet.create({
                userId: user._id,
                balance: 0,
                earningsBalance: 0,
                lockedBalance: 0,
            });
        }
        console.log(`✅ Wallet found: Balance ₦${wallet.balance.toLocaleString()}`);

        // 3. Get a commodity (use first available)
        const commodity = await Commodity.findOne({ isActive: true });
        if (!commodity) {
            console.error('❌ No active commodity found. Please create one first.');
            process.exit(1);
        }
        console.log(`✅ Using commodity: ${commodity.name}`);

        // 4. Get next available TPIA number
        const lastTPIA = await TPIA.findOne().sort({ tpiaNumber: -1 });
        let nextTPIANumber = lastTPIA ? lastTPIA.tpiaNumber + 1 : 1;
        console.log(`📊 Next TPIA number: ${nextTPIANumber}`);

        // 5. Create deposits to fund the purchases
        console.log('\n💰 Creating deposit transactions...');
        const depositAmount = 7000000; // ₦7,000,000 (enough for 5 TPIAs + extra)
        const depositTx = await Transaction.create({
            user: user._id,
            wallet: wallet._id,
            userId: user._id,
            type: TRANSACTION_TYPES.DEPOSIT,
            amount: depositAmount,
            status: 'completed',
            reference: `DEP-${Date.now()}-SEED`,
            description: 'Seed deposit for testing',
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        });

        // Update wallet balance
        wallet.balance += depositAmount;
        await wallet.save();
        console.log(`✅ Deposited ₦${depositAmount.toLocaleString()} to wallet`);

        // 6. Create TPIAs across multiple GDCs
        console.log('\n📈 Creating TPIAs...');
        const tpiasToCreate = [
            { gdcNumber: 100, cycles: 8, mode: 'TPM', status: TPIA_STATUS.ACTIVE },
            { gdcNumber: 100, cycles: 8, mode: 'TPM', status: TPIA_STATUS.ACTIVE },
            { gdcNumber: 100, cycles: 8, mode: 'EPS', status: TPIA_STATUS.ACTIVE },
            { gdcNumber: 110, cycles: 3, mode: 'TPM', status: TPIA_STATUS.ACTIVE },
            { gdcNumber: 110, cycles: 3, mode: 'EPS', status: TPIA_STATUS.ACTIVE },
        ];

        const createdTPIAs = [];

        for (const tpiaConfig of tpiasToCreate) {
            const tpiaNumber = nextTPIANumber++;
            const purchaseDate = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000); // 40 days ago
            const approvalDate = new Date(purchaseDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours after purchase

            // Calculate current value based on cycles completed
            const baseAmount = 1000000;
            const profitPerCycle = 50000;
            let currentValue = baseAmount;

            if (tpiaConfig.mode === 'TPM') {
                // Compounding: add profit to principal each cycle
                for (let i = 0; i < tpiaConfig.cycles; i++) {
                    currentValue += profitPerCycle;
                }
            } else {
                // EPS: value stays the same, profits go to earnings
                currentValue = baseAmount;
            }

            const tpia = await TPIA.create({
                tpiaNumber,
                gdcNumber: tpiaConfig.gdcNumber,
                userId: user._id,
                amount: baseAmount,
                currentValue,
                purchaseDate,
                approvalDate,
                status: tpiaConfig.status,
                profitAmount: profitPerCycle,
                userMode: tpiaConfig.mode,
                cycleStartMode: 'CLUSTER',
                currentCycle: tpiaConfig.cycles,
                totalCycles: 24,
                commodityId: commodity._id,
                investmentPhase: tpiaConfig.cycles <= 12 ? 'CORE' : 'EXTENDED',
                autoApproved: false,
                approvedBy: user._id, // Using same user as approver for seed
            });

            // Create profit history for completed cycles
            const profitHistory = [];
            for (let cycle = 1; cycle <= tpiaConfig.cycles; cycle++) {
                const cycleDate = new Date(approvalDate.getTime() + cycle * 37 * 24 * 60 * 60 * 1000);
                profitHistory.push({
                    amount: profitPerCycle,
                    date: cycleDate,
                    userMode: tpiaConfig.mode,
                });

                // If EPS mode, add to earnings balance
                if (tpiaConfig.mode === 'EPS') {
                    wallet.earningsBalance += profitPerCycle;
                }
            }
            tpia.profitHistory = profitHistory;
            await tpia.save();

            // Create purchase transaction
            await Transaction.create({
                user: user._id,
                wallet: wallet._id,
                userId: user._id,
                type: TRANSACTION_TYPES.TPIA_PURCHASE,
                amount: baseAmount,
                status: 'completed',
                reference: `TPIA-${tpiaNumber}-PURCHASE`,
                description: `TPIA-${tpiaNumber} purchase`,
                createdAt: purchaseDate,
            });

            // Lock funds (don't deduct from balance, just track as locked)
            wallet.lockedBalance += baseAmount;

            createdTPIAs.push(tpia);
            console.log(`  ✅ TPIA-${tpiaNumber} | GDC-${tpiaConfig.gdcNumber} | ${tpiaConfig.mode} | Cycle ${tpiaConfig.cycles}/24 | ₦${currentValue.toLocaleString()}`);
        }

        // Save wallet with updated balances
        await wallet.save();

        // 7. Create or update GDCs
        console.log('\n🏢 Creating/Updating GDCs...');
        const gdcNumbers = [...new Set(tpiasToCreate.map(t => t.gdcNumber))];

        for (const gdcNumber of gdcNumbers) {
            const gdcTPIAs = createdTPIAs.filter(t => t.gdcNumber === gdcNumber);

            let gdc = await GDC.findOne({ gdcNumber });
            if (!gdc) {
                gdc = await GDC.create({
                    gdcNumber,
                    commodityId: commodity._id,
                    tpias: [],
                    currentFill: 0,
                    status: GDC_STATUS.FILLING,
                    currentCycle: gdcTPIAs[0]?.currentCycle || 0,
                    totalCycles: 24,
                });
            }

            // Add TPIAs to GDC
            for (const tpia of gdcTPIAs) {
                const exists = gdc.tpias.some(t => t.tpiaNumber === tpia.tpiaNumber);
                if (!exists) {
                    gdc.tpias.push({
                        tpiaId: tpia._id,
                        tpiaNumber: tpia.tpiaNumber,
                        userId: tpia.userId,
                        purchaseDate: tpia.purchaseDate,
                        approvalDate: tpia.approvalDate,
                    });
                }
            }

            gdc.currentFill = gdc.tpias.length;
            if (gdc.currentFill >= 10) {
                gdc.status = GDC_STATUS.ACTIVE;
                gdc.activationDate = gdcTPIAs[0]?.approvalDate;
            }

            await gdc.save();
            console.log(`  ✅ GDC-${gdcNumber} | ${gdc.currentFill}/10 TPIAs | ${gdc.status}`);
        }

        // 8. Create some recent transactions for activity feed
        console.log('\n📝 Creating recent transactions...');
        const recentTransactions = [
            {
                type: TRANSACTION_TYPES.CYCLE_PROFIT,
                amount: 50000,
                description: 'Cycle 8 profit - TPIA-' + createdTPIAs[0].tpiaNumber,
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            },
            {
                type: TRANSACTION_TYPES.CYCLE_PROFIT,
                amount: 50000,
                description: 'Cycle 8 profit - TPIA-' + createdTPIAs[1].tpiaNumber,
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            },
            {
                type: TRANSACTION_TYPES.DEPOSIT,
                amount: 500000,
                description: 'Additional deposit',
                createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            },
        ];

        for (const txData of recentTransactions) {
            await Transaction.create({
                user: user._id,
                wallet: wallet._id,
                userId: user._id,
                type: txData.type,
                amount: txData.amount,
                status: 'completed',
                reference: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                description: txData.description,
                createdAt: txData.createdAt,
            });
            console.log(`  ✅ ${txData.type} | ₦${txData.amount.toLocaleString()}`);
        }

        // Update wallet with additional deposit
        wallet.balance += 500000;
        await wallet.save();

        // 9. Summary
        console.log('\n📊 SEED SUMMARY');
        console.log('═══════════════════════════════════════════════');
        console.log(`User: ${user.fullName} (${user.email})`);
        console.log(`TPIAs Created: ${createdTPIAs.length}`);
        console.log(`GDCs Used: ${gdcNumbers.join(', ')}`);
        console.log(`\nWallet Balances:`);
        console.log(`  Total Balance: ₦${wallet.balance.toLocaleString()}`);
        console.log(`  Earnings: ₦${wallet.earningsBalance.toLocaleString()}`);
        console.log(`  Locked: ₦${wallet.lockedBalance.toLocaleString()}`);
        console.log(`  Available: ₦${(wallet.balance - wallet.lockedBalance).toLocaleString()}`);
        console.log('═══════════════════════════════════════════════');
        console.log('\n✅ User dashboard seeding completed successfully!\n');

    } catch (error) {
        console.error('❌ Error seeding user dashboard:', error);
        throw error;
    }
}

// Run the seed
connectDB()
    .then(seedUserDashboard)
    .then(() => {
        console.log('🎉 All done! You can now view the dashboard.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
