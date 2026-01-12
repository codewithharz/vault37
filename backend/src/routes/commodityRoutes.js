import express from 'express';
import * as commodityController from '../controllers/commodityController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', commodityController.getActiveCommodities);
router.get('/:id', commodityController.getCommodity);
router.get('/:id/history', commodityController.getCommodityHistory);

// Protected Admin routes
router.use(protect);
router.use(authorize('admin'));

router.post('/', commodityController.createCommodity);
router.patch('/:id/nav', commodityController.updateNAV);

export default router;
