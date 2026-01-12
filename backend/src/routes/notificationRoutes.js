import express from 'express';
import * as notificationController from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', notificationController.getMyNotifications);
router.patch('/:id/read', notificationController.markRead);
router.post('/read-all', notificationController.markAllRead);

export default router;
