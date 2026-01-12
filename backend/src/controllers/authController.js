import User from '../models/User.js';
import Wallet from '../models/Wallet.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { generateTokenPair, verifyRefreshToken } from '../utils/tokenManager.js';

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res, next) => {
    const { fullName, email, password, phone, referralCode } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new AppError('Email already registered', 400));
    }

    // Check if referral code is valid (if provided)
    let referrer = null;
    if (referralCode) {
        referrer = await User.findOne({ referralCode });
        if (!referrer) {
            return next(new AppError('Invalid referral code', 400));
        }
    }

    // Create user
    const user = await User.create({
        fullName,
        email,
        password,
        phone,
        referredBy: referrer?._id,
    });

    // Create wallet for user
    await Wallet.create({
        userId: user._id,
    });

    // Generate tokens
    const tokens = generateTokenPair(user);

    user.refreshTokens = [tokens.refreshToken];
    await user.save({ validateBeforeSave: false });

    // Remove password from output
    user.password = undefined;

    res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                kycStatus: user.kycStatus,
                mode: user.mode,
                referralCode: user.referralCode,
            },
            tokens,
        },
    });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return next(new AppError('Invalid email or password', 401));
    }

    // Check if account is locked
    if (user.isLocked) {
        const lockTimeRemaining = Math.ceil((user.lockUntil - Date.now()) / 60000);
        return next(
            new AppError(
                `Account is locked due to multiple failed login attempts. Please try again in ${lockTimeRemaining} minutes`,
                403
            )
        );
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
        // Increment login attempts
        await user.incLoginAttempts();

        const attemptsLeft = 5 - (user.loginAttempts + 1);
        if (attemptsLeft > 0) {
            return next(
                new AppError(
                    `Invalid email or password. ${attemptsLeft} attempt(s) remaining`,
                    401
                )
            );
        } else {
            return next(
                new AppError(
                    'Account locked due to multiple failed login attempts. Please try again in 15 minutes',
                    403
                )
            );
        }
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
        await user.resetLoginAttempts();
    }

    // Generate tokens
    const tokens = generateTokenPair(user);

    // Store refresh token
    user.refreshTokens.push(tokens.refreshToken);
    // Limit active sessions (e.g. keep last 5)
    if (user.refreshTokens.length > 5) {
        user.refreshTokens.shift();
    }
    await user.save({ validateBeforeSave: false });

    // Remove password from output
    user.password = undefined;

    res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                kycStatus: user.kycStatus,
                mode: user.mode,
                referralCode: user.referralCode,
            },
            tokens,
        },
    });
});

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh-token
 * @access  Public
 */
export const refreshToken = asyncHandler(async (req, res, next) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return next(new AppError('Refresh token is required', 400));
    }

    // Verify refresh token
    let decoded;
    try {
        decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
        // If expired or invalid, we can't do much about rotation here
        return next(err);
    }

    // Get user
    const user = await User.findById(decoded.id).select('+refreshTokens');

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // Check if user is active
    if (!user.isActive) {
        return next(new AppError('Account has been deactivated', 403));
    }

    // Refresh Token Rotation Logic
    const tokenExists = user.refreshTokens.includes(refreshToken);

    if (!tokenExists) {
        // TOKEN REUSE DETECTED!
        // This token was either already rotated or stolen and used.
        // Revoke all tokens for this user for safety.
        user.refreshTokens = [];
        await user.save({ validateBeforeSave: false });
        return next(new AppError('Security alert: Refresh token reuse detected. All sessions revoked.', 401));
    }

    // Generate new token pair
    const tokens = generateTokenPair(user);

    // Rotate token: Remove old one, add new one
    user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
    user.refreshTokens.push(tokens.refreshToken);
    user.markModified('refreshTokens');
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
            tokens,
        },
    });
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res, next) => {
    const { refreshToken } = req.body;

    if (refreshToken && req.user) {
        const user = await User.findById(req.user.id).select('+refreshTokens');
        if (user) {
            user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
            await user.save({ validateBeforeSave: false });
        }
    }

    res.status(200).json({
        success: true,
        message: 'Logout successful',
    });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).populate('wallet');

    res.status(200).json({
        success: true,
        data: {
            user,
        },
    });
});

/**
 * @desc    Forgot password
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req, res, next) => {
    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email });

    // Always return success message (security best practice)
    // Don't reveal if email exists or not
    res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent',
    });

    // If user doesn't exist, stop here
    if (!user) return;

    // TODO: Generate reset token and send email
    // This will be implemented when email service is set up
    console.log('Password reset requested for:', email);
});

/**
 * @desc    Reset password
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req, res, next) => {
    // TODO: Implement password reset logic
    // This will be implemented when email service is set up

    res.status(200).json({
        success: true,
        message: 'Password reset functionality will be available soon',
    });
});
