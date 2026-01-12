import express from 'express';
import {
    getPendingDeposits,
    approveDeposit,
    rejectDeposit,
    getPendingWithdrawals,
    approveWithdrawal,
    rejectWithdrawal,
    getDashboardStats,
    getFinancialReport,
    exportReport,
    updateInsuranceCertificate,
    startGDCCycle,
    completeGDCCycle,
    getUsers,
    getUserById,
    updateUserStatus,
    updateUserRole,
    getPendingKYC,
    updateUserProfile,
    deleteUser,
} from '../controllers/adminController.js';
import { reviewKYC } from '../controllers/kycController.js';
import { protect, authorize } from '../middleware/auth.js';
import audit from '../middleware/auditMiddleware.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Dashboard & Reports
router.get('/dashboard', getDashboardStats);
router.get('/reports/financial', getFinancialReport);
router.get('/reports/export', exportReport);

// Deposit management
router.get('/deposits/pending', getPendingDeposits);
router.patch('/deposits/:id/approve', audit('Admin'), approveDeposit);
router.patch('/deposits/:id/reject', audit('Admin'), rejectDeposit);

// User/KYC management
// User/KYC management
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id/status', audit('Admin'), updateUserStatus);
router.patch('/users/:id/role', audit('Admin'), updateUserRole);
router.patch('/users/:id', audit('Admin'), updateUserProfile);
router.delete('/users/:id', audit('Admin'), deleteUser);
router.get('/kyc/pending', getPendingKYC);
router.patch('/users/:id/kyc', audit('Admin'), reviewKYC);

// Withdrawal management
router.get('/withdrawals/pending', getPendingWithdrawals);
router.patch('/withdrawals/:id/approve', audit('Admin'), approveWithdrawal);
router.patch('/withdrawals/:id/reject', audit('Admin'), rejectWithdrawal);

// TPIA/Insurance management
router.patch('/tpia/:id/insurance', audit('Admin'), updateInsuranceCertificate);

// Cycle management
router.post('/cycles/gdc/:id/start', audit('Trade'), startGDCCycle);
router.post('/cycles/gdc/:id/complete', audit('Trade'), completeGDCCycle);

export default router;
