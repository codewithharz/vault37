import app from './app.js';
import config from './config/env.js';
import { connectDB, closeDB } from './config/database.js';

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('💥 UNCAUGHT EXCEPTION! Shutting down...');
    console.error('Error:', err.name, err.message);
    console.error('Stack:', err.stack);
    process.exit(1);
});

// Connect to database with simple retry logic
const startServer = async () => {
    let connected = false;
    let retries = 5;

    while (!connected && retries > 0) {
        try {
            await connectDB();
            connected = true;
        } catch (err) {
            retries -= 1;
            console.log(`🔄 Connection failed. Retries remaining: ${retries}`);
            if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, 5000));
            } else {
                console.error('💥 Could not connect to MongoDB after multiple attempts. Exiting...');
                process.exit(1);
            }
        }
    }

    // Import and start jobs ONLY after DB is connected
    const { startTPIAJobs } = await import('./jobs/tpiaJobs.js');
    startTPIAJobs();

    const { startTradeJobs } = await import('./jobs/tradeJobs.js');
    startTradeJobs();
};

await startServer();

// Start server
const server = app.listen(config.port, () => {
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('🚀 VAULT37 GDIP Backend Server');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`📡 Server running on port: ${config.port}`);
    console.log(`🌍 Environment: ${config.nodeEnv}`);
    console.log(`🔗 API Base URL: http://localhost:${config.port}/api`);
    console.log(`🏥 Health Check: http://localhost:${config.port}/health`);
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('🔒 Security Features Active:');
    console.log('   ✅ Helmet (Security Headers)');
    console.log('   ✅ CORS Protection');
    console.log('   ✅ Rate Limiting');
    console.log('   ✅ NoSQL Injection Prevention');
    console.log('   ✅ XSS Protection');
    console.log('   ✅ HPP Prevention');
    console.log('   ✅ Request Compression');
    console.log('');
    console.log('📋 Available Routes:');
    console.log('   Authentication:');
    console.log('   POST   /api/auth/register');
    console.log('   POST   /api/auth/login');
    console.log('   POST   /api/auth/refresh-token');
    console.log('   POST   /api/auth/logout');
    console.log('   GET    /api/auth/me');
    console.log('');
    console.log('   Wallet:');
    console.log('   GET    /api/wallet');
    console.log('   POST   /api/wallet/deposit');
    console.log('   POST   /api/wallet/withdraw');
    console.log('   GET    /api/wallet/transactions');
    console.log('   POST   /api/wallet/bank-account');
    console.log('');
    console.log('   User:');
    console.log('   PUT    /api/users/profile');
    console.log('   PATCH  /api/users/mode');
    console.log('   GET    /api/users/portfolio');
    console.log('   GET    /api/users/stats');
    console.log('');
    console.log('   Admin:');
    console.log('   GET    /api/admin/dashboard');
    console.log('   GET    /api/admin/deposits/pending');
    console.log('   PATCH  /api/admin/deposits/:id/approve');
    console.log('   GET    /api/admin/withdrawals/pending');
    console.log('   PATCH  /api/admin/withdrawals/:id/approve');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('💥 UNHANDLED REJECTION! Shutting down...');
    console.error('Error:', err.name, err.message);

    // Close server gracefully
    server.close(() => {
        closeDB();
        process.exit(1);
    });
});

// Handle SIGTERM (graceful shutdown)
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received. Shutting down gracefully...');

    server.close(() => {
        console.log('✅ Process terminated');
        closeDB();
    });
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
    console.log('\n👋 SIGINT received. Shutting down gracefully...');

    server.close(() => {
        console.log('✅ Process terminated');
        closeDB();
    });
});

export default server;
