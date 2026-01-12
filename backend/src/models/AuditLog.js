import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            index: true,
        },
        action: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        module: {
            type: String,
            index: true,
        },
        newData: {
            type: mongoose.Schema.Types.Mixed,
        },
        ipAddress: String,
        userAgent: String,
        metadata: {
            type: mongoose.Schema.Types.Mixed,
        },
        status: {
            type: String,
            enum: ['success', 'failure'],
            default: 'success',
        },
        errorMessage: String,
    },
    {
        timestamps: { createdAt: true, updatedAt: false }, // Immutable
    }
);

// Prevent updates to audit logs
auditLogSchema.pre('save', function (next) {
    if (!this.isNew) {
        return next(new Error('Audit logs are immutable and cannot be modified.'));
    }
    next();
});

// Index for searching logs by target
auditLogSchema.index({ targetType: 1, targetId: 1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
