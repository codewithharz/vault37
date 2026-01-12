import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        type: {
            type: String,
            enum: ['info', 'success', 'warning', 'error'],
            default: 'info',
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            description: 'Linked entity IDs or additional context',
        },
    },
    {
        timestamps: true,
    }
);

// Index for getting unread notifications quickly
notificationSchema.index({ userId: 1, isRead: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
