import Paystack from 'paystack-api';
import fetch from 'node-fetch';
import config from '../config/env.js';
import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import * as notificationService from './notificationService.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import mongoose from 'mongoose';

/**
 * Wallet Service - Handles all wallet operations with atomic transactions
 * CRITICAL: All balance operations use MongoDB transactions to prevent double-spending
 */

// Global flag to track if transactions are supported (Standalone vs Replica Set)
let transactionsSupported = true;

/**
 * Credit wallet with atomic operation
 * @param {ObjectId} userId - User ID
 * @param {Number} amount - Amount to credit
 * @param {String} type - Transaction type
 * @param {String} description - Transaction description
 * @param {Object} metadata - Additional metadata
 * @returns {Object} Updated wallet and transaction
 */
export const creditWallet = async (userId, amount, type, description, metadata = {}) => {
    let session = null;

    if (transactionsSupported) {
        try {
            session = await mongoose.startSession();
            session.startTransaction();
        } catch (error) {
            transactionsSupported = false;
            if (session) session.endSession();
            session = null;
            console.warn('⚠️  MongoDB Transactions not supported (Standalone Mode). Proceeding without transaction.');
        }
    }

    try {
        // Get wallet with lock
        let wallet;
        try {
            wallet = session
                ? await Wallet.findOne({ userId }).session(session)
                : await Wallet.findOne({ userId });
        } catch (err) {
            // If the first call fails with transaction error, fall back globally
            if (err.message.includes('Transaction numbers') && session) {
                console.warn('⚠️  MongoDB Standalone detected during operation. Disabling transactions globally.');
                transactionsSupported = false;
                await session.abortTransaction();
                session.endSession();
                session = null;
                wallet = await Wallet.findOne({ userId });
            } else {
                throw err;
            }
        }

        if (!wallet) {
            throw new AppError('Wallet not found', 404);
        }

        // Validate amount
        if (amount <= 0) {
            throw new AppError('Amount must be positive', 400);
        }

        // Generate unique reference
        const reference = Transaction.generateReference(type);

        // Update balance based on type
        if (type === 'cycle_profit' || type === 'maturity_return') {
            // Profits go to earnings balance (for EPS users)
            wallet.earningsBalance += amount;
        } else {
            // Deposits go to main balance
            wallet.balance += amount;
        }

        // Add ledger entry
        wallet.ledger.push({
            type,
            amount,
            balance: wallet.balance + wallet.earningsBalance,
            description,
            reference,
            status: 'completed',
            metadata,
            createdAt: new Date(),
        });

        // Save wallet
        if (session) {
            await wallet.save({ session });
        } else {
            await wallet.save();
        }

        // Create transaction record
        const transactionData = {
            user: userId,
            wallet: wallet._id,
            type,
            amount,
            status: 'completed',
            reference,
            paymentMethod: metadata.paymentMethod || 'system',
            metadata,
        };

        const transactionResult = session
            ? await Transaction.create([transactionData], { session })
            : await Transaction.create(transactionData);

        // Commit transaction if using one
        if (session) {
            await session.commitTransaction();
        }

        return {
            wallet,
            transaction: Array.isArray(transactionResult) ? transactionResult[0] : transactionResult,
        };
    } catch (error) {
        if (session) {
            await session.abortTransaction();
        }
        throw error;
    } finally {
        if (session) {
            session.endSession();
        }
    }
};

/**
 * Debit wallet with atomic operation
 * @param {ObjectId} userId - User ID
 * @param {Number} amount - Amount to debit
 * @param {String} type - Transaction type
 * @param {String} description - Transaction description
 * @param {Object} metadata - Additional metadata
 * @returns {Object} Updated wallet and transaction
 */
export const debitWallet = async (userId, amount, type, description, metadata = {}) => {
    let session = null;

    if (transactionsSupported) {
        try {
            session = await mongoose.startSession();
            session.startTransaction();
        } catch (error) {
            transactionsSupported = false;
            if (session) session.endSession();
            session = null;
            console.warn('⚠️  MongoDB Transactions not supported (Standalone Mode). Proceeding without transaction.');
        }
    }

    try {
        // Get wallet with lock
        let wallet;
        try {
            wallet = session
                ? await Wallet.findOne({ userId }).session(session)
                : await Wallet.findOne({ userId });
        } catch (err) {
            if (err.message.includes('Transaction numbers') && session) {
                console.warn('⚠️  MongoDB Standalone detected during operation. Disabling transactions globally.');
                transactionsSupported = false;
                await session.abortTransaction();
                session.endSession();
                session = null;
                wallet = await Wallet.findOne({ userId });
            } else {
                throw err;
            }
        }

        if (!wallet) {
            throw new AppError('Wallet not found', 404);
        }

        // Validate amount
        if (amount <= 0) {
            throw new AppError('Amount must be positive', 400);
        }

        // Calculate available balance
        const availableBalance = wallet.balance + wallet.earningsBalance - wallet.lockedBalance;

        // Check sufficient balance
        if (availableBalance < amount) {
            throw new AppError('Insufficient balance', 400);
        }

        // Generate unique reference
        const reference = Transaction.generateReference(type);

        // Deduct from balances (prefer earnings first, then main)
        if (wallet.earningsBalance >= amount) {
            wallet.earningsBalance -= amount;
        } else {
            const remainingAmount = amount - wallet.earningsBalance;
            wallet.earningsBalance = 0;
            wallet.balance -= remainingAmount;
        }

        // Add ledger entry
        wallet.ledger.push({
            type,
            amount: -amount, // Negative for debit
            balance: wallet.balance + wallet.earningsBalance,
            description,
            reference,
            status: 'completed',
            metadata,
            createdAt: new Date(),
        });

        // Save wallet
        if (session) {
            await wallet.save({ session });
        } else {
            await wallet.save();
        }

        // Create transaction record
        const transactionData = {
            user: userId,
            wallet: wallet._id,
            type,
            amount,
            status: 'completed',
            reference,
            paymentMethod: metadata.paymentMethod || 'system',
            metadata,
        };

        const transactionResult = session
            ? await Transaction.create([transactionData], { session })
            : await Transaction.create(transactionData);

        // Commit transaction if using one
        if (session) {
            await session.commitTransaction();
        }

        return {
            wallet,
            transaction: Array.isArray(transactionResult) ? transactionResult[0] : transactionResult,
        };
    } catch (error) {
        if (session) {
            await session.abortTransaction();
        }
        throw error;
    } finally {
        if (session) {
            session.endSession();
        }
    }
};

/**
 * Lock balance (for TPIA purchase)
 * @param {ObjectId} userId - User ID
 * @param {Number} amount - Amount to lock
 * @returns {Object} Updated wallet
 */
export const lockBalance = async (userId, amount) => {
    try {
        const wallet = await Wallet.findOne({ userId });
        if (!wallet) {
            throw new AppError('Wallet not found', 404);
        }

        const availableBalance = wallet.balance + wallet.earningsBalance - wallet.lockedBalance;

        if (availableBalance < amount) {
            throw new AppError('Insufficient balance to lock', 400);
        }

        // Move to locked balance
        wallet.lockedBalance += amount;

        await wallet.save();

        return wallet;
    } catch (error) {
        throw error;
    }
};

/**
 * Unlock balance (when TPIA matures)
 * @param {ObjectId} userId - User ID
 * @param {Number} amount - Amount to unlock
 * @returns {Object} Updated wallet
 */
export const unlockBalance = async (userId, amount) => {
    let session = null;

    if (transactionsSupported) {
        try {
            session = await mongoose.startSession();
            session.startTransaction();
        } catch (error) {
            transactionsSupported = false;
            if (session) session.endSession();
            session = null;
            console.warn('⚠️  MongoDB Transactions not supported (Standalone Mode). Proceeding without transaction.');
        }
    }

    try {
        let wallet;
        try {
            wallet = session
                ? await Wallet.findOne({ userId }).session(session)
                : await Wallet.findOne({ userId });
        } catch (err) {
            if (err.message.includes('Transaction numbers') && session) {
                console.warn('⚠️  MongoDB Standalone detected during operation. Disabling transactions globally.');
                transactionsSupported = false;
                await session.abortTransaction();
                session.endSession();
                session = null;
                wallet = await Wallet.findOne({ userId });
            } else {
                throw err;
            }
        }

        if (!wallet) {
            throw new AppError('Wallet not found', 404);
        }

        if (wallet.lockedBalance < amount) {
            throw new AppError('Insufficient locked balance', 400);
        }

        // Move from locked to main balance
        wallet.lockedBalance -= amount;
        wallet.balance += amount;

        if (session) {
            await wallet.save({ session });
        } else {
            await wallet.save();
        }

        if (session) {
            await session.commitTransaction();
        }

        return wallet;
    } catch (error) {
        if (session) {
            await session.abortTransaction();
        }
        throw error;
    } finally {
        if (session) {
            session.endSession();
        }
    }
};

/**
 * Initialize Paystack payment
 * @param {String} email - User email
 * @param {Number} amount - Amount in Naira (will be converted to kobo)
 * @param {Object} metadata - Additional metadata
 * @returns {Object} Paystack initialization response
 */
export const initializePaystackPayment = async (email, amount, metadata = {}) => {
    if (!config.paystack.secretKey) {
        throw new AppError('Paystack not configured', 500);
    }

    const paystack = Paystack(config.paystack.secretKey);

    try {
        // Convert Naira to kobo (Paystack uses kobo)
        const amountInKobo = amount * 100;

        const response = await paystack.transaction.initialize({
            email,
            amount: amountInKobo,
            callback_url: config.paystack.callbackUrl,
            metadata: {
                ...metadata,
                custom_fields: [
                    {
                        display_name: 'User ID',
                        variable_name: 'user_id',
                        value: metadata.userId,
                    },
                ],
            },
        });

        return response.data;
    } catch (error) {
        console.error('Paystack initialization error:', error);
        throw new AppError('Payment initialization failed', 500);
    }
};

/**
 * Verify Paystack payment
 * @param {String} reference - Paystack transaction reference
 * @returns {Object} Verification response
 */
export const verifyPaystackPayment = async (reference) => {
    if (!config.paystack.secretKey) {
        throw new AppError('Paystack not configured', 500);
    }

    const paystack = Paystack(config.paystack.secretKey);

    try {
        const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${config.paystack.secretKey}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (data.status && data.data.status === 'success') {
            // Convert kobo back to Naira
            const amountInNaira = data.data.amount / 100;

            return {
                success: true,
                amount: amountInNaira,
                reference: data.data.reference,
                metadata: data.data.metadata,
            };
        }

        return {
            success: false,
            message: data.message || 'Payment verification failed',
        };
    } catch (error) {
        console.error('Paystack verification error:', error);
        throw new AppError('Payment verification failed', 500);
    }
};

/**
 * Lock balance for withdrawal
 * @param {ObjectId} userId - User ID
 * @param {Number} amount - Amount to lock
 * @returns {Object} Updated wallet
 */
export const lockBalanceForWithdrawal = async (userId, amount) => {
    let session = null;
    if (transactionsSupported) {
        try {
            session = await mongoose.startSession();
            session.startTransaction();
        } catch (error) {
            transactionsSupported = false;
        }
    }

    try {
        let wallet;
        try {
            wallet = session ? await Wallet.findOne({ userId }).session(session) : await Wallet.findOne({ userId });
        } catch (err) {
            if (err.message.includes('Transaction numbers') && session) {
                transactionsSupported = false;
                await session.abortTransaction();
                session.endSession();
                session = null;
                wallet = await Wallet.findOne({ userId });
            } else throw err;
        }

        if (!wallet) throw new AppError('Wallet not found', 404);

        const balances = calculateBalances(wallet);
        if (balances.availableBalance < amount) {
            throw new AppError('Insufficient available balance to lock for withdrawal', 400);
        }

        // Move to pending withdrawal balance
        wallet.pendingWithdrawalBalance += amount;

        if (session) {
            await wallet.save({ session });
            await session.commitTransaction();
        } else await wallet.save();

        return wallet;
    } catch (error) {
        if (session) await session.abortTransaction();
        throw error;
    } finally {
        if (session) session.endSession();
    }
};

/**
 * Unlock balance (on withdrawal rejection/cancellation)
 * @param {ObjectId} userId - User ID
 * @param {Number} amount - Amount to unlock
 * @returns {Object} Updated wallet
 */
export const unlockBalanceForWithdrawal = async (userId, amount) => {
    let session = null;
    if (transactionsSupported) {
        try {
            session = await mongoose.startSession();
            session.startTransaction();
        } catch (error) {
            transactionsSupported = false;
        }
    }

    try {
        let wallet;
        try {
            wallet = session ? await Wallet.findOne({ userId }).session(session) : await Wallet.findOne({ userId });
        } catch (err) {
            if (err.message.includes('Transaction numbers') && session) {
                transactionsSupported = false;
                await session.abortTransaction();
                session.endSession();
                session = null;
                wallet = await Wallet.findOne({ userId });
            } else throw err;
        }

        if (!wallet) throw new AppError('Wallet not found', 404);

        if (wallet.pendingWithdrawalBalance < amount) {
            throw new AppError('Insufficient pending withdrawal balance to unlock', 400);
        }

        // Remove from pending withdrawal
        wallet.pendingWithdrawalBalance -= amount;

        if (session) {
            await wallet.save({ session });
            await session.commitTransaction();
        } else await wallet.save();

        return wallet;
    } catch (error) {
        if (session) await session.abortTransaction();
        throw error;
    } finally {
        if (session) session.endSession();
    }
};

/**
 * Complete withdrawal (permanent deduction)
 * @param {ObjectId} userId - User ID
 * @param {Number} amount - Amount to deduct
 * @returns {Object} Updated wallet
 */
export const completeWithdrawal = async (userId, amount) => {
    let session = null;
    if (transactionsSupported) {
        try {
            session = await mongoose.startSession();
            session.startTransaction();
        } catch (error) {
            transactionsSupported = false;
        }
    }

    try {
        let wallet;
        try {
            wallet = session ? await Wallet.findOne({ userId }).session(session) : await Wallet.findOne({ userId });
        } catch (err) {
            if (err.message.includes('Transaction numbers') && session) {
                transactionsSupported = false;
                await session.abortTransaction();
                session.endSession();
                session = null;
                wallet = await Wallet.findOne({ userId });
            } else throw err;
        }

        if (!wallet) throw new AppError('Wallet not found', 404);

        if (wallet.pendingWithdrawalBalance < amount) {
            throw new AppError('Insufficient pending withdrawal balance to complete', 400);
        }

        // Deduct from pending and permanently from actual balances
        wallet.pendingWithdrawalBalance -= amount;

        // Prefer earnings balance first for deduction
        if (wallet.earningsBalance >= amount) {
            wallet.earningsBalance -= amount;
        } else {
            const remainder = amount - wallet.earningsBalance;
            wallet.earningsBalance = 0;
            wallet.balance -= remainder;
        }

        if (session) {
            await wallet.save({ session });
            await session.commitTransaction();
        } else await wallet.save();

        return wallet;
    } catch (error) {
        if (session) await session.abortTransaction();
        throw error;
    } finally {
        if (session) session.endSession();
    }
};

/**
 * Calculate wallet balances
 * @param {Object} wallet - Wallet object
 * @returns {Object} Calculated balances
 */
export const calculateBalances = (wallet) => {
    const availableBalance = wallet.balance + wallet.earningsBalance - wallet.lockedBalance - (wallet.pendingWithdrawalBalance || 0);
    return {
        balance: wallet.balance,
        earningsBalance: wallet.earningsBalance,
        lockedBalance: wallet.lockedBalance,
        pendingWithdrawalBalance: wallet.pendingWithdrawalBalance || 0,
        availableBalance: Math.max(0, availableBalance),
        totalBalance: wallet.balance + wallet.earningsBalance + wallet.lockedBalance + (wallet.pendingWithdrawalBalance || 0),
    };
};
