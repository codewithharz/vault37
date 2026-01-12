import mongoose from 'mongoose';
import TPIA from '../models/TPIA.js';
import GDC from '../models/GDC.js';
import Transaction from '../models/Transaction.js';
import Wallet from '../models/Wallet.js';
import User from '../models/User.js';
import Commodity from '../models/Commodity.js';
import Cycle from '../models/Cycle.js';
import AppError from '../utils/AppError.js';
import { lockBalance, unlockBalance, creditWallet } from './walletService.js';
import { createNotification } from './notificationService.js';
import { getOrCreateFillingGDC } from './gdcService.js';
import tradeService from './tradeService.js';
import configService from './configService.js';
import {
    TPIA_CONSTANTS,
    GDC_CONSTANTS,
    TPIA_STATUS,
    GDC_STATUS,
    TRANSACTION_TYPES,
    calculateMaturityDate,
    CYCLE_START_MODES,
} from '../config/constants.js';

/**
 * Purchase TPIA - Lock balance and create pending TPIA
 * @param {ObjectId} userId - User ID
 * @param {String} userMode - User's mode (TPM/EPS)
 * @param {ObjectId} commodityId - Commodity ID (optional)
 * @param {String} cycleStartMode - CLUSTER or IMMEDIATE
 * @returns {Object} Created TPIA and transaction
 */
export const purchaseTPIA = async (userId, userMode, commodityId = null, cycleStartMode = CYCLE_START_MODES.CLUSTER) => {
    // 1. Initial checks (outside transaction to fail fast and support standalone DB for simple checks)
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    if (user.kycStatus !== 'verified') {
        throw new AppError('KYC verification required to purchase TPIA', 403);
    }

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
        throw new AppError('Wallet not found', 404);
    }

    // Fetch commodity before transaction for standalone DB compatibility
    let commodity = null;
    if (commodityId) {
        commodity = await Commodity.findById(commodityId);
        if (!commodity) {
            throw new AppError('Commodity not found', 404);
        }
    }

    try {
        // 1. Initial checks
        const settings = await configService.getSettings();
        const tpiaConfig = settings.tpia;

        // Atomic balance check
        const walletCheck = await Wallet.findOne({ userId });

        // Check available balance
        const availableBalance = walletCheck.balance + walletCheck.earningsBalance - walletCheck.lockedBalance;
        if (availableBalance < tpiaConfig.investmentAmount) {
            throw new AppError(
                `Insufficient balance. Required: ₦${tpiaConfig.investmentAmount.toLocaleString()}, Available: ₦${availableBalance.toLocaleString()}`,
                400
            );
        }

        // Get next TPIA number
        const tpiaNumber = await TPIA.getNextTPIANumber();

        // Calculate profit based on commodity if provided
        let profitAmount = tpiaConfig.profitAmount;
        if (commodity) {
            // Profit = Insured Value (Investment) * 37% (standard rate for now)
            profitAmount = tpiaConfig.investmentAmount * 0.37;
        }

        // Calculate GDC number dynamically based on commodity availability
        const gdc = await getOrCreateFillingGDC(commodityId);
        const gdcNumber = gdc.gdcNumber;

        // Lock balance
        await lockBalance(userId, tpiaConfig.investmentAmount);

        // Create TPIA (pending approval)
        const tpia = await TPIA.create({
            tpiaNumber,
            gdcNumber,
            userId,
            amount: tpiaConfig.investmentAmount,
            currentValue: tpiaConfig.investmentAmount,
            profitAmount, // Use the calculated amount (dynamic)
            userMode,
            cycleStartMode, // Cluster vs Immediate
            commodityId, // Link to selected commodity
            status: TPIA_STATUS.PENDING_APPROVAL,
            purchaseDate: new Date(),
        });

        // Create transaction
        const transaction = await Transaction.create({
            user: userId,
            wallet: walletCheck._id,
            type: TRANSACTION_TYPES.TPIA_PURCHASE,
            amount: tpiaConfig.investmentAmount,
            status: 'pending',
            reference: Transaction.generateReference('tpia_purchase'),
            paymentMethod: 'system',
            metadata: {
                tpiaId: tpia._id,
                tpiaNumber,
                gdcNumber,
            },
        });

        // Link transaction to TPIA
        tpia.transactionId = transaction._id;
        await tpia.save();

        // Notify user
        await createNotification(userId, {
            title: 'TPIA Purchase Submitted',
            message: `Your purchase of TPIA-${tpiaNumber} has been submitted and is awaiting approval. Reference: ${transaction.reference}. (Auto-approves in ${tpiaConfig.approvalWindowMax} minutes)`,
            type: 'info',
            metadata: { tpiaId: tpia._id, transactionId: transaction._id }
        });

        return {
            tpia,
            transaction,
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Assign TPIA to GDC
 * @param {Object} tpia - TPIA object
 * @returns {Object} Updated GDC
 */
export const assignToGDC = async (tpia) => {
    // Find or create GDC
    const gdc = await GDC.findOrCreate(tpia.gdcNumber, tpia.commodityId);

    // Add TPIA to GDC
    await gdc.addTPIA(tpia);

    // If GDC is now FULL, the tradeJobs scheduler or manual trigger will start the first cycle
    return gdc;
};

/**
 * Approve TPIA - Start 37-day cycle
 * @param {ObjectId} tpiaId - TPIA ID
 * @param {ObjectId} adminId - Admin ID (optional for auto-approve)
 * @returns {Object} Updated TPIA
 */
export const approveTPIA = async (tpiaId, adminId = null) => {
    try {
        // Get TPIA
        const tpia = await TPIA.findById(tpiaId);
        if (!tpia) {
            throw new AppError('TPIA not found', 404);
        }

        if (tpia.status !== TPIA_STATUS.PENDING_APPROVAL) {
            throw new AppError('TPIA is not pending approval', 400);
        }

        // Approve TPIA
        await tpia.approve(adminId);

        // Assign to GDC
        await assignToGDC(tpia);

        // If IMMEDIATE mode, start the cycle now
        if (tpia.cycleStartMode === CYCLE_START_MODES.IMMEDIATE) {
            await tradeService.startTPIACycle(tpia);
        }

        // Update transaction
        await Transaction.findByIdAndUpdate(
            tpia.transactionId,
            {
                status: 'completed',
                approvedBy: adminId,
                approvalDate: new Date(),
            }
        );

        // Notify user
        await createNotification(tpia.userId, {
            title: 'TPIA Approved',
            message: `TPIA-${tpia.tpiaNumber} has been approved. Your 37-day cycle has started!`,
            type: 'success',
            metadata: { tpiaId: tpia._id }
        });

        return tpia;
    } catch (error) {
        throw error;
    }
};

/**
 * Reject TPIA - Refund balance
 * @param {ObjectId} tpiaId - TPIA ID
 * @param {ObjectId} adminId - Admin ID
 * @param {String} reason - Rejection reason
 * @returns {Object} Updated TPIA
 */
export const rejectTPIA = async (tpiaId, adminId, reason) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Get TPIA
        const tpia = await TPIA.findById(tpiaId).session(session);
        if (!tpia) {
            throw new AppError('TPIA not found', 404);
        }

        if (tpia.status !== TPIA_STATUS.PENDING_APPROVAL) {
            throw new AppError('TPIA is not pending approval', 400);
        }

        // Reject TPIA
        await tpia.reject(adminId, reason);

        // Unlock balance (refund)
        await unlockBalance(tpia.userId, tpia.amount);

        // Update transaction
        await Transaction.findByIdAndUpdate(
            tpia.transactionId,
            {
                status: 'cancelled',
                approvedBy: adminId,
                approvalDate: new Date(),
                failureReason: reason,
            },
            { session }
        );

        // Notify user
        await createNotification(tpia.userId, {
            title: 'TPIA Rejected',
            message: `Your purchase of TPIA-${tpia.tpiaNumber} was rejected. Reason: ${reason}. Your funds have been refunded.`,
            type: 'warning',
            metadata: { tpiaId: tpia._id }
        });

        await session.commitTransaction();

        return tpia;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

/**
 * Auto-approve pending TPIAs after 60 minutes
 * @returns {Array} Auto-approved TPIAs
 */
export const autoApprovePendingTPIAs = async () => {
    const settings = await configService.getSettings();
    if (!settings.tpia.autoApproveEnabled) {
        return [];
    }

    const pendingTPIAs = await TPIA.getPendingForAutoApproval();
    const approved = [];

    for (const tpia of pendingTPIAs) {
        try {
            const approvedTPIA = await approveTPIA(tpia._id, null);
            approved.push(approvedTPIA);
            console.log(`✅ Auto-approved TPIA-${tpia.tpiaNumber}`);
        } catch (error) {
            console.error(`❌ Failed to auto-approve TPIA-${tpia.tpiaNumber}:`, error.message);
        }
    }

    return approved;
};

/**
 * Process matured TPIAs - Distribute profits
 * @returns {Array} Processed TPIAs
 */
export const processMaturedTPIAs = async () => {
    const maturedTPIAs = await TPIA.getMaturedTPIAs();
    const processed = [];

    for (const tpia of maturedTPIAs) {
        try {
            await processMaturedTPIA(tpia);
            processed.push(tpia);
            console.log(`✅ Processed matured TPIA-${tpia.tpiaNumber} for user ${tpia.userId.fullName}`);
        } catch (error) {
            console.error(`❌ Failed to process TPIA-${tpia.tpiaNumber}:`, error.message);
        }
    }

    return processed;
};

/**
 * Process single matured TPIA
 * @param {Object} tpia - TPIA object
 */
const processMaturedTPIA = async (tpia) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Get user
        const user = await User.findById(tpia.userId).session(session);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Unlock principal (₦100,000)
        await unlockBalance(tpia.userId, tpia.amount);

        // Distribute based on mode
        if (tpia.userMode === 'TPM') {
            // TPM: All to main balance (₦137,000)
            await creditWallet(
                tpia.userId,
                tpia.amount + tpia.profitAmount,
                TRANSACTION_TYPES.MATURITY_RETURN,
                `TPIA-${tpia.tpiaNumber} maturity return (TPM)`,
                {
                    tpiaId: tpia._id,
                    tpiaNumber: tpia.tpiaNumber,
                    principal: tpia.amount,
                    profit: tpia.profitAmount,
                    mode: 'TPM',
                }
            );
        } else {
            // EPS: Principal to balance, profit to earnings
            // Principal
            await creditWallet(
                tpia.userId,
                tpia.amount,
                TRANSACTION_TYPES.MATURITY_RETURN,
                `TPIA-${tpia.tpiaNumber} principal return (EPS)`,
                {
                    tpiaId: tpia._id,
                    tpiaNumber: tpia.tpiaNumber,
                    principal: tpia.amount,
                    mode: 'EPS',
                }
            );

            // Profit to earnings
            await creditWallet(
                tpia.userId,
                tpia.profitAmount,
                TRANSACTION_TYPES.CYCLE_PROFIT,
                `TPIA-${tpia.tpiaNumber} profit (EPS)`,
                {
                    tpiaId: tpia._id,
                    tpiaNumber: tpia.tpiaNumber,
                    profit: tpia.profitAmount,
                    mode: 'EPS',
                }
            );
        }

        // Mark TPIA as completed
        await tpia.markCompleted();

        // Notify user
        await createNotification(tpia.userId, {
            title: 'TPIA Matured',
            message: `TPIA-${tpia.tpiaNumber} has matured! ₦${(tpia.amount + tpia.profitAmount).toLocaleString()} has been credited to your wallet (${tpia.userMode} mode).`,
            type: 'success',
            metadata: { tpiaId: tpia._id }
        });

        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

/**
 * Get user's TPIAs
 * @param {ObjectId} userId - User ID
 * @param {Object} filters - Optional filters
 * @returns {Array} User's TPIAs
 */
export const getUserTPIAs = async (userId, filters = {}) => {
    const query = { userId, ...filters };

    return TPIA.find(query)
        .sort({ tpiaNumber: -1 })
        .lean();
};

/**
 * Get TPIA statistics for user
 * @param {ObjectId} userId - User ID
 * @returns {Object} TPIA statistics
 */
export const getUserTPIAStats = async (userId) => {
    const [active, matured, completed, totalInvested, totalReturns] = await Promise.all([
        TPIA.countDocuments({ userId, status: TPIA_STATUS.ACTIVE }),
        TPIA.countDocuments({ userId, status: TPIA_STATUS.MATURED }),
        TPIA.countDocuments({ userId, status: TPIA_STATUS.COMPLETED }),
        TPIA.aggregate([
            { $match: { userId, status: { $in: [TPIA_STATUS.ACTIVE, TPIA_STATUS.MATURED, TPIA_STATUS.COMPLETED] } } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        TPIA.aggregate([
            { $match: { userId, status: TPIA_STATUS.COMPLETED } },
            { $group: { _id: null, total: { $sum: { $add: ['$amount', '$profitAmount'] } } } },
        ]),
    ]);

    return {
        active,
        matured,
        completed,
        totalInvested: totalInvested[0]?.total || 0,
        totalReturns: totalReturns[0]?.total || 0,
        totalProfit: (totalReturns[0]?.total || 0) - (totalInvested[0]?.total || 0),
    };
};

/**
 * Request withdrawal during exit window
 * @param {ObjectId} tpiaId - TPIA ID
 * @param {ObjectId} userId - User ID (for verification)
 * @returns {Object} Updated TPIA
 */
export const requestWithdrawal = async (tpiaId, userId) => {
    const tpia = await TPIA.findById(tpiaId);
    if (!tpia) throw new Error('TPIA not found');
    if (tpia.userId.toString() !== userId.toString()) throw new Error('Unauthorized');

    // Check if in extended phase
    if (tpia.investmentPhase !== 'EXTENDED') throw new Error('Withdrawal only available in extended phase');

    // Check if window is open
    const now = new Date();
    if (!tpia.nextExitWindowStart || !tpia.nextExitWindowEnd) throw new Error('No exit window scheduled');
    if (now < tpia.nextExitWindowStart) throw new Error('Exit window not yet open');
    if (now > tpia.nextExitWindowEnd) throw new Error('Exit window closed');

    // Calculate Estimated Return
    const currentCycle = tpia.currentCycle; // Should be the cycle ending soon
    // Note: User requests exit during running cycle (e.g., Cycle 15 running).
    // The exit happens at END of Cycle 15. So we look up penalty for Cycle 15.
    const settings = await configService.getSettings();
    const penaltyRate = settings.exitPenalties.get(currentCycle.toString()) || 0;
    const estRefund = tpia.amount * (1 - penaltyRate);

    // Set flag
    tpia.withdrawalRequested = true;
    tpia.withdrawalRequestDate = new Date();

    await tpia.save();

    // Notify user
    await createNotification(userId, {
        title: 'Withdrawal Requested',
        message: `Request received for TPIA-${tpia.tpiaNumber}. Exit scheduled after Cycle ${currentCycle}. Est. Refund: ₦${estRefund.toLocaleString()} (${penaltyRate * 100}% Penalty).`,
        type: 'info',
        metadata: { tpiaId: tpia._id }
    });

    return tpia;
};
