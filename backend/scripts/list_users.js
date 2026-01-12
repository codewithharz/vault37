import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';

dotenv.config({ path: './.env' });

const listUsers = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/vault37_db');

        const users = await User.find({}, 'fullName email role');
        console.table(users.map(u => ({ id: u._id.toString(), name: u.fullName, email: u.email, role: u.role })));

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

listUsers();
