import mongoose from 'mongoose';
import { GDC_CONSTANTS, GDC_STATUS } from '../config/constants.js';

const gdcSchema = new mongoose.Schema(
    {
        // GDC number (10, 20, 30, 40...)
        gdcNumber: {
            type: Number,
            required: true,
            unique: true,
            index: true,
        },

        // Commodity linked to this GDC
        commodityId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Commodity',
            required: true,
            index: true,
        },

        // Array of TPIAs in this GDC
        tpias: [
            {
                tpiaId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'TPIA',
                    required: true,
                },
                tpiaNumber: {
                    type: Number,
                    required: true,
                },
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true,
                },
                purchaseDate: {
                    type: Date,
                    required: true,
                },
                approvalDate: {
                    type: Date,
                },
            },
        ],

        // Current fill count (0-10)
        currentFill: {
            type: Number,
            default: 0,
            min: 0,
            max: GDC_CONSTANTS.TPIAS_PER_GDC,
        },

        // GDC status
        status: {
            type: String,
            enum: Object.values(GDC_STATUS),
            default: GDC_STATUS.FILLING,
            index: true,
        },

        // Activation date (when GDC became FULL/ACTIVE)
        activationDate: {
            type: Date,
        },

        // Next scheduled cycle date
        nextCycleDate: {
            type: Date,
            index: true,
        },

        // Completion date (when 24 cycles are done)
        completionDate: {
            type: Date,
        },

        // Progress tracking
        currentCycle: {
            type: Number,
            default: 0,
            min: 0,
            max: 24,
        },

        totalCycles: {
            type: Number,
            default: 24,
        },

        // Link to cycle history
        cycleHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Cycle',
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Indexes for performance
gdcSchema.index({ status: 1, currentFill: 1, commodityId: 1 });

// Static method: Find or create GDC by number and commodity
gdcSchema.statics.findOrCreate = async function (gdcNumber, commodityId) {
    let gdc = await this.findOne({ gdcNumber, commodityId });

    if (!gdc) {
        gdc = await this.create({
            gdcNumber,
            commodityId,
            tpias: [],
            currentFill: 0,
            status: GDC_STATUS.FILLING,
        });
    }

    return gdc;
};

// Static method: Get current filling GDC for a specific commodity
gdcSchema.statics.getCurrentFillingGDC = async function (commodityId) {
    return this.findOne({
        commodityId,
        status: GDC_STATUS.FILLING,
        currentFill: { $lt: GDC_CONSTANTS.TPIAS_PER_GDC },
    }).sort({ gdcNumber: 1 });
};

// Instance method: Add TPIA to GDC
gdcSchema.methods.addTPIA = async function (tpia) {
    // Check if GDC is full
    if (this.currentFill >= GDC_CONSTANTS.TPIAS_PER_GDC) {
        throw new Error('GDC is already full');
    }

    // Check if TPIA already exists
    const exists = this.tpias.some(
        (t) => t.tpiaNumber === tpia.tpiaNumber
    );

    if (exists) {
        throw new Error('TPIA already in this GDC');
    }

    // Add TPIA
    this.tpias.push({
        tpiaId: tpia._id,
        tpiaNumber: tpia.tpiaNumber,
        userId: tpia.userId,
        purchaseDate: tpia.purchaseDate,
        approvalDate: tpia.approvalDate,
    });

    this.currentFill = this.tpias.length;

    // Update status if full
    if (this.currentFill >= GDC_CONSTANTS.TPIAS_PER_GDC) {
        this.status = GDC_STATUS.FULL;
    }

    return this.save();
};

// Instance method: Remove TPIA from GDC (if rejected)
gdcSchema.methods.removeTPIA = async function (tpiaNumber) {
    this.tpias = this.tpias.filter((t) => t.tpiaNumber !== tpiaNumber);
    this.currentFill = this.tpias.length;

    // Update status
    if (this.currentFill < GDC_CONSTANTS.TPIAS_PER_GDC) {
        this.status = GDC_STATUS.FILLING;
    }

    return this.save();
};

// Virtual: Available slots
gdcSchema.virtual('availableSlots').get(function () {
    return GDC_CONSTANTS.TPIAS_PER_GDC - this.currentFill;
});

// Virtual: Is full
gdcSchema.virtual('isFull').get(function () {
    return this.currentFill >= GDC_CONSTANTS.TPIAS_PER_GDC;
});

// Virtual: Fill percentage
gdcSchema.virtual('fillPercentage').get(function () {
    return (this.currentFill / GDC_CONSTANTS.TPIAS_PER_GDC) * 100;
});

// Ensure virtuals are included in JSON
gdcSchema.set('toJSON', { virtuals: true });
gdcSchema.set('toObject', { virtuals: true });

const GDC = mongoose.model('GDC', gdcSchema);

export default GDC;
