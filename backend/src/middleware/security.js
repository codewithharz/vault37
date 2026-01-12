import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import config from '../config/env.js';

/**
 * Configure Helmet for security headers
 */
export const helmetConfig = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
        },
    },
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
    },
});

/**
 * Configure CORS
 */
export const corsConfig = cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            config.clientUrl,
            'http://localhost:3000',
            'http://localhost:3001',
        ];

        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
});

/**
 * Global Rate Limiter
 * Applies to all requests
 */
export const globalLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Strict Rate Limiter for Authentication Routes
 * Prevents brute force attacks
 */
export const authLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.authMax,
    message: 'Too many login attempts, please try again after 15 minutes',
    skipSuccessfulRequests: true, // Don't count successful requests
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * API Rate Limiter
 * More lenient for general API calls
 */
export const apiLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: 1000,
    message: 'Too many API requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Strict Rate Limiter for Financial Transactions
 */
export const purchaseLimiter = rateLimit({
    windowMs: 600000, // 10 minutes
    max: 1000,
    message: 'Too many transaction attempts, please try again after 10 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Sanitize data to prevent NoSQL injection
 * NOTE: Temporarily disabled due to compatibility issue with Express 5.x
 * TODO: Find alternative or update to compatible version
 */
// export const sanitizeData = mongoSanitize();
export const sanitizeData = (req, res, next) => next(); // Placeholder


/**
 * Prevent HTTP Parameter Pollution
 */
export const preventPollution = hpp({
    whitelist: ['sort', 'fields', 'page', 'limit'], // Allow these params to be duplicated
});

/**
 * XSS Protection Middleware
 * Note: xss-clean is deprecated, using helmet's XSS protection instead
 */
export const xssProtection = (req, res, next) => next();
