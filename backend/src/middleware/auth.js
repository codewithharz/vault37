import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { verifyAccessToken } from '../utils/tokenManager.js';
import User from '../models/User.js';

/**
 * Protect routes - Verify JWT token
 */
export const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Check for token in Authorization header
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
        return next(
            new AppError('Not authorized to access this route. Please login', 401)
        );
    }

    try {
        // Verify token
        const decoded = verifyAccessToken(token);

        // Get user from token
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return next(
                new AppError('User no longer exists. Please login again', 401)
            );
        }

        // Check if user is active (not locked)
        if (user.isLocked) {
            return next(
                new AppError(
                    'Account is locked due to multiple failed login attempts. Please contact support',
                    403
                )
            );
        }

        // Attach user to request object
        req.user = user;
        next();
    } catch (error) {
        return next(error);
    }
});

/**
 * Authorize specific roles
 * @param  {...String} roles - Allowed roles
 */
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError(
                    `User role '${req.user.role}' is not authorized to access this route`,
                    403
                )
            );
        }
        next();
    };
};
