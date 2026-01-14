import TPIA from '../models/TPIA.js';
import GDC from '../models/GDC.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Wallet from '../models/Wallet.js';
import { TPIA_STATUS, GDC_STATUS, PLATFORM_ECONOMICS, TPIA_CONSTANTS, REPORT_TYPES } from '../config/constants.js';

import configService from './configService.js';

/**
 * Get dashboard stats for administrators
 * Provides high-level metrics on investment, users, and platform health
 */
export const getAdminDashboardStats = async () => {
    const [
        totalUsers,
        totalInvested,
        activeTPIAs,
        maturedTPIAs,
        activeGDCs,
        pendingDeposits,
        pendingWithdrawals,
        totalRevenue,
        transactionTotals,
        penaltyRevenue,
        settings,
    ] = await Promise.all([
        User.countDocuments({ role: 'user' }),
        TPIA.aggregate([
            { $match: { status: { $in: [TPIA_STATUS.ACTIVE, TPIA_STATUS.MATURED, TPIA_STATUS.COMPLETED] } } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        TPIA.countDocuments({ status: TPIA_STATUS.ACTIVE }),
        TPIA.countDocuments({ status: TPIA_STATUS.MATURED }),
        GDC.countDocuments({ status: GDC_STATUS.FILLING }),
        Transaction.countDocuments({ type: 'deposit', status: 'pending' }),
        Transaction.countDocuments({ type: 'withdrawal', status: 'pending' }),
        TPIA.aggregate([
            { $match: { status: TPIA_STATUS.COMPLETED } },
            { $group: { _id: null, total: { $sum: '$profitAmount' } } },
        ]),
        Transaction.aggregate([
            { $match: { status: 'completed' } },
            {
                $group: {
                    _id: '$type',
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]),
        TPIA.aggregate([
            { $match: { exitPenaltyApplied: true } },
            { $group: { _id: null, total: { $sum: '$penaltyAmount' } } }
        ]),
        configService.getSettings()
    ]);

    // Format transaction totals
    const trxStats = {
        deposits: transactionTotals.find(t => t._id === 'deposit') || { total: 0, count: 0 },
        withdrawals: transactionTotals.find(t => t._id === 'withdrawal') || { total: 0, count: 0 },
        profits: transactionTotals.find(t => t._id === 'cycle_profit') || { total: 0, count: 0 },
    };

    // Platform Profit Modeling (Based on Dynamic Settings)
    const { tpia: tpiaConfig, economics } = settings;
    const PROFIT_PER_TPIA = tpiaConfig.profitAmount;
    const INVESTMENT_PER_TPIA = tpiaConfig.investmentAmount;

    // Cycle Gross Yield = Principal * CycleYieldMultiplier
    // e.g., 1M * 12.96% = 129,688
    // Helper to get cycle yield based on 37-day cycle
    const cycleYieldMultiplier = (economics.monthlyMarginPercent / 100) * (tpiaConfig.cycleDurationDays / 30);
    const estGrossPerCycle = INVESTMENT_PER_TPIA * cycleYieldMultiplier;

    // Multiplier for Dashboard (based on investor payout)
    // estGrossRevenue = payout * (estGrossPerCycle / PROFIT_PER_TPIA)
    const PROFIT_MULTIPLIER_GROSS = estGrossPerCycle / PROFIT_PER_TPIA;
    const PROFIT_MULTIPLIER_NET = (estGrossPerCycle - PROFIT_PER_TPIA) / PROFIT_PER_TPIA;

    const investorPayoutTotal = totalRevenue[0]?.total || 0;
    const estGrossRevenue = investorPayoutTotal * PROFIT_MULTIPLIER_GROSS;
    const estNetProfit = investorPayoutTotal * PROFIT_MULTIPLIER_NET;
    const actualPenaltyRevenue = penaltyRevenue[0]?.total || 0;

    // TVL is balance + lockedBalance of all wallets
    const walletStats = await Wallet.aggregate([
        {
            $group: {
                _id: null,
                totalBalance: { $sum: '$balance' },
                totalEarnings: { $sum: '$earningsBalance' },
                totalLocked: { $sum: '$lockedBalance' },
            },
        },
    ]);

    const stats = walletStats[0] || { totalBalance: 0, totalEarnings: 0, totalLocked: 0 };

    // Recent Activity Aggregation
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).lean();
    const recentTransactions = await Transaction.find().populate('user', 'fullName').sort({ createdAt: -1 }).limit(5).lean();
    const recentTPIAs = await TPIA.find().populate('userId', 'fullName').populate('commodityId', 'name').sort({ createdAt: -1 }).limit(5).lean();

    const activity = [
        ...recentUsers.map(u => ({
            type: 'user',
            timestamp: u.createdAt,
            data: {
                id: u._id,
                username: u.fullName,
                email: u.email,
                phone: u.phone,
                kycStatus: u.kycStatus
            }
        })),
        ...recentTransactions.map(t => ({
            type: t.type === 'deposit' ? 'payment' : 'withdrawal',
            timestamp: t.createdAt,
            data: {
                id: t._id,
                amount: t.amount,
                provider: 'Paystack',
                status: t.status,
                username: t.user?.fullName,
                reference: t.reference,
                userEmail: t.user?.email
            }
        })),
        ...recentTPIAs.map(t => ({
            type: 'order',
            timestamp: t.createdAt,
            data: {
                id: t._id,
                orderNumber: t.tpiaId,
                totalPrice: t.amount,
                title: (t.commodityId && typeof t.commodityId === 'object') ? t.commodityId.name : 'Commodity',
                username: (t.userId && typeof t.userId === 'object') ? t.userId.fullName : 'User',
                userEmail: (t.userId && typeof t.userId === 'object') ? t.userId.email : ''
            }
        }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10);

    return {
        users: {
            total: totalUsers,
        },
        investments: {
            totalInvested: totalInvested[0]?.total || 0,
            activeTPIAs,
            maturedTPIAs,
            activeGDCs,
        },
        finances: {
            tvl: stats.totalBalance + stats.totalEarnings + stats.totalLocked,
            userBalances: stats.totalBalance,
            userEarnings: stats.totalEarnings,
            lockedFunds: stats.totalLocked,
            profitDistributed: investorPayoutTotal,
            totalDeposits: trxStats.deposits.total,
            totalWithdrawals: trxStats.withdrawals.total,
            depositCount: trxStats.deposits.count,
            withdrawalCount: trxStats.withdrawals.count,
            // Platform Performance Metrics
            estGrossRevenue,
            estNetProfit,
            penaltyRevenue: actualPenaltyRevenue,
            totalPlatformRevenue: estNetProfit + actualPenaltyRevenue
        },
        queues: {
            pendingDeposits,
            pendingWithdrawals,
        },
        recentActivity: activity
    };
};

/**
 * Get detailed financial reports for admins
 * @param {Object} options - Reporting options
 * @param {string} options.type - Type of report
 * @param {Date} options.startDate - Start date for filter
 * @param {Date} options.endDate - End date for filter
 */
export const getFinancialReport = async ({ type = REPORT_TYPES.TRANSACTION_SUMMARY, startDate, endDate } = {}) => {
    const filter = {};
    if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    switch (type) {
        case REPORT_TYPES.TRANSACTION_SUMMARY:
            return await Transaction.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: '$type',
                        count: { $sum: 1 },
                        totalAmount: { $sum: '$amount' },
                        successful: {
                            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                        },
                        pending: {
                            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                        }
                    },
                },
                { $sort: { totalAmount: -1 } }
            ]);

        case REPORT_TYPES.PROFIT_DISTRIBUTION:
            return await Transaction.aggregate([
                {
                    $match: {
                        ...filter,
                        type: 'cycle_profit',
                        status: 'completed'
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' },
                            day: { $dayOfMonth: '$createdAt' }
                        },
                        totalDistributed: { $sum: '$amount' },
                        payoutCount: { $sum: 1 }
                    }
                },
                { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } }
            ]);

        case REPORT_TYPES.USER_ACQUISITION:
            return await User.aggregate([
                { $match: { role: 'user', ...filter } },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' },
                            day: { $dayOfMonth: '$createdAt' }
                        },
                        newUsers: { $sum: 1 },
                        verifiedKYC: {
                            $sum: { $cond: [{ $eq: ['$kycStatus', 'verified'] }, 1, 0] }
                        }
                    }
                },
                { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } }
            ]);

        case REPORT_TYPES.TPIA_SALES:
            return await TPIA.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: '$commodityId',
                        unitsSold: { $sum: 1 },
                        totalRevenue: { $sum: '$amount' },
                        avgUnitsPerUser: { $avg: 1 } // Placeholder for more complex grouping
                    }
                },
                {
                    $lookup: {
                        from: 'commodities',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'commodity'
                    }
                },
                { $unwind: '$commodity' },
                {
                    $project: {
                        commodityName: '$commodity.name',
                        unitsSold: 1,
                        totalRevenue: 1
                    }
                },
                { $sort: { unitsSold: -1 } }
            ]);

        default:
            return await Transaction.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: '$type',
                        count: { $sum: 1 },
                        totalAmount: { $sum: '$amount' },
                    },
                },
            ]);
    }
};

/**
 * Generate CSV data for a report
 * @param {Array} data - Report data
 * @param {string} type - Report type
 */
export const generateCSV = (data, type) => {
    if (!data || data.length === 0) return '';

    let headers = [];
    let rows = [];

    switch (type) {
        case REPORT_TYPES.TRANSACTION_SUMMARY:
            headers = ['Type', 'Count', 'Total Amount', 'Successful', 'Pending'];
            rows = data.map(d => [d._id, d.count, d.totalAmount, d.successful, d.pending]);
            break;
        case REPORT_TYPES.USER_ACQUISITION:
            headers = ['Date', 'New Users', 'Verified KYC'];
            rows = data.map(d => [`${d._id.year}-${d._id.month}-${d._id.day}`, d.newUsers, d.verifiedKYC]);
            break;
        case REPORT_TYPES.PROFIT_DISTRIBUTION:
            headers = ['Date', 'Total Distributed', 'Payout Count'];
            rows = data.map(d => [`${d._id.year}-${d._id.month}-${d._id.day}`, d.totalDistributed, d.payoutCount]);
            break;
        case REPORT_TYPES.TPIA_SALES:
            headers = ['Commodity', 'Units Sold', 'Total Revenue'];
            rows = data.map(d => [d.commodityName, d.unitsSold, d.totalRevenue]);
            break;
        default:
            headers = Object.keys(data[0]);
            rows = data.map(d => Object.values(d));
    }

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
};
