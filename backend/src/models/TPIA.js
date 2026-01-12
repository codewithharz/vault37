import mongoose from 'mongoose';
import { TPIA_CONSTANTS, TPIA_STATUS, calculateMaturityDate, CYCLE_START_MODES } from '../config/constants.js';

const tpiaSchema = new mongoose.Schema(
    {
        // Sequential TPIA number (1, 2, 3, 4...)
        tpiaNumber: {
            type: Number,
            required: true,
            unique: true,
            index: true,
        },

        // GDC number (10, 20, 30, 40...)
        gdcNumber: {
            type: Number,
            required: true,
            index: true,
        },

        // User who purchased this TPIA
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        // Investment amount
        amount: {
            type: Number,
            required: true,
            default: TPIA_CONSTANTS.INVESTMENT_AMOUNT,
        },

        // Current value (compounded for TPM)
        currentValue: {
            type: Number,
            required: true,
            default: TPIA_CONSTANTS.INVESTMENT_AMOUNT,
        },

        // Purchase date
        purchaseDate: {
            type: Date,
            required: true,
            default: Date.now,
        },

        // Approval date (when admin approves or auto-approved)
        approvalDate: {
            type: Date,
        },

        // Next cycle maturity date
        maturityDate: {
            type: Date,
        },

        // Final investment maturity date (24 cycles)
        finalMaturityDate: {
            type: Date,
        },

        // TPIA status
        status: {
            type: String,
            enum: Object.values(TPIA_STATUS),
            default: TPIA_STATUS.PENDING_APPROVAL,
            index: true,
        },

        // Profit amount
        profitAmount: {
            type: Number,
            required: true,
            default: TPIA_CONSTANTS.PROFIT_AMOUNT,
        },

        // User's mode at purchase time (TPM or EPS)
        userMode: {
            type: String,
            enum: ['TPM', 'EPS'],
            required: true,
        },

        // Cycle start mode (Cluster vs Immediate)
        cycleStartMode: {
            type: String,
            enum: Object.values(CYCLE_START_MODES),
            default: CYCLE_START_MODES.CLUSTER,
        },

        // Progress tracking
        currentCycle: {
            type: Number,
            default: 0,
            min: 0,
            max: TPIA_CONSTANTS.TOTAL_CYCLES,
        },

        totalCycles: {
            type: Number,
            default: TPIA_CONSTANTS.TOTAL_CYCLES,
        },

        // Investment Phase Tracking
        investmentPhase: {
            type: String,
            enum: ['CORE', 'EXTENDED', 'COMPLETED'],
            default: 'CORE',
            index: true,
        },

        // Exit Window Dates (if in EXTENDED phase)
        nextExitWindowStart: Date,
        nextExitWindowEnd: Date,

        // Withdrawal Request
        withdrawalRequested: {
            type: Boolean,
            default: false,
        },
        withdrawalRequestDate: Date,
        exitPenaltyApplied: {
            type: Boolean,
            default: false
        },
        penaltyAmount: {
            type: Number,
            default: 0
        },
        returnedPrincipal: {
            type: Number,
            default: 0
        },

        // Admin who approved (if manually approved)
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },

        // Whether auto-approved
        autoApproved: {
            type: Boolean,
            default: false,
        },

        // Rejection reason (if rejected)
        rejectionReason: {
            type: String,
        },

        // Transaction reference
        transactionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Transaction',
        },

        // Commodity link
        commodityId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Commodity',
            index: true,
        },

        // Insurance fields
        insurancePolicyNumber: {
            type: String,
            unique: true,
            sparse: true,
        },
        insuranceCertificateUrl: String,

        // Profit history
        profitHistory: [
            {
                cycleId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Cycle',
                },
                amount: Number,
                date: { type: Date, default: Date.now },
                userMode: String, // TPM or EPS at time of payout
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Indexes for performance
tpiaSchema.index({ userId: 1, status: 1 });
tpiaSchema.index({ status: 1, purchaseDate: 1 });
tpiaSchema.index({ status: 1, maturityDate: 1 });
tpiaSchema.index({ gdcNumber: 1, tpiaNumber: 1 });

// Static method: Get next TPIA number
tpiaSchema.statics.getNextTPIANumber = async function () {
    const lastTPIA = await this.findOne().sort({ tpiaNumber: -1 }).select('tpiaNumber');
    return lastTPIA ? lastTPIA.tpiaNumber + 1 : 1;
};

// Static method: Get pending TPIAs for auto-approval
tpiaSchema.statics.getPendingForAutoApproval = async function () {
    const cutoffTime = new Date();
    cutoffTime.setMinutes(cutoffTime.getMinutes() - TPIA_CONSTANTS.ADMIN_APPROVAL_WINDOW_MAX);

    return this.find({
        status: TPIA_STATUS.PENDING_APPROVAL,
        purchaseDate: { $lte: cutoffTime },
    });
};

// Static method: Get matured TPIAs
tpiaSchema.statics.getMaturedTPIAs = async function () {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.find({
        status: TPIA_STATUS.ACTIVE,
        maturityDate: { $lte: today },
    }).populate('userId', 'fullName email mode');
};

// Instance method: Approve TPIA
tpiaSchema.methods.approve = async function (adminId = null) {
    this.status = TPIA_STATUS.ACTIVE;
    this.approvalDate = new Date();
    this.finalMaturityDate = calculateMaturityDate(this.approvalDate);

    if (adminId) {
        this.approvedBy = adminId;
        this.autoApproved = false;
    } else {
        this.autoApproved = true;
    }

    return this.save();
};

// Instance method: Reject TPIA
tpiaSchema.methods.reject = async function (adminId, reason) {
    this.status = TPIA_STATUS.CANCELLED;
    this.approvedBy = adminId;
    this.rejectionReason = reason;
    this.approvalDate = new Date();

    return this.save();
};

// Instance method: Mark as matured
tpiaSchema.methods.markMatured = async function () {
    this.status = TPIA_STATUS.MATURED;
    return this.save();
};

// Instance method: Mark as completed
tpiaSchema.methods.markCompleted = async function () {
    this.status = TPIA_STATUS.COMPLETED;
    return this.save();
};

// Virtual: Days until maturity
tpiaSchema.virtual('daysUntilMaturity').get(function () {
    if (!this.maturityDate) return null;

    const now = new Date();
    const diff = this.maturityDate - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    return days > 0 ? days : 0;
});

// Virtual: Is within approval window
tpiaSchema.virtual('isWithinApprovalWindow').get(function () {
    if (this.status !== TPIA_STATUS.PENDING_APPROVAL) return false;

    const now = new Date();
    const elapsed = (now - this.purchaseDate) / (1000 * 60); // minutes

    return elapsed <= TPIA_CONSTANTS.ADMIN_APPROVAL_WINDOW_MAX;
});

// Ensure virtuals are included in JSON
tpiaSchema.set('toJSON', { virtuals: true });
tpiaSchema.set('toObject', { virtuals: true });

// Generate insurance policy number before saving if not exists
tpiaSchema.pre('save', function (next) {
    if (this.status === TPIA_STATUS.ACTIVE && !this.insurancePolicyNumber) {
        // Format: TPIA-{tpiaNumber}-{13 random digits}
        let randomDigits = '';
        for (let i = 0; i < 13; i++) {
            randomDigits += Math.floor(Math.random() * 10).toString();
        }
        this.insurancePolicyNumber = `TPIA-${this.tpiaNumber}-${randomDigits}`;
    }
    next();
});

const TPIA = mongoose.model('TPIA', tpiaSchema);

export default TPIA;
