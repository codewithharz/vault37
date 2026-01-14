import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5001,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',

  // Database
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/vault37_db',

  // JWT
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpire: process.env.JWT_ACCESS_EXPIRE || '15m',
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',
  },

  // Security
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,
  maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS, 10) || 5,
  lockoutDuration: parseInt(process.env.LOCKOUT_DURATION, 10) || 900000, // 15 minutes

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 10000, // Increased for dev
    authMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 10000, // Increased for dev
  },

  // Email (optional for now)
  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM || 'noreply@vault37.com',
  },

  // Paystack (payment gateway)
  paystack: {
    secretKey: process.env.PAYSTACK_SECRET_KEY,
    publicKey: process.env.PAYSTACK_PUBLIC_KEY,
    callbackUrl: process.env.PAYSTACK_CALLBACK_URL || 'http://localhost:5001/api/wallet/paystack/callback',
  },
};

// Validate critical environment variables
const validateConfig = () => {
  const required = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'MONGODB_URI'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }
};

// Only validate in production
if (config.nodeEnv === 'production') {
  validateConfig();
}

export default config;
