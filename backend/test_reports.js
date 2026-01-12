import { getFinancialReport, generateCSV } from './src/services/adminService.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { REPORT_TYPES } from './src/config/constants.js';

dotenv.config();

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        console.log('\n--- Testing Transaction Summary Report ---');
        const summary = await getFinancialReport({ type: REPORT_TYPES.TRANSACTION_SUMMARY });
        console.log('Results:', JSON.stringify(summary, null, 2));

        console.log('\n--- Testing User Acquisition Report ---');
        const users = await getFinancialReport({ type: REPORT_TYPES.USER_ACQUISITION });
        console.log('Results:', JSON.stringify(users, null, 2));

        console.log('\n--- Testing TPIA Sales Report ---');
        const sales = await getFinancialReport({ type: REPORT_TYPES.TPIA_SALES });
        console.log('Results:', JSON.stringify(sales, null, 2));

        console.log('\n--- Testing CSV Generation ---');
        const csv = generateCSV(summary, REPORT_TYPES.TRANSACTION_SUMMARY);
        console.log('CSV Preview:\n', csv.split('\n').slice(0, 5).join('\n'));

        console.log('\nVerification Successful');
        process.exit(0);
    } catch (error) {
        console.error('Verification Failed:', error);
        process.exit(1);
    }
};

test();
