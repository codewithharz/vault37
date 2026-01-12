import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Wallet from './src/models/Wallet.js';
import User from './src/models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vault37';

async function checkWallet() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const user = await User.findOne({ email: 'handyharz@gmail.com' });
        if (!user) {
            console.log('❌ User not found');
            process.exit(1);
        }

        console.log(`User: ${user.fullName} (${user.email})`);
        console.log(`User ID: ${user._id}\n`);

        const wallet = await Wallet.findOne({ userId: user._id });
        if (!wallet) {
            console.log('❌ Wallet not found');
            process.exit(1);
        }

        console.log('💰 WALLET DATA:');
        console.log('═══════════════════════════════════════');
        console.log(`Balance: ₦${wallet.balance.toLocaleString()}`);
        console.log(`Earnings Balance: ₦${wallet.earningsBalance.toLocaleString()}`);
        console.log(`Locked Balance: ₦${wallet.lockedBalance.toLocaleString()}`);
        console.log(`Available: ₦${(wallet.balance + wallet.earningsBalance - wallet.lockedBalance).toLocaleString()}`);
        console.log(`Total: ₦${(wallet.balance + wallet.earningsBalance + wallet.lockedBalance).toLocaleString()}`);
        console.log('═══════════════════════════════════════\n');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkWallet();
