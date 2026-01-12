import express from 'express';
import morgan from 'morgan';
import compression from 'compression';
import config from './config/env.js';
import {
    helmetConfig,
    corsConfig,
    globalLimiter,
    authLimiter,
    purchaseLimiter,
    sanitizeData,
    preventPollution,
    xssProtection,
} from './middleware/security.js';
import errorHandler from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import AppError from './utils/AppError.js';

// Initialize Express app
const app = express();

// Trust proxy (important for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Set security HTTP headers
app.use(helmetConfig);

// Enable CORS
app.use(corsConfig);

// Global rate limiting
app.use(globalLimiter);

// ============================================
// BODY PARSING & COMPRESSION
// ============================================

// Body parser (limit request size to prevent DoS)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compress responses
app.use(compression());

// ============================================
// DATA SANITIZATION
// ============================================

// Sanitize data against NoSQL injection
app.use(sanitizeData);

// Prevent XSS attacks
app.use(xssProtection);

// Prevent HTTP parameter pollution
app.use(preventPollution);

// ============================================
// LOGGING
// ============================================

// Development logging
if (config.nodeEnv === 'development') {
    app.use(morgan('dev'));
}

// Production logging (combined format)
if (config.nodeEnv === 'production') {
    app.use(morgan('combined'));
}

// ============================================
// ROUTES
// ============================================

// Serve static files
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
    });
});

// API routes
app.use('/api/auth', authRoutes);

// Import other routes
import walletRoutes from './routes/walletRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import tpiaRoutes from './routes/tpiaRoutes.js';
import gdcRoutes from './routes/gdcRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import commodityRoutes from './routes/commodityRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';

app.use('/api/wallet', walletRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tpia', purchaseLimiter, tpiaRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/commodities', commodityRoutes);
app.use('/api/gdc', gdcRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);

// 404 handler - must use a middleware function instead of app.all
app.use((req, res, next) => {
    next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

// ============================================
// ERROR HANDLING
// ============================================

// Global error handler (must be last)
app.use(errorHandler);

export default app;
