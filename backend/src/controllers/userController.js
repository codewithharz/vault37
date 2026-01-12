import User from '../models/User.js';
import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import * as notificationService from '../services/notificationService.js';
import * as auditService from '../services/auditService.js';
import { calculateBalances } from '../services/walletService.js';

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res, next) => {
    const { fullName, phone } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // Update fields if provided
    if (fullName) user.fullName = fullName;
    if (phone) {
        // Strip spaces and hyphens
        const prefix = phone.startsWith('+') ? '+' : '';
        const numeric = phone.replace(/[^\d]/g, '');
        user.phone = prefix === '+' ? `+${numeric}` : numeric;
    }

    await user.save();

    // Remove password from output
    user.password = undefined;

    res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
            user,
        },
    });
});

/**
 * @desc    Switch TPM/EPS mode
 * @route   PATCH /api/users/mode
 * @access  Private
 */
export const switchMode = asyncHandler(async (req, res, next) => {
    const { mode } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    const previousMode = user.mode;
    user.mode = mode;

    await user.save();

    // Notify user
    await notificationService.createNotification(user._id, {
        title: 'Investment Mode Changed',
        message: `Your account has been switched to ${mode} mode. This will apply to all future cycle completions.`,
        type: 'info',
    });

    // Audit log
    await auditService.logAdminAction({
        adminId: user._id, // User acting on themselves
        action: 'switch_mode',
        targetType: 'user',
        targetId: user._id,
        previousData: { mode: previousMode },
        newData: { mode },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
    });

    res.status(200).json({
        success: true,
        message: `Mode switched from ${previousMode} to ${mode} successfully. This will apply to future cycle profits.`,
        data: {
            previousMode,
            currentMode: mode,
        },
    });
});

/**
 * @desc    Get user statistics
 * @route   GET /api/users/stats
 * @access  Private
 */
export const getUserStats = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;

    // Get wallet
    const wallet = await Wallet.findOne({ userId });

    if (!wallet) {
        return next(new AppError('Wallet not found', 404));
    }

    // Calculate balances
    const balances = calculateBalances(wallet);

    // Get transaction statistics
    const [
        totalDeposits,
        totalWithdrawals,
        totalProfits,
        pendingTransactions,
    ] = await Promise.all([
        Transaction.aggregate([
            { $match: { user: userId, type: 'deposit', status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
        ]),
        Transaction.aggregate([
            { $match: { user: userId, type: 'withdrawal', status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
        ]),
        Transaction.aggregate([
            { $match: { user: userId, type: 'cycle_profit', status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
        ]),
        Transaction.countDocuments({ user: userId, status: 'pending' }),
    ]);

    res.status(200).json({
        success: true,
        data: {
            wallet: balances,
            transactions: {
                deposits: {
                    total: totalDeposits[0]?.total || 0,
                    count: totalDeposits[0]?.count || 0,
                },
                withdrawals: {
                    total: totalWithdrawals[0]?.total || 0,
                    count: totalWithdrawals[0]?.count || 0,
                },
                profits: {
                    total: totalProfits[0]?.total || 0,
                    count: totalProfits[0]?.count || 0,
                },
                pending: pendingTransactions,
            },
            user: {
                mode: req.user.mode,
                kycStatus: req.user.kycStatus,
                referralCode: req.user.referralCode,
            },
        },
    });
});
