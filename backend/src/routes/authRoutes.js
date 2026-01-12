import express from 'express';
import {
    register,
    login,
    refreshToken,
    logout,
    getMe,
    forgotPassword,
    resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/security.js';
import validate from '../middleware/validate.js';
import {
    registerSchema,
    loginSchema,
    refreshTokenSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
} from '../validators/authValidators.js';

const router = express.Router();

// Public routes with rate limiting
router.post(
    '/register',
    authLimiter,
    validate(registerSchema),
    register
);

router.post(
    '/login',
    authLimiter,
    validate(loginSchema),
    login
);

router.post(
    '/refresh-token',
    validate(refreshTokenSchema),
    refreshToken
);

router.post(
    '/forgot-password',
    authLimiter,
    validate(forgotPasswordSchema),
    forgotPassword
);

router.post(
    '/reset-password',
    authLimiter,
    validate(resetPasswordSchema),
    resetPassword
);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

export default router;
