import express from 'express';
import {
    purchaseTPIA,
    getMyTPIAs,
    getTPIADetails,
    getPendingTPIAs,
    adminApproveTPIA,
    adminRejectTPIA,
    withdrawTPIA,
    getAdminTPIAs,
} from '../controllers/tpiaController.js';
import { protect, authorize } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import audit from '../middleware/auditMiddleware.js';
import {
    purchaseTPIASchema,
    approvalSchema,
    rejectionSchema,
} from '../validators/tpiaValidators.js';

const router = express.Router();

router.use(protect);

router.post('/purchase', audit('TPIA'), validate(purchaseTPIASchema), purchaseTPIA);
router.post('/:id/withdraw', audit('TPIA'), withdrawTPIA);
router.get('/my-tpias', getMyTPIAs);
router.get('/:id', getTPIADetails);

// Admin routes
router.get('/admin/all', authorize('admin'), getAdminTPIAs);
router.get('/admin/pending', authorize('admin'), getPendingTPIAs);
router.patch('/admin/:id/approve', authorize('admin'), audit('TPIA'), validate(approvalSchema), adminApproveTPIA);
router.patch('/admin/:id/reject', authorize('admin'), audit('TPIA'), validate(rejectionSchema), adminRejectTPIA);

export default router;
