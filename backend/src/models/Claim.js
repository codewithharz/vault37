import mongoose from 'mongoose';

const claimStatus = {
    PENDING: 'pending',
    REVIEWING: 'reviewing',
    APPROVED: 'approved',
    REJECTED: 'rejected'
};

const claimSchema = new mongoose.Schema(
    {
        tpiaId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'TPIA',
            required: true,
            index: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        commodityId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Commodity',
            required: true,
        },
        claimAmount: {
            type: Number,
            required: true,
        },
        reason: {
            type: String,
            required: [true, 'Please provide a reason for the claim'],
        },
        status: {
            type: String,
            enum: Object.values(claimStatus),
            default: claimStatus.PENDING,
        },
        proofUrls: [String],
        adminNotes: String,
        processedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        processedAt: Date
    },
    {
        timestamps: true,
    }
);

// Prevent duplicate claims for the same TPIA (only one active/pending claim at a time)
claimSchema.index({ tpiaId: 1, status: 1 }, {
    unique: true,
    partialFilterExpression: { status: { $in: ['pending', 'reviewing'] } }
});

const Claim = mongoose.model('Claim', claimSchema);

export default Claim;
export { claimStatus };
