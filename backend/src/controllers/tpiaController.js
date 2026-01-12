import TPIA from '../models/TPIA.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import {
    purchaseTPIA as purchaseTPIAService,
    approveTPIA as approveTPIAService,
    rejectTPIA as rejectTPIAService,
    getUserTPIAs as getUserTPIAsService,
    getUserTPIAStats,
} from '../services/tpiaService.js';
import { TPIA_CONSTANTS, TPIA_STATUS } from '../config/constants.js';

/**
 * @desc    Purchase TPIA
 * @route   POST /api/tpia/purchase
 * @access  Private
 */
export const purchaseTPIA = asyncHandler(async (req, res, next) => {
    const { mode, commodityId, cycleStartMode } = req.body;
    const user = req.user;

    // Purchase TPIA
    const { tpia, transaction } = await purchaseTPIAService(user.id, mode || user.mode, commodityId, cycleStartMode);

    res.status(201).json({
        success: true,
        message: `TPIA-${tpia.tpiaNumber} purchase submitted successfully. Awaiting admin approval (auto-approves in ${TPIA_CONSTANTS.ADMIN_APPROVAL_WINDOW_MAX} minutes)`,
        data: {
            tpia: {
                id: tpia._id,
                tpiaNumber: tpia.tpiaNumber,
                gdcNumber: tpia.gdcNumber,
                amount: tpia.amount,
                profitAmount: tpia.profitAmount,
                status: tpia.status,
                purchaseDate: tpia.purchaseDate,
                userMode: tpia.userMode,
            },
            transaction: {
                id: transaction._id,
                reference: transaction.reference,
                amount: transaction.amount,
                status: transaction.status,
            },
        },
    });
});

/**
 * @desc    Get user's TPIAs
 * @route   GET /api/tpia/my-tpias
 * @access  Private
 */
export const getMyTPIAs = asyncHandler(async (req, res, next) => {
    const { status } = req.query;

    const filters = {};
    if (status) filters.status = status;

    const tpias = await getUserTPIAsService(req.user.id, filters);
    const stats = await getUserTPIAStats(req.user.id);

    res.status(200).json({
        success: true,
        data: {
            tpias,
            stats,
            count: tpias.length,
        },
    });
});

/**
 * @desc    Get TPIA details
 * @route   GET /api/tpia/:id
 * @access  Private
 */
export const getTPIADetails = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const tpia = await TPIA.findById(id)
        .populate('userId', 'fullName email')
        .populate('approvedBy', 'fullName email');

    if (!tpia) {
        return next(new AppError('TPIA not found', 404));
    }

    // Check if user owns this TPIA or is admin
    if (tpia.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new AppError('Not authorized to view this TPIA', 403));
    }

    res.status(200).json({
        success: true,
        data: {
            tpia,
        },
    });
});

/**
 * @desc    Get pending TPIAs (Admin)
 * @route   GET /api/admin/tpia/pending
 * @access  Private/Admin
 */
export const getPendingTPIAs = asyncHandler(async (req, res, next) => {
    const pendingTPIAs = await TPIA.find({ status: TPIA_STATUS.PENDING_APPROVAL })
        .populate('userId', 'fullName email phone')
        .sort({ purchaseDate: 1 })
        .lean();

    res.status(200).json({
        success: true,
        data: {
            tpias: pendingTPIAs,
            count: pendingTPIAs.length,
        },
    });
});

/**
 * @desc    Approve TPIA (Admin)
 * @route   PATCH /api/admin/tpia/:id/approve
 * @access  Private/Admin
 */
export const adminApproveTPIA = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { notes } = req.body || {};

    const tpia = await approveTPIAService(id, req.user.id);

    res.status(200).json({
        success: true,
        message: `TPIA-${tpia.tpiaNumber} processed successfully.`,
        data: {
            tpia: {
                id: tpia._id,
                tpiaNumber: tpia.tpiaNumber,
                gdcNumber: tpia.gdcNumber,
                status: tpia.status,
                approvalDate: tpia.approvalDate,
                maturityDate: tpia.maturityDate,
                daysUntilMaturity: tpia.daysUntilMaturity,
                insurancePolicyNumber: tpia.insurancePolicyNumber,
            },
        },
    });
});

/**
 * @desc    Get all TPIAs (Admin)
 * @route   GET /api/admin/tpia/all
 * @access  Private/Admin
 */
export const getAdminTPIAs = asyncHandler(async (req, res, next) => {
    const { status, page = 1, limit = 50 } = req.query;

    const query = {};
    if (status) {
        query.status = status;
    }

    const tpias = await TPIA.find(query)
        .populate('userId', 'fullName email phone')
        .populate('approvedBy', 'fullName email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean();

    const total = await TPIA.countDocuments(query);

    // Calculate total value of selected TPIAs
    const totalValueResult = await TPIA.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalValue = totalValueResult.length > 0 ? totalValueResult[0].total : 0;

    res.status(200).json({
        success: true,
        data: {
            tpias,
            pagination: {
                total,
                totalValue,
                page: Number(page),
                pages: Math.ceil(total / limit)
            }
        },
    });
});

/**
 * @desc    Reject TPIA (Admin)
 * @route   PATCH /api/admin/tpia/:id/reject
 * @access  Private/Admin
 */
export const adminRejectTPIA = asyncHandler((req, res, next) => {
    const { id } = req.params;
    const { reason } = req.body;

    const tpia = rejectTPIAService(id, req.user.id, reason);

    res.status(200).json({
        success: true,
        message: `TPIA-${tpia.tpiaNumber} rejected. Balance refunded to user.`,
        data: {
            tpia: {
                id: tpia._id,
                tpiaNumber: tpia.tpiaNumber,
                status: tpia.status,
                rejectionReason: tpia.rejectionReason,
            },
        },
    });
});

/**
 * @desc    Request TPIA Withdrawal (Exit Window)
 * @route   POST /api/tpia/:id/withdraw
 * @access  Private
 */
export const withdrawTPIA = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    // Call service to request withdrawal
    // Import dynamically or ensure imported at top
    const { requestWithdrawal } = await import('../services/tpiaService.js');

    const tpia = await requestWithdrawal(id, req.user.id);

    res.status(200).json({
        success: true,
        message: 'Withdrawal request submitted successfully.',
        data: {
            tpia: {
                id: tpia._id,
                tpiaNumber: tpia.tpiaNumber,
                status: tpia.status,
                investmentPhase: tpia.investmentPhase,
                withdrawalRequested: tpia.withdrawalRequested,
                withdrawalRequestDate: tpia.withdrawalRequestDate
            }
        }
    });
});
