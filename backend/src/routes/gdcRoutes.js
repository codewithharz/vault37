import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
    getGDCs,
    getGDCDetails,
    getGDCStats,
    updateGDCStatus,
    getUserGDCParticipation
} from '../controllers/gdcController.js';

const router = express.Router();

// User-accessible routes (protected but not admin-only)
router.get('/user-participation', protect, getUserGDCParticipation);

// All routes below are protected and admin-only
router.use(protect);
router.use(authorize('admin'));

router.get('/', getGDCs);
router.get('/stats', getGDCStats);
router.get('/:id', getGDCDetails);
router.patch('/:id/status', updateGDCStatus);

export default router;

