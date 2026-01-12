import Notification from '../models/Notification.js';

/**
 * Send a notification to a specific user
 * @param {string} userId - ID of the user to notify
 * @param {object} data - Notification data (title, message, type, metadata)
 * @returns {Promise<object>} Created notification
 */
export const createNotification = async (userId, { title, message, type = 'info', metadata = {} }) => {
    try {
        const notification = await Notification.create({
            userId,
            title,
            message,
            type,
            metadata,
        });
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error.message);
        // We don't throw here to avoid failing the main transaction for a notification failure
        return null;
    }
};

/**
 * Get user's notifications
 * @param {string} userId - User ID
 * @param {object} options - Pagination options
 */
export const getUserNotifications = async (userId, { page = 1, limit = 20 } = {}) => {
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Notification.countDocuments({ userId });
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    return {
        notifications,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
        unreadCount,
    };
};

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 * @param {string} userId - User ID (for security check)
 */
export const markAsRead = async (notificationId, userId) => {
    return await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { isRead: true },
        { new: true }
    );
};

/**
 * Mark all user notifications as read
 * @param {string} userId - User ID
 */
export const markAllAsRead = async (userId) => {
    return await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true }
    );
};
