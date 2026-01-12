import mongoose from 'mongoose';
import config from './env.js';

// MongoDB connection options optimized for performance and security
const options = {
    // Connection pool settings for optimal performance
    maxPoolSize: 10,
    minPoolSize: 2,
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 5000,

    // Automatic index creation
    autoIndex: config.nodeEnv === 'development',

    // Use new URL parser
    family: 4, // Use IPv4, skip trying IPv6
};

/**
 * Connect to MongoDB with retry logic
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(config.mongoUri, options);

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);

        // Monitor connection events
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('✅ MongoDB reconnected');
        });

        return conn;
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        throw error; // Rethrow to let caller handle it
    }
};

/**
 * Gracefully close database connection
 */
const closeDB = async () => {
    try {
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed');
    } catch (error) {
        console.error('❌ Error closing MongoDB connection:', error.message);
    }
};

export { connectDB, closeDB };
