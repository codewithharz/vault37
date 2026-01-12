import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import * as notificationService from '../services/notificationService.js';
import * as auditService from '../services/auditService.js';

/**
 * @desc    Submit KYC details
 * @route   POST /api/users/kyc
 * @access  Private
 */
export const submitKYC = asyncHandler(async (req, res) => {
    const { idType, idNumber, documentUrl, address, dateOfBirth } = req.body;

    const user = await User.findById(req.user.id);

    if (user.kycStatus === 'verified') {
        throw new AppError('KYC already verified', 400);
    }

    user.address = address || user.address;
    user.dateOfBirth = dateOfBirth || user.dateOfBirth;
    user.kycDocuments = {
        idType,
        idNumber,
        documentUrl: req.file ? `/uploads/kyc/${req.file.filename}` : documentUrl,
        submittedAt: new Date(),
    };
    user.kycStatus = 'pending';

    await user.save();

    res.status(200).json({
        success: true,
        message: 'KYC documents submitted successfully for review',
        data: {
            kycStatus: user.kycStatus,
        },
    });
});

/**
 * @desc    Review KYC submission (Admin)
 * @route   PATCH /api/admin/users/:id/kyc
 * @access  Private/Admin
 */
export const reviewKYC = asyncHandler(async (req, res) => {
    const { status, rejectionReason } = req.body;

    if (!['verified', 'rejected'].includes(status)) {
        throw new AppError('Invalid status. Use verified or rejected', 400);
    }

    const user = await User.findById(req.params.id);
    if (!user) {
        throw new AppError('User not found', 44);
    }

    const oldStatus = user.kycStatus;
    user.kycStatus = status;

    if (status === 'verified') {
        user.kycDocuments.verifiedAt = new Date();
    } else {
        user.kycDocuments.rejectionReason = rejectionReason;
        if (!rejectionReason) {
            throw new AppError('Rejection reason is required', 400);
        }
    }

    await user.save();

    // Notify user
    await notificationService.createNotification(user._id, {
        title: status === 'verified' ? 'KYC Verified' : 'KYC Rejected',
        message: status === 'verified'
            ? 'Congratulations! Your identity has been verified. You can now access all platform features.'
            : `Your KYC submission was rejected. Reason: ${rejectionReason}`,
        type: status === 'verified' ? 'success' : 'warning',
    });

    // Audit log
    await auditService.logAdminAction({
        adminId: req.user.id,
        action: 'review_kyc',
        targetType: 'user',
        targetId: user._id,
        previousData: { kycStatus: oldStatus },
        newData: { kycStatus: status },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
    });

    res.status(200).json({
        success: true,
        message: `KYC status updated to ${status}`,
    });
});
