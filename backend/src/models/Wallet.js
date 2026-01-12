import mongoose from 'mongoose';
import { TRANSACTION_TYPES } from '../config/constants.js';

const walletSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        balance: {
            type: Number,
            default: 0,
            min: [0, 'Balance cannot be negative'],
        },
        earningsBalance: {
            type: Number,
            default: 0,
            min: [0, 'Earnings balance cannot be negative'],
            description: 'Profits from EPS mode (available for withdrawal)',
        },
        lockedBalance: {
            type: Number,
            default: 0,
            min: [0, 'Locked balance cannot be negative'],
            description: 'Funds locked in active TPIAs',
        },
        pendingWithdrawalBalance: {
            type: Number,
            default: 0,
            min: [0, 'Pending withdrawal balance cannot be negative'],
            description: 'Funds reserved for pending withdrawal requests',
        },
        ledger: [
            {
                type: {
                    type: String,
                    enum: Object.values(TRANSACTION_TYPES),
                    required: true,
                },
                amount: {
                    type: Number,
                    required: true,
                },
                balance: {
                    type: Number,
                    required: true,
                    description: 'Balance after this transaction',
                },
                description: {
                    type: String,
                    required: true,
                },
                reference: {
                    type: String,
                    required: true,
                },
                status: {
                    type: String,
                    enum: ['pending', 'completed', 'failed'],
                    default: 'completed',
                },
                metadata: {
                    type: mongoose.Schema.Types.Mixed,
                    description: 'Additional transaction data',
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        bankAccounts: [
            {
                bankName: {
                    type: String,
                    required: true,
                },
                accountNumber: {
                    type: String,
                    required: true,
                    validate: {
                        validator: function (v) {
                            return /^\d{10}$/.test(v); // Nigerian bank account: 10 digits
                        },
                        message: 'Account number must be 10 digits',
                    },
                },
                accountName: {
                    type: String,
                    required: true,
                },
                isDefault: {
                    type: Boolean,
                    default: false,
                },
            },
        ],
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes for performance
// walletSchema.index({ userId: 1 }); // Already indexed by unique: true
walletSchema.index({ 'ledger.reference': 1 });
walletSchema.index({ 'ledger.createdAt': -1 });

// Virtual: Available balance (balance + earningsBalance - lockedBalance - pendingWithdrawalBalance)
walletSchema.virtual('availableBalance').get(function () {
    return this.balance + this.earningsBalance - this.lockedBalance - this.pendingWithdrawalBalance;
});

// Virtual: Total balance (all balances combined)
walletSchema.virtual('totalBalance').get(function () {
    return this.balance + this.earningsBalance + this.lockedBalance + this.pendingWithdrawalBalance;
});

// Instance method: Add ledger entry
walletSchema.methods.addLedgerEntry = function (entry) {
    this.ledger.push({
        ...entry,
        balance: this.balance,
        createdAt: new Date(),
    });
};

// Instance method: Get recent transactions
walletSchema.methods.getRecentTransactions = function (limit = 50) {
    return this.ledger
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, limit);
};

// Static method: Generate unique reference
walletSchema.statics.generateReference = function (type) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const prefix = type.substring(0, 3).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
};

const Wallet = mongoose.model('Wallet', walletSchema);

export default Wallet;
