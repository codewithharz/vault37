import express from 'express';
import {
    updateProfile,
    switchMode,
    getUserStats,
} from '../controllers/userController.js';
import { submitKYC } from '../controllers/kycController.js';
import { getUserPortfolio } from '../controllers/portfolioController.js';
import { protect } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import upload from '../middleware/upload.js';
import {
    updateProfileSchema,
    switchModeSchema,
} from '../validators/userValidators.js';

const router = express.Router();

// All user routes require authentication
router.use(protect);

// Profile management
router.put('/profile', validate(updateProfileSchema), updateProfile);
router.patch('/mode', validate(switchModeSchema), switchMode);

// User statistics
router.get('/portfolio', getUserPortfolio);
router.get('/stats', getUserStats);

// KYC submission
router.post('/kyc', upload.single('document'), submitKYC);

export default router;
