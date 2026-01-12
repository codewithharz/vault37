import mongoose from 'mongoose';

const systemSettingsSchema = new mongoose.Schema(
    {
        tpia: {
            investmentAmount: { type: Number, default: 1000000 },
            profitAmount: { type: Number, default: 50000 },
            cycleDurationDays: { type: Number, default: 37 },
            autoApproveEnabled: { type: Boolean, default: true },
            approvalWindowMin: { type: Number, default: 30 },
            approvalWindowMax: { type: Number, default: 60 },
            totalCycles: { type: Number, default: 24 },
            coreCycles: { type: Number, default: 12 },
            extendedCycles: { type: Number, default: 12 },
            exitWindowInterval: { type: Number, default: 3 },
            exitWindowDuration: { type: Number, default: 14 },
        },
        gdc: {
            tpiasPerGdc: { type: Number, default: 10 },
        },
        economics: {
            monthlyMarginPercent: { type: Number, default: 10.5 },
        },
        exitPenalties: {
            type: Map,
            of: Number,
            default: {
                '15': 0.40,
                '18': 0.30,
                '21': 0.20,
                '24': 0.00
            }
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        logs: [{
            adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            adminEmail: String,
            action: { type: String, enum: ['UPDATE', 'RESET'] },
            reason: String,
            timestamp: { type: Date, default: Date.now },
            changes: Object
        }],
    },
    {
        timestamps: true,
        minimize: false, // Ensure empty objects are stored
    }
);

// We only want one settings document
systemSettingsSchema.statics.getSettings = async function () {
    let settings = await this.findOne({ isActive: true });
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

const SystemSettings = mongoose.model('SystemSettings', systemSettingsSchema);

export default SystemSettings;
