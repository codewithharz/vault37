// node scripts/create_admin.js
import mongoose from 'mongoose';
import User from '../src/models/User.js';

const createAdmin = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect('mongodb://localhost:27017/vault37_db');
        console.log('Connected.');

        const email = 'admin@vault37.com';
        const password = 'password123';
        const adminData = {
            fullName: 'System Admin',
            email,
            password,
            phone: '+2348000000000',
            role: 'admin',
            kycStatus: 'verified',
            emailVerified: true
        };

        let admin = await User.findOne({ email });

        if (admin) {
            console.log('Admin user exists. Updating role and password...');
            admin.role = 'admin';
            admin.password = password; // Will be hashed by pre-save hook

            // Unlock account if locked
            admin.loginAttempts = 0;
            admin.lockUntil = undefined;
            admin.isActive = true; // Ensure active

            // Clear refresh tokens to force clean slate
            admin.refreshTokens = [];

            await admin.save();
            console.log('Admin user updated (Unlocked & Validated).');
        } else {
            console.log('Creating new admin user...');
            admin = await User.create(adminData);
            console.log('Admin user created successfully.');
        }

        console.log(`\nlogin email: ${email}`);
        console.log(`login password: ${password}\n`);

        process.exit();
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
