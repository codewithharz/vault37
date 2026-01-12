import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
    getGDCs,
    getGDCDetails,
    getGDCStats,
    updateGDCStatus
} from '../controllers/gdcController.js';

const router = express.Router();

// All routes are protected and admin-only for now
router.use(protect);
router.use(authorize('admin'));

router.get('/', getGDCs);
router.get('/stats', getGDCStats);
router.get('/:id', getGDCDetails);
router.patch('/:id/status', updateGDCStatus);

export default router;
