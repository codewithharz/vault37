import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';
import Wallet from '../src/models/Wallet.js';
import Commodity from '../src/models/Commodity.js';

dotenv.config();

const seedData = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        // 1. Create User
        console.log('Creating user: harzkane@gmail.com...');
        const user = await User.create({
            fullName: 'Harz Kane',
            email: 'harzkane@gmail.com',
            password: 'Admin@123',
            phone: '+2348011111111',
            role: 'user',
            kycStatus: 'verified',
            isActive: true
        });
        await Wallet.create({ userId: user._id, balance: 10000000 }); // 10M credit
        console.log('User and Wallet created.');

        // 2. Create Admin
        console.log('Creating admin: admin@vault37.com...');
        const admin = await User.create({
            fullName: 'System Admin',
            email: 'admin@vault37.com',
            password: 'password123',
            phone: '+2348000000000',
            role: 'admin',
            kycStatus: 'verified',
            isActive: true
        });
        await Wallet.create({ userId: admin._id, balance: 0 });
        console.log('Admin and Wallet created.');

        // 3. Create Commodities
        console.log('Creating Commodities...');
        await Commodity.create([
            {
                name: 'Maize',
                type: 'grain',
                symbol: 'MAZ',
                navPrice: 1000000,
                basePrice: 950000,
                isActive: true
            },
            {
                name: 'Soybeans',
                type: 'grain',
                symbol: 'SOY',
                navPrice: 1200000,
                basePrice: 1100000,
                isActive: true
            },
            {
                name: 'Cocoa',
                type: 'bean',
                symbol: 'COCOA',
                navPrice: 1500000,
                basePrice: 1400000,
                isActive: true
            },
            {
                name: 'Paddy Rice',
                type: 'grain',
                symbol: 'RICE',
                navPrice: 1100000,
                basePrice: 1000000,
                isActive: true
            }
        ]);
        console.log('Commodities created.');

        console.log('\nSeed successful!');
        console.log('User: harzkane@gmail.com / Admin@123');
        console.log('Admin: admin@vault37.com / password123\n');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedData();
