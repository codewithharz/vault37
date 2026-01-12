import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        wallet: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Wallet',
            required: true,
        },
        type: {
            type: String,
            enum: ['deposit', 'withdrawal', 'tpia_purchase', 'cycle_profit', 'refund', 'maturity_return'],
            required: true,
        },
        amount: {
            type: Number,
            required: [true, 'Amount is required'],
            min: [0, 'Amount must be positive'],
        },
        status: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
            default: 'pending',
        },
        reference: {
            type: String,
            required: true,
            unique: true,
        },
        paymentMethod: {
            type: String,
            enum: ['bank_transfer', 'paystack', 'system', 'other'],
            default: 'system',
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            description: 'Additional transaction data (proof of payment, bank details, etc.)',
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        approvalDate: Date,
        failureReason: {
            type: String,
        },

        // Admin notes (for approvals/rejections)
        notes: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for performance
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ status: 1 });
// transactionSchema.index({ reference: 1 }); // Already indexed by unique: true
transactionSchema.index({ type: 1, status: 1 });

// Static method: Generate unique reference
transactionSchema.statics.generateReference = function (type) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    const prefix = {
        deposit: 'DEP',
        withdrawal: 'WDR',
        tpia_purchase: 'TPP',
        cycle_profit: 'CPR',
        refund: 'REF',
    }[type] || 'TXN';

    return `${prefix}-${timestamp}-${random}`;
};

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
