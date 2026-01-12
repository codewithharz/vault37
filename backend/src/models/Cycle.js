import mongoose from 'mongoose';

const cycleSchema = new mongoose.Schema(
    {
        gdc: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'GDC',
            required: true,
            index: true,
        },
        tpia: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'TPIA',
            index: true,
        },
        cycleNumber: {
            type: Number,
            required: true,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['running', 'completed', 'failed'],
            default: 'running',
        },
        profitRate: {
            type: Number,
            required: true,
            description: 'The return percentage applied during this cycle',
        },
        totalProfitDistributed: {
            type: Number,
            default: 0,
        },
        executionLog: [
            {
                timestamp: { type: Date, default: Date.now },
                event: String,
                details: mongoose.Schema.Types.Mixed,
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Index for getting cycles for a TPIA sequentially
cycleSchema.index({ tpia: 1, cycleNumber: 1 });
cycleSchema.index({ gdc: 1, cycleNumber: 1 }); // Still useful for cluster reports

const Cycle = mongoose.model('Cycle', cycleSchema);

export default Cycle;
