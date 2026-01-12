import express from 'express';
import { getSettings, updateSettings, resetSettings } from '../controllers/settingsController.js';
import { protect, authorize } from '../middleware/auth.js';
import audit from '../middleware/auditMiddleware.js';

const router = express.Router();

// All settings routes require admin privileges
router.use(protect);
router.use(authorize('admin'));

router.get('/', getSettings);
router.patch('/', audit('Admin'), updateSettings);
router.post('/reset', audit('Admin'), resetSettings);

export default router;
