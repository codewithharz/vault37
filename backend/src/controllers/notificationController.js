import * as notificationService from '../services/notificationService.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

/**
 * @desc    Get user notifications
 * @route   GET /api/notifications
 * @access  Private
 */
export const getMyNotifications = asyncHandler(async (req, res) => {
    const { page, limit } = req.query;

    const data = await notificationService.getUserNotifications(req.user.id, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
    });

    res.status(200).json({
        success: true,
        data,
    });
});

/**
 * @desc    Mark notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
export const markRead = asyncHandler(async (req, res) => {
    const notification = await notificationService.markAsRead(req.params.id, req.user.id);

    if (!notification) {
        throw new AppError('Notification not found', 404);
    }

    res.status(200).json({
        success: true,
        message: 'Notification marked as read',
    });
});

/**
 * @desc    Mark all notifications as read
 * @route   POST /api/notifications/read-all
 * @access  Private
 */
export const markAllRead = asyncHandler(async (req, res) => {
    await notificationService.markAllAsRead(req.user.id);

    res.status(200).json({
        success: true,
        message: 'All notifications marked as read',
    });
});
