import User from '../models/User.js';
import TPIA from '../models/TPIA.js';
import Wallet from '../models/Wallet.js';
import GDC from '../models/GDC.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { getUserPortfolio } from '../services/portfolioService.js';
import { TPIA_STATUS } from '../config/constants.js';

/**
 * @desc    Get user profile with comprehensive stats
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getUserProfile = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;

    // Get user with wallet
    const user = await User.findById(userId).select('-password -refreshTokens');
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // Get wallet
    const wallet = await Wallet.findOne({ userId });

    // Get TPIAs for stats
    const tpias = await TPIA.find({ userId, status: { $ne: TPIA_STATUS.CANCELLED } });

    // Calculate stats
    const totalTPIAs = tpias.length;
    const activeTPIAs = tpias.filter(t => t.status === TPIA_STATUS.ACTIVE || t.status === 'cycling').length;
    const maturedTPIAs = tpias.filter(t => t.status === TPIA_STATUS.MATURED).length;

    // Calculate total invested and profit
    const totalInvested = tpias.reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalProfitEarned = tpias.reduce((sum, t) => {
        const profit = t.profitHistory ? t.profitHistory.reduce((p, h) => p + (h.amount || 0), 0) : 0;
        return sum + profit;
    }, 0);

    // Calculate current portfolio value
    const currentValue = totalInvested + totalProfitEarned;

    // Count active cycles (TPIAs that are cycling)
    const activeCycles = tpias.filter(t =>
        t.status === 'cycling' || (t.status === TPIA_STATUS.ACTIVE && t.currentCycle > 0)
    ).length;

    // Get achievements (basic implementation)
    const achievements = [];

    // First Investment
    if (totalTPIAs >= 1) {
        achievements.push({
            id: 'first_investment',
            name: 'First Investment',
            description: 'Made your first TPIA investment',
            icon: '🎯',
            unlockedAt: tpias[0]?.createdAt
        });
    }

    // 5 TPIAs Milestone
    if (totalTPIAs >= 5) {
        achievements.push({
            id: 'five_tpias',
            name: '5 TPIAs Milestone',
            description: 'Reached 5 active investments',
            icon: '⭐',
            unlockedAt: tpias[4]?.createdAt
        });
    }

    // 10 TPIAs Milestone
    if (totalTPIAs >= 10) {
        achievements.push({
            id: 'ten_tpias',
            name: '10 TPIAs Milestone',
            description: 'Reached 10 active investments',
            icon: '💎',
            unlockedAt: tpias[9]?.createdAt
        });
    }

    // First Matured TPIA
    if (maturedTPIAs >= 1) {
        const firstMatured = tpias.find(t => t.status === TPIA_STATUS.MATURED);
        achievements.push({
            id: 'first_matured',
            name: 'First Matured TPIA',
            description: 'Completed your first investment cycle',
            icon: '🏆',
            unlockedAt: firstMatured?.maturityDate
        });
    }

    // Verified Investor (KYC verified)
    if (user.kycStatus === 'verified') {
        achievements.push({
            id: 'verified_investor',
            name: 'Verified Investor',
            description: 'Completed KYC verification',
            icon: '✓',
            unlockedAt: user.kycDocuments?.verifiedAt
        });
    }

    res.status(200).json({
        success: true,
        data: {
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                kycStatus: user.kycStatus,
                mode: user.mode,
                referralCode: user.referralCode,
                referredBy: user.referredBy,
                createdAt: user.createdAt,
                address: user.address,
                dateOfBirth: user.dateOfBirth
            },
            stats: {
                totalPortfolioValue: currentValue,
                totalTPIAs,
                activeCycles,
                totalProfitEarned,
                totalInvested,
                activeTPIAs,
                maturedTPIAs,
                walletBalance: wallet?.balance || 0,
                earningsBalance: wallet?.earningsBalance || 0,
                lockedBalance: wallet?.lockedBalance || 0
            },
            achievements
        }
    });
});

/**
 * @desc    Get user referral data
 * @route   GET /api/users/referrals
 * @access  Private
 */
export const getUserReferrals = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;

    // Get user's referral code
    const user = await User.findById(userId).select('referralCode');
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // Find all users referred by this user
    const referredUsers = await User.find({ referredBy: userId })
        .select('createdAt isActive')
        .lean();

    // Get TPIAs for referred users to check if they're active investors
    const referredUserIds = referredUsers.map(u => u._id);
    const referredUserTPIAs = await TPIA.aggregate([
        { $match: { userId: { $in: referredUserIds } } },
        { $group: { _id: '$userId', count: { $sum: 1 } } }
    ]);

    // Create a map of user ID to TPIA count
    const tpiaCountMap = {};
    referredUserTPIAs.forEach(item => {
        tpiaCountMap[item._id.toString()] = item.count;
    });

    // Format referred users data
    const formattedReferrals = referredUsers.map(u => ({
        joinDate: u.createdAt,
        status: u.isActive ? 'active' : 'inactive',
        hasTPIA: (tpiaCountMap[u._id.toString()] || 0) > 0,
        earnings: 0 // Placeholder for future referral earnings feature
    }));

    const totalReferrals = referredUsers.length;
    const activeReferrals = formattedReferrals.filter(r => r.hasTPIA).length;

    res.status(200).json({
        success: true,
        data: {
            referralCode: user.referralCode,
            totalReferrals,
            activeReferrals,
            referralEarnings: 0, // Placeholder for future feature
            referredUsers: formattedReferrals
        }
    });
});

/**
 * @desc    Get user activity feed
 * @route   GET /api/users/activity
 * @access  Private
 */
export const getUserActivity = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;
    const type = req.query.type; // Optional filter by type

    // Build activity from multiple sources
    const activities = [];

    // Get recent TPIAs
    const tpiaQuery = { userId };
    const recentTPIAs = await TPIA.find(tpiaQuery)
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('commodityId', 'name symbol')
        .lean();

    recentTPIAs.forEach(tpia => {
        activities.push({
            type: 'tpia_purchase',
            description: `Purchased ${tpia.commodityId?.name || 'commodity'} TPIA`,
            amount: tpia.amount,
            timestamp: tpia.createdAt,
            metadata: {
                tpiaNumber: tpia.tpiaNumber,
                commodity: tpia.commodityId?.name,
                symbol: tpia.commodityId?.symbol
            }
        });
    });

    // Get recent transactions
    const transactionQuery = { user: userId };
    if (type && ['deposit', 'withdrawal', 'cycle_profit'].includes(type)) {
        transactionQuery.type = type;
    }

    const recentTransactions = await Transaction.find(transactionQuery)
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

    recentTransactions.forEach(txn => {
        let description = '';
        switch (txn.type) {
            case 'deposit':
                description = 'Deposited funds to wallet';
                break;
            case 'withdrawal':
                description = 'Withdrew funds from wallet';
                break;
            case 'cycle_profit':
                description = 'Received cycle profit';
                break;
            case 'tpia_purchase':
                description = 'Purchased TPIA';
                break;
            default:
                description = 'Transaction';
        }

        activities.push({
            type: txn.type,
            description,
            amount: txn.amount,
            timestamp: txn.createdAt,
            metadata: {
                reference: txn.reference,
                status: txn.status
            }
        });
    });

    // Sort all activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Apply limit
    const limitedActivities = activities.slice(0, limit);

    res.status(200).json({
        success: true,
        data: {
            activities: limitedActivities,
            total: activities.length
        }
    });
});

/**
 * @desc    Get user notifications with unread count
 * @route   GET /api/users/notifications
 * @access  Private
 */
export const getUserNotifications = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;
    const unreadOnly = req.query.unread === 'true';
    const type = req.query.type; // Optional filter by type

    // Build query
    const query = { userId };
    if (unreadOnly) {
        query.isRead = false;
    }
    if (type) {
        query.type = type;
    }

    // Get notifications
    const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

    // Get unread count
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    res.status(200).json({
        success: true,
        data: {
            notifications,
            unreadCount,
            total: notifications.length
        }
    });
});
