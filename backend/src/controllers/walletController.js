import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import config from '../config/env.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import {
    initializePaystackPayment,
    verifyPaystackPayment,
    creditWallet,
    debitWallet,
    calculateBalances,
    lockBalanceForWithdrawal,
} from '../services/walletService.js';

/**
 * @desc    Get user wallet
 * @route   GET /api/wallet
 * @access  Private
 */
export const getWallet = asyncHandler(async (req, res, next) => {
    const wallet = await Wallet.findOne({ userId: req.user.id });

    if (!wallet) {
        return next(new AppError('Wallet not found', 404));
    }

    const balances = calculateBalances(wallet);

    res.status(200).json({
        success: true,
        data: {
            wallet: {
                ...wallet.toObject(),
                ...balances,
            },
        },
    });
});

/**
 * @desc    Initialize deposit with Paystack
 * @route   POST /api/wallet/deposit
 * @access  Private
 */
export const initializeDeposit = asyncHandler(async (req, res, next) => {
    const { amount } = req.body;
    const user = req.user;

    // Initialize Paystack payment
    const paymentData = await initializePaystackPayment(
        user.email,
        amount,
        {
            userId: user.id,
            type: 'deposit',
            fullName: user.fullName,
        }
    );

    // Create pending transaction
    const transaction = await Transaction.create({
        user: user.id,
        wallet: (await Wallet.findOne({ userId: user.id }))._id,
        type: 'deposit',
        amount,
        status: 'pending',
        reference: paymentData.reference,
        paymentMethod: 'paystack',
        metadata: {
            paystackReference: paymentData.reference,
            authorizationUrl: paymentData.authorization_url,
            accessCode: paymentData.access_code,
        },
    });

    res.status(200).json({
        success: true,
        message: 'Payment initialized successfully',
        data: {
            authorizationUrl: paymentData.authorization_url,
            reference: paymentData.reference,
            accessCode: paymentData.access_code,
            transaction: {
                id: transaction._id,
                reference: transaction.reference,
                amount: transaction.amount,
            },
        },
    });
});

/**
 * @desc    Verify Paystack payment and credit wallet
 * @route   GET /api/wallet/paystack/callback
 * @access  Public (called by Paystack)
 */
export const handlePaystackCallback = asyncHandler(async (req, res, next) => {
    const { reference } = req.query;

    if (!reference) {
        return next(new AppError('Payment reference is required', 400));
    }

    // Find transaction
    const transaction = await Transaction.findOne({ reference });

    if (!transaction) {
        return next(new AppError('Transaction not found', 404));
    }

    // Check if already processed
    if (transaction.status === 'completed') {
        return res.status(200).json({
            success: true,
            message: 'Payment already processed',
        });
    }

    // Verify payment with Paystack
    const verification = await verifyPaystackPayment(reference);
    const clientUrl = config.clientUrl || 'http://localhost:3000';

    if (!verification.success) {
        // Update transaction as failed
        transaction.status = 'failed';
        transaction.failureReason = 'Payment verification failed';
        await transaction.save();

        return res.redirect(`${clientUrl}/dashboard?status=error&message=Payment%20verification%20failed`);
    }

    // Credit wallet (Note: verification.amount is already in Naira from service)
    await creditWallet(
        transaction.user,
        verification.amount,
        'deposit',
        `Deposit via Paystack - ${reference}`,
        {
            paymentMethod: 'paystack',
            paystackReference: reference,
            verifiedAt: new Date(),
        }
    );

    // Update transaction status
    transaction.status = 'completed';
    transaction.metadata.verifiedAt = new Date();
    await transaction.save();

    res.redirect(`${clientUrl}/dashboard?status=success&amount=${verification.amount}&reference=${reference}`);
});

/**
 * @desc    Request withdrawal
 * @route   POST /api/wallet/withdraw
 * @access  Private
 */
export const requestWithdrawal = asyncHandler(async (req, res, next) => {
    const { amount, bankAccountId } = req.body;
    const user = req.user;

    // Get wallet for bank account check
    const walletExists = await Wallet.findOne({ userId: user.id });
    if (!walletExists) {
        return next(new AppError('Wallet not found', 404));
    }

    // Get bank account
    let bankAccount;
    if (bankAccountId) {
        bankAccount = walletExists.bankAccounts.id(bankAccountId);
    } else {
        // Use default bank account
        bankAccount = walletExists.bankAccounts.find((acc) => acc.isDefault);
    }

    if (!bankAccount) {
        return next(
            new AppError('Bank account not found. Please add a bank account first', 400)
        );
    }

    // Lock balance using service (atomic + prevents double-spending)
    const wallet = await lockBalanceForWithdrawal(user.id, amount);

    // Create withdrawal transaction (pending admin approval)
    const transaction = await Transaction.create({
        user: user.id,
        wallet: wallet._id,
        type: 'withdrawal',
        amount,
        status: 'pending',
        reference: Transaction.generateReference('withdrawal'),
        paymentMethod: 'bank_transfer',
        metadata: {
            bankAccount: {
                bankName: bankAccount.bankName,
                accountNumber: bankAccount.accountNumber,
                accountName: bankAccount.accountName,
            },
            requestedAt: new Date(),
        },
    });

    res.status(201).json({
        success: true,
        message: 'Withdrawal request submitted successfully. Awaiting admin approval',
        data: {
            transaction: {
                id: transaction._id,
                reference: transaction.reference,
                amount: transaction.amount,
                status: transaction.status,
                bankAccount: transaction.metadata.bankAccount,
            },
        },
    });
});

/**
 * @desc    Get transaction history
 * @route   GET /api/wallet/transactions
 * @access  Private
 */
export const getTransactionHistory = asyncHandler(async (req, res, next) => {
    const { type, status, page = 1, limit = 50, startDate, endDate } = req.query;

    // Build query
    const query = {};

    // If not admin, restrict to own transactions
    if (req.user.role !== 'admin') {
        query.user = req.user.id;
    }

    if (type) query.type = type;
    if (status) query.status = status;

    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
        Transaction.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate(req.user.role === 'admin' ? { path: 'user', select: 'fullName email' } : '')
            .lean(),
        Transaction.countDocuments(query),
    ]);

    res.status(200).json({
        success: true,
        data: {
            transactions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        },
    });
});

/**
 * @desc    Add bank account
 * @route   POST /api/wallet/bank-account
 * @access  Private
 */
export const addBankAccount = asyncHandler(async (req, res, next) => {
    const { bankName, accountNumber, accountName } = req.body;

    const wallet = await Wallet.findOne({ userId: req.user.id });

    if (!wallet) {
        return next(new AppError('Wallet not found', 404));
    }

    // Check if account already exists
    const existingAccount = wallet.bankAccounts.find(
        (acc) => acc.accountNumber === accountNumber
    );

    if (existingAccount) {
        return next(new AppError('Bank account already added', 400));
    }

    // Add bank account
    const isFirstAccount = wallet.bankAccounts.length === 0;

    wallet.bankAccounts.push({
        bankName,
        accountNumber,
        accountName,
        isDefault: isFirstAccount, // First account is default
    });

    await wallet.save();

    res.status(201).json({
        success: true,
        message: 'Bank account added successfully',
        data: {
            bankAccount: wallet.bankAccounts[wallet.bankAccounts.length - 1],
        },
    });
});

/**
 * @desc    Set default bank account
 * @route   PATCH /api/wallet/bank-account/:id/default
 * @access  Private
 */
export const setDefaultBankAccount = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const wallet = await Wallet.findOne({ userId: req.user.id });

    if (!wallet) {
        return next(new AppError('Wallet not found', 404));
    }

    const bankAccount = wallet.bankAccounts.id(id);

    if (!bankAccount) {
        return next(new AppError('Bank account not found', 404));
    }

    // Set all to false, then set this one to true
    wallet.bankAccounts.forEach((acc) => {
        acc.isDefault = acc._id.toString() === id;
    });

    await wallet.save();

    res.status(200).json({
        success: true,
        message: 'Default bank account updated successfully',
        data: {
            bankAccount,
        },
    });
});

/**
 * @desc    Delete bank account
 * @route   DELETE /api/wallet/bank-account/:id
 * @access  Private
 */
export const deleteBankAccount = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const wallet = await Wallet.findOne({ userId: req.user.id });

    if (!wallet) {
        return next(new AppError('Wallet not found', 404));
    }

    const bankAccount = wallet.bankAccounts.id(id);

    if (!bankAccount) {
        return next(new AppError('Bank account not found', 404));
    }

    const wasDefault = bankAccount.isDefault;

    // Remove the account
    wallet.bankAccounts.pull(id);

    // If we deleted the default account, make another one default if available
    if (wasDefault && wallet.bankAccounts.length > 0) {
        wallet.bankAccounts[0].isDefault = true;
    }

    await wallet.save();

    res.status(200).json({
        success: true,
        message: 'Bank account deleted successfully',
    });
});

/**
 * @desc    Export transaction history to CSV
 * @route   GET /api/wallet/transactions/export
 * @access  Private
 */
export const exportTransactions = asyncHandler(async (req, res, next) => {
    const { type, status, startDate, endDate } = req.query;

    // Build query
    const query = {};

    // If not admin, restrict to own transactions
    if (req.user.role !== 'admin') {
        query.user = req.user.id;
    }

    if (type) query.type = type;
    if (status) query.status = status;

    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
        .sort({ createdAt: -1 })
        .populate('user', 'fullName email')
        .lean();

    // Generate CSV
    let csv = 'Date,Reference,Type,Amount,Status,User,Email,Description\n';

    transactions.forEach(t => {
        const date = new Date(t.createdAt).toISOString().split('T')[0];
        const user = t.user?.fullName || 'N/A';
        const email = t.user?.email || 'N/A';
        const description = t.description || '';

        csv += `${date},${t.reference},${t.type},${t.amount},${t.status},"${user}","${email}","${description}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=transactions-${Date.now()}.csv`);
    res.status(200).send(csv);
});
