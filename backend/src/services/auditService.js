import AuditLog from '../models/AuditLog.js';

/**
 * Log an administrative action
 * @param {Object} logData - Action details
 */
export const logAdminAction = async ({
    adminId,
    userId,
    action,
    targetType,
    targetId,
    previousData = null,
    newData = null,
    ipAddress = '',
    userAgent = '',
    metadata = {},
    status = 'success',
    errorMessage = null,
}) => {
    try {
        await AuditLog.create({
            adminId,
            userId: userId || adminId, // Fallback to adminId for backward compatibility
            action,
            targetType,
            targetId,
            previousData,
            newData,
            ipAddress,
            userAgent,
            metadata,
            status,
            errorMessage,
        });
    } catch (error) {
        console.error('CRITICAL: Audit log failed:', error.message);
        // We log to console but don't crash the main operation
    }
};

/**
 * Get audit logs with filters
 * @param {Object} filters - Filter criteria
 * @param {Object} options - Pagination options
 */
export const getAuditLogs = async (filters = {}, { page = 1, limit = 50 } = {}) => {
    const skip = (page - 1) * limit;

    const logs = await AuditLog.find(filters)
        .populate('adminId', 'fullName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await AuditLog.countDocuments(filters);

    return {
        logs,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};
