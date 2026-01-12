import Transaction from '../models/Transaction.js';
import Wallet from '../models/Wallet.js';
import TPIA from '../models/TPIA.js';
import User from '../models/User.js';
import tradeService from '../services/tradeService.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import * as walletService from '../services/walletService.js';
import * as adminService from '../services/adminService.js';
import * as notificationService from '../services/notificationService.js';
import * as auditService from '../services/auditService.js';

/**
 * @desc    Get pending deposits
 * @route   GET /api/admin/deposits/pending
 * @access  Private/Admin
 */
export const getPendingDeposits = asyncHandler(async (req, res, next) => {
    const deposits = await Transaction.find({
        type: 'deposit',
        status: 'pending',
    })
        .populate('user', 'fullName email phone')
        .sort({ createdAt: -1 })
        .lean();

    res.status(200).json({
        success: true,
        data: {
            deposits,
            count: deposits.length,
        },
    });
});

/**
 * @desc    Get pending KYC submissions
 * @route   GET /api/admin/kyc/pending
 * @access  Private/Admin
 */
export const getPendingKYC = asyncHandler(async (req, res, next) => {
    const users = await User.find({
        kycStatus: 'pending',
    })
        .select('fullName email phone kycDocuments kycStatus createdAt')
        .sort({ 'kycDocuments.submittedAt': -1 })
        .lean();

    res.status(200).json({
        success: true,
        data: {
            users,
            count: users.length,
        },
    });
});

/**
 * @desc    Approve deposit
 * @route   PATCH /api/admin/deposits/:id/approve
 * @access  Private/Admin
 */
export const approveDeposit = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { notes } = req.body;

    const transaction = await Transaction.findById(id);

    if (!transaction) {
        return next(new AppError('Transaction not found', 404));
    }

    if (transaction.type !== 'deposit') {
        return next(new AppError('Transaction is not a deposit', 400));
    }

    if (transaction.status !== 'pending') {
        return next(new AppError('Transaction is not pending', 400));
    }

    // Generate unique reference
    const reference = transaction.reference;

    // Credit wallet
    await walletService.creditWallet(
        transaction.user,
        transaction.amount,
        'deposit',
        `Deposit approved by admin - ${reference}`,
        {
            approvedBy: req.user.id,
            approvedAt: new Date(),
            adminNotes: notes,
        }
    );

    // Update transaction
    transaction.status = 'completed';
    transaction.approvedBy = req.user.id;
    transaction.approvalDate = new Date();
    transaction.notes = notes;
    await transaction.save();

    // Notify user
    await notificationService.createNotification(transaction.user, {
        title: 'Deposit Approved',
        message: `Your deposit of ₦${transaction.amount.toLocaleString()} has been approved and credited to your wallet.`,
        type: 'success',
        metadata: { transactionId: transaction._id }
    });

    // Audit log
    await auditService.logAdminAction({
        adminId: req.user.id,
        action: 'approve_deposit',
        targetType: 'transaction',
        targetId: transaction._id,
        newData: { status: 'completed' },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
    });

    res.status(200).json({
        success: true,
        message: 'Deposit approved and wallet credited successfully',
        data: {
            transaction,
        },
    });
});

/**
 * @desc    Reject deposit
 * @route   PATCH /api/admin/deposits/:id/reject
 * @access  Private/Admin
 */
export const rejectDeposit = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
        return next(new AppError('Rejection reason is required', 400));
    }

    const transaction = await Transaction.findById(id);

    if (!transaction) {
        return next(new AppError('Transaction not found', 404));
    }

    if (transaction.type !== 'deposit') {
        return next(new AppError('Transaction is not a deposit', 400));
    }

    if (transaction.status !== 'pending') {
        return next(new AppError('Transaction is not pending', 400));
    }

    // Update transaction
    transaction.status = 'cancelled';
    transaction.approvedBy = req.user.id;
    transaction.approvalDate = new Date();
    transaction.failureReason = reason;
    await transaction.save();

    // Notify user
    await notificationService.createNotification(transaction.user, {
        title: 'Deposit Rejected',
        message: `Your deposit request was rejected. Reason: ${reason}`,
        type: 'warning',
        metadata: { transactionId: transaction._id }
    });

    // Audit log
    await auditService.logAdminAction({
        adminId: req.user.id,
        action: 'reject_deposit',
        targetType: 'transaction',
        targetId: transaction._id,
        newData: { status: 'cancelled', failureReason: reason },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
    });

    res.status(200).json({
        success: true,
        message: 'Deposit rejected successfully',
        data: {
            transaction,
        },
    });
});

/**
 * @desc    Get pending withdrawals
 * @route   GET /api/admin/withdrawals/pending
 * @access  Private/Admin
 */
export const getPendingWithdrawals = asyncHandler(async (req, res, next) => {
    const withdrawals = await Transaction.find({
        type: 'withdrawal',
        status: 'pending',
    })
        .populate('user', 'fullName email phone')
        .sort({ createdAt: -1 })
        .lean();

    res.status(200).json({
        success: true,
        data: {
            withdrawals,
            count: withdrawals.length,
        },
    });
});

/**
 * @desc    Approve withdrawal
 * @route   PATCH /api/admin/withdrawals/:id/approve
 * @access  Private/Admin
 */
export const approveWithdrawal = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { notes } = req.body;

    const transaction = await Transaction.findById(id);

    if (!transaction) {
        return next(new AppError('Transaction not found', 404));
    }

    if (transaction.type !== 'withdrawal') {
        return next(new AppError('Transaction is not a withdrawal', 400));
    }

    if (transaction.status !== 'pending') {
        return next(new AppError('Transaction is not pending', 400));
    }

    // Complete withdrawal (permanent deduction from both pending and actual balance)
    await walletService.completeWithdrawal(transaction.user, transaction.amount);

    // Update transaction
    transaction.status = 'completed';
    transaction.approvedBy = req.user.id;
    transaction.approvalDate = new Date();
    transaction.notes = notes;
    await transaction.save();

    // Notify user
    await notificationService.createNotification(transaction.user, {
        title: 'Withdrawal Approved',
        message: `Your withdrawal request of ₦${transaction.amount.toLocaleString()} has been approved and processed.`,
        type: 'success',
        metadata: { transactionId: transaction._id }
    });

    // Audit log
    await auditService.logAdminAction({
        adminId: req.user.id,
        action: 'approve_withdrawal',
        targetType: 'transaction',
        targetId: transaction._id,
        newData: { status: 'completed' },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
    });

    res.status(200).json({
        success: true,
        message: 'Withdrawal approved and wallet debited successfully',
        data: {
            transaction,
            bankAccount: transaction.metadata.bankAccount,
        },
    });
});

/**
 * @desc    Reject withdrawal
 * @route   PATCH /api/admin/withdrawals/:id/reject
 * @access  Private/Admin
 */
export const rejectWithdrawal = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
        return next(new AppError('Rejection reason is required', 400));
    }

    const transaction = await Transaction.findById(id);

    if (!transaction) {
        return next(new AppError('Transaction not found', 404));
    }

    if (transaction.type !== 'withdrawal') {
        return next(new AppError('Transaction is not a withdrawal', 400));
    }

    if (transaction.status !== 'pending') {
        return next(new AppError('Transaction is not pending', 400));
    }

    // Unlock balance (returns from pending to available)
    await walletService.unlockBalanceForWithdrawal(transaction.user, transaction.amount);

    // Update transaction
    transaction.status = 'cancelled';
    transaction.approvedBy = req.user.id;
    transaction.approvalDate = new Date();
    transaction.failureReason = reason;
    await transaction.save();

    // Notify user
    await notificationService.createNotification(transaction.user, {
        title: 'Withdrawal Rejected',
        message: `Your withdrawal request of ₦${transaction.amount.toLocaleString()} was rejected. Reason: ${reason}. Your funds have been returned to your wallet.`,
        type: 'warning',
        metadata: { transactionId: transaction._id }
    });

    // Audit log
    await auditService.logAdminAction({
        adminId: req.user.id,
        action: 'reject_withdrawal',
        targetType: 'transaction',
        targetId: transaction._id,
        newData: { status: 'cancelled', failureReason: reason },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
    });

    res.status(200).json({
        success: true,
        message: 'Withdrawal rejected successfully',
        data: {
            transaction,
        },
    });
});

/**
 * @desc    Get admin dashboard statistics
 * @route   GET /api/admin/dashboard
 * @access  Private/Admin
 */
export const getDashboardStats = asyncHandler(async (req, res, next) => {
    const stats = await adminService.getAdminDashboardStats();

    res.status(200).json({
        success: true,
        data: stats,
    });
});

/**
 * @desc    Get financial report
 * @route   GET /api/admin/reports/financial
 * @access  Private/Admin
 */
export const getFinancialReport = asyncHandler(async (req, res, next) => {
    const { startDate, endDate, type } = req.query;
    const report = await adminService.getFinancialReport({ startDate, endDate, type });

    res.status(200).json({
        success: true,
        data: report,
    });
});

/**
 * @desc    Export report as CSV
 * @route   GET /api/admin/reports/export
 * @access  Private/Admin
 */
export const exportReport = asyncHandler(async (req, res, next) => {
    const { startDate, endDate, type } = req.query;

    // 1. Get report data
    const report = await adminService.getFinancialReport({ startDate, endDate, type });

    // 2. Generate CSV
    const csvData = adminService.generateCSV(report, type);

    // 3. Set headers for file download
    const filename = `report_${type || 'general'}_${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

    res.status(200).send(csvData);
});

/**
 * @desc    Update insurance certificate for TPIA
 * @route   PATCH /api/admin/tpia/:id/insurance
 * @access  Private/Admin
 */
export const updateInsuranceCertificate = asyncHandler(async (req, res, next) => {
    const { insuranceCertificateUrl, insurancePolicyNumber } = req.body;
    const { id } = req.params;

    const tpia = await TPIA.findById(id);
    if (!tpia) {
        throw new AppError('TPIA not found', 404);
    }

    if (insuranceCertificateUrl) tpia.insuranceCertificateUrl = insuranceCertificateUrl;
    if (insurancePolicyNumber) tpia.insurancePolicyNumber = insurancePolicyNumber;

    await tpia.save();

    res.status(200).json({
        success: true,
        message: 'Insurance information updated successfully',
        data: tpia,
    });
});

/**
 * @desc    Trigger manual cycle start for GDC
 * @route   POST /api/admin/cycles/gdc/:id/start
 * @access  Private/Admin
 */
export const startGDCCycle = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const gdc = await tradeService.startGDC(id);

    res.status(200).json({
        success: true,
        message: 'GDC cycle started successfully',
        data: gdc,
    });
});

/**
 * @desc    Process manual cycle completion for GDC
 * @route   POST /api/admin/cycles/gdc/:id/complete
 * @access  Private/Admin
 */
export const completeGDCCycle = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const gdc = await tradeService.processCycleCompletion(id);

    res.status(200).json({
        success: true,
        message: 'GDC cycle processed successfully',
        data: gdc,
    });
});

/**
 * @desc    Get all users with filtering and search
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
export const getUsers = asyncHandler(async (req, res, next) => {
    const { search, status, role, page = 1, limit = 10 } = req.query;
    const query = {};

    // Search by name or email
    if (search) {
        query.$or = [
            { fullName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
        ];
    }

    // Filter by status
    if (status) query.kycStatus = status;

    // Filter by role
    if (role) query.role = role;

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
        User.find(query)
            .select('-password -refreshTokens')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit)),
        User.countDocuments(query),
    ]);

    res.status(200).json({
        success: true,
        data: {
            users,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit),
            },
        },
    });
});

/**
 * @desc    Get detailed user profile
 * @route   GET /api/admin/users/:id
 * @access  Private/Admin
 */
export const getUserById = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id)
        .select('-password -refreshTokens')
        .populate('wallet');

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // Get user TPIAs
    const tpias = await TPIA.find({ userId: user._id }).sort({ createdAt: -1 });

    // Get recent transactions
    const transactions = await Transaction.find({ user: user._id })
        .sort({ createdAt: -1 })
        .limit(10);

    res.status(200).json({
        success: true,
        data: {
            user,
            tpias,
            transactions,
        },
    });
});
/**
 * @desc    Update user status (ban/unban)
 * @route   PATCH /api/admin/users/:id/status
 * @access  Private/Admin
 */
export const updateUserStatus = asyncHandler(async (req, res, next) => {
    const { isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // Prevent banning self
    if (user._id.toString() === req.user.id) {
        return next(new AppError('Cannot change your own status', 400));
    }

    user.isActive = isActive;
    await user.save();

    await auditService.logAdminAction({
        adminId: req.user.id,
        action: isActive ? 'activate_user' : 'deactivate_user',
        targetType: 'user',
        targetId: user._id,
        newData: { isActive },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
    });

    res.status(200).json({
        success: true,
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        data: { user }
    });
});

/**
 * @desc    Update user role
 * @route   PATCH /api/admin/users/:id/role
 * @access  Private/Admin
 */
export const updateUserRole = asyncHandler(async (req, res, next) => {
    const { role } = req.body;

    if (!['user', 'admin', 'auditor', 'accountant'].includes(role)) {
        return next(new AppError('Invalid role', 400));
    }

    const user = await User.findById(req.params.id);
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // Prevent changing own role
    if (user._id.toString() === req.user.id) {
        return next(new AppError('Cannot change your own role', 400));
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    await auditService.logAdminAction({
        adminId: req.user.id,
        action: 'change_user_role',
        targetType: 'user',
        targetId: user._id,
        newData: { role },
        oldData: { role: oldRole },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
    });

    res.status(200).json({
        success: true,
        message: `User role updated to ${role} successfully`,
        data: { user }
    });
});

/**
 * @desc    Update user profile details
 * @route   PATCH /api/admin/users/:id
 * @access  Private/Admin
 */
export const updateUserProfile = asyncHandler(async (req, res, next) => {
    const { fullName, phone } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    const oldData = { fullName: user.fullName, phone: user.phone };

    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;

    await user.save();

    await auditService.logAdminAction({
        adminId: req.user.id,
        action: 'update_user_profile',
        targetType: 'user',
        targetId: user._id,
        newData: { fullName, phone },
        oldData,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
    });

    res.status(200).json({
        success: true,
        message: 'User profile updated successfully',
        data: { user }
    });
});

/**
 * @desc    Delete user
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
export const deleteUser = asyncHandler(async (req, res, next) => {
    const { force } = req.query; // Expect ?force=true
    const user = await User.findById(req.params.id);
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // Prevent deleting self
    if (user._id.toString() === req.user.id) {
        return next(new AppError('Cannot delete your own account', 400));
    }

    // Check balances if not forced
    await user.populate('wallet');
    const hasFunds = user.wallet && (user.wallet.balance > 0 || user.wallet.lockedBalance > 0);

    if (hasFunds && force !== 'true') {
        return next(new AppError('User has active funds or investments. Use force delete to proceed.', 400));
    }

    // Delete User
    await User.findByIdAndDelete(req.params.id);

    // Clean up related data
    if (user.wallet) {
        await Wallet.findByIdAndDelete(user.wallet._id);
    }

    // Also cleanup TPIAs and Transactions if forcing (or just always cleanup to avoid orphans)
    // It's good practice to clean up children when parent is deleted in this context
    await TPIA.deleteMany({ userId: user._id });
    await Transaction.deleteMany({ user: user._id });

    await auditService.logAdminAction({
        adminId: req.user.id,
        action: 'delete_user',
        targetType: 'user',
        targetId: user._id,
        oldData: {
            email: user.email,
            name: user.fullName,
            walletBalance: user.wallet?.balance,
            forced: force === 'true'
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
    });

    res.status(200).json({
        success: true,
        message: 'User and all associated data deleted successfully'
    });
});
