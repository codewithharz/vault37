import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Transaction from './src/models/Transaction.js';
import Wallet from './src/models/Wallet.js';
import User from './src/models/User.js';

dotenv.config();

const seedWalletTransactions = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Get existing users
        const users = await User.find().limit(5);
        if (users.length === 0) {
            console.log('❌ No users found. Please create users first.');
            process.exit(1);
        }

        console.log(`📊 Found ${users.length} users`);

        // Clear existing test transactions (optional)
        await Transaction.deleteMany({
            reference: { $regex: /^TEST-/ }
        });
        console.log('🗑️  Cleared existing test transactions');

        const transactions = [];
        const now = Date.now();

        // Helper to generate reference
        const generateRef = (type, index) => `TEST-${type.toUpperCase()}-${Date.now()}-${index}`;

        // Create diverse transaction scenarios for each user
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            let wallet = await Wallet.findOne({ userId: user._id });

            if (!wallet) {
                console.log(`ℹ️  Creating missing wallet for user ${user.fullName}`);
                wallet = await Wallet.create({
                    userId: user._id,
                    balance: 1000000,
                    earningsBalance: 0,
                    lockedBalance: 0
                });
            }

            // Scenario 1: Completed Deposits
            transactions.push({
                user: user._id,
                wallet: wallet._id,
                type: 'deposit',
                amount: 50000 + (i * 10000),
                status: 'completed',
                reference: generateRef('deposit', `${i}-1`),
                paymentMethod: 'paystack',
                metadata: {
                    paystackReference: `pstk_${Date.now()}_${i}`,
                    verifiedAt: new Date(now - (i + 1) * 24 * 60 * 60 * 1000)
                },
                approvedBy: users[0]._id, // First user as admin
                approvalDate: new Date(now - (i + 1) * 24 * 60 * 60 * 1000),
                createdAt: new Date(now - (i + 2) * 24 * 60 * 60 * 1000),
                updatedAt: new Date(now - (i + 1) * 24 * 60 * 60 * 1000)
            });

            // Scenario 2: Pending Deposits
            if (i < 2) {
                transactions.push({
                    user: user._id,
                    wallet: wallet._id,
                    type: 'deposit',
                    amount: 100000,
                    status: 'pending',
                    reference: generateRef('deposit', `${i}-pending`),
                    paymentMethod: 'bank_transfer',
                    metadata: {
                        requestedAt: new Date()
                    },
                    createdAt: new Date(now - 2 * 60 * 60 * 1000), // 2 hours ago
                    updatedAt: new Date(now - 2 * 60 * 60 * 1000)
                });
            }

            // Scenario 3: Completed Withdrawals
            transactions.push({
                user: user._id,
                wallet: wallet._id,
                type: 'withdrawal',
                amount: 20000 + (i * 5000),
                status: 'completed',
                reference: generateRef('withdrawal', `${i}-1`),
                paymentMethod: 'bank_transfer',
                metadata: {
                    bankAccount: {
                        bankName: ['GTBank', 'Access Bank', 'First Bank', 'UBA', 'Zenith Bank'][i] || 'GTBank',
                        accountNumber: `01234567${i}${i}`,
                        accountName: user.fullName
                    },
                    processedAt: new Date(now - (i + 3) * 24 * 60 * 60 * 1000)
                },
                approvedBy: users[0]._id,
                approvalDate: new Date(now - (i + 3) * 24 * 60 * 60 * 1000),
                createdAt: new Date(now - (i + 4) * 24 * 60 * 60 * 1000),
                updatedAt: new Date(now - (i + 3) * 24 * 60 * 60 * 1000)
            });

            // Scenario 4: Pending Withdrawals
            if (i < 3) {
                transactions.push({
                    user: user._id,
                    wallet: wallet._id,
                    type: 'withdrawal',
                    amount: 15000 + (i * 5000),
                    status: 'pending',
                    reference: generateRef('withdrawal', `${i}-pending`),
                    paymentMethod: 'bank_transfer',
                    metadata: {
                        bankAccount: {
                            bankName: ['GTBank', 'Access Bank', 'First Bank'][i] || 'GTBank',
                            accountNumber: `09876543${i}${i}`,
                            accountName: user.fullName
                        },
                        requestedAt: new Date()
                    },
                    createdAt: new Date(now - 1 * 60 * 60 * 1000), // 1 hour ago
                    updatedAt: new Date(now - 1 * 60 * 60 * 1000)
                });
            }

            // Scenario 5: Cancelled/Failed Transactions
            if (i === 0) {
                transactions.push({
                    user: user._id,
                    wallet: wallet._id,
                    type: 'deposit',
                    amount: 75000,
                    status: 'cancelled',
                    reference: generateRef('deposit', 'cancelled'),
                    paymentMethod: 'paystack',
                    failureReason: 'Payment verification failed',
                    metadata: {
                        paystackReference: `pstk_failed_${Date.now()}`
                    },
                    createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000),
                    updatedAt: new Date(now - 5 * 24 * 60 * 60 * 1000)
                });

                transactions.push({
                    user: user._id,
                    wallet: wallet._id,
                    type: 'withdrawal',
                    amount: 30000,
                    status: 'cancelled',
                    reference: generateRef('withdrawal', 'rejected'),
                    paymentMethod: 'bank_transfer',
                    failureReason: 'Insufficient balance verification',
                    metadata: {
                        bankAccount: {
                            bankName: 'GTBank',
                            accountNumber: '0123456789',
                            accountName: user.fullName
                        }
                    },
                    approvedBy: users[0]._id,
                    approvalDate: new Date(now - 6 * 24 * 60 * 60 * 1000),
                    createdAt: new Date(now - 7 * 24 * 60 * 60 * 1000),
                    updatedAt: new Date(now - 6 * 24 * 60 * 60 * 1000)
                });
            }

            // Scenario 6: TPIA Purchase transactions
            if (i < 2) {
                transactions.push({
                    user: user._id,
                    wallet: wallet._id,
                    type: 'tpia_purchase',
                    amount: 1000000,
                    status: 'completed',
                    reference: generateRef('tpia', `${i}-1`),
                    paymentMethod: 'system',
                    description: `TPIA purchase - TPIA-${100 + i}`,
                    metadata: {
                        tpiaNumber: 100 + i,
                        gdcNumber: 10
                    },
                    createdAt: new Date(now - (i + 8) * 24 * 60 * 60 * 1000),
                    updatedAt: new Date(now - (i + 8) * 24 * 60 * 60 * 1000)
                });
            }

            // Scenario 7: Cycle Profit transactions
            if (i === 0) {
                transactions.push({
                    user: user._id,
                    wallet: wallet._id,
                    type: 'cycle_profit',
                    amount: 50000,
                    status: 'completed',
                    reference: generateRef('profit', '1'),
                    paymentMethod: 'system',
                    description: 'Cycle 1 profit - TPIA-100',
                    metadata: {
                        tpiaNumber: 100,
                        cycleNumber: 1,
                        profitMode: 'TPM'
                    },
                    createdAt: new Date(now - 10 * 24 * 60 * 60 * 1000),
                    updatedAt: new Date(now - 10 * 24 * 60 * 60 * 1000)
                });
            }
        }

        // Insert all transactions
        await Transaction.insertMany(transactions);
        console.log(`\n🎉 Successfully seeded ${transactions.length} wallet transactions!`);

        // Summary
        const summary = {
            deposits: {
                completed: transactions.filter(t => t.type === 'deposit' && t.status === 'completed').length,
                pending: transactions.filter(t => t.type === 'deposit' && t.status === 'pending').length,
                cancelled: transactions.filter(t => t.type === 'deposit' && t.status === 'cancelled').length
            },
            withdrawals: {
                completed: transactions.filter(t => t.type === 'withdrawal' && t.status === 'completed').length,
                pending: transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending').length,
                cancelled: transactions.filter(t => t.type === 'withdrawal' && t.status === 'cancelled').length
            },
            tpiaPurchases: transactions.filter(t => t.type === 'tpia_purchase').length,
            cycleProfits: transactions.filter(t => t.type === 'cycle_profit').length
        };

        console.log('\n📊 Transaction Summary:');
        console.log('   Deposits:');
        console.log(`     - Completed: ${summary.deposits.completed}`);
        console.log(`     - Pending: ${summary.deposits.pending}`);
        console.log(`     - Cancelled: ${summary.deposits.cancelled}`);
        console.log('   Withdrawals:');
        console.log(`     - Completed: ${summary.withdrawals.completed}`);
        console.log(`     - Pending: ${summary.withdrawals.pending}`);
        console.log(`     - Cancelled: ${summary.withdrawals.cancelled}`);
        console.log(`   TPIA Purchases: ${summary.tpiaPurchases}`);
        console.log(`   Cycle Profits: ${summary.cycleProfits}`);

        console.log('\n💡 You can now test the Admin Wallet Management page!');

    } catch (error) {
        console.error('❌ Error seeding wallet transactions:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
        process.exit(0);
    }
};

seedWalletTransactions();
