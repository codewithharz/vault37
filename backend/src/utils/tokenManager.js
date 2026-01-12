import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import AppError from './AppError.js';

/**
 * Generate JWT Access Token
 * @param {Object} payload - Data to encode in token
 * @returns {String} JWT token
 */
export const generateAccessToken = (payload) => {
    return jwt.sign(payload, config.jwt.accessSecret, {
        expiresIn: config.jwt.accessExpire,
    });
};

/**
 * Generate JWT Refresh Token
 * @param {Object} payload - Data to encode in token
 * @returns {String} JWT token
 */
export const generateRefreshToken = (payload) => {
    // Add a unique ID to ensure tokens are unique even if generated in the same second
    const refreshPayload = {
        ...payload,
        jti: Math.random().toString(36).substring(7)
    };
    return jwt.sign(refreshPayload, config.jwt.refreshSecret, {
        expiresIn: config.jwt.refreshExpire,
    });
};

/**
 * Verify JWT Access Token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
export const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, config.jwt.accessSecret);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new AppError('Access token has expired', 401);
        }
        if (error.name === 'JsonWebTokenError') {
            throw new AppError('Invalid access token', 401);
        }
        throw new AppError('Token verification failed', 401);
    }
};

/**
 * Verify JWT Refresh Token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
export const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, config.jwt.refreshSecret);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new AppError('Refresh token has expired. Please login again', 401);
        }
        if (error.name === 'JsonWebTokenError') {
            throw new AppError('Invalid refresh token', 401);
        }
        throw new AppError('Token verification failed', 401);
    }
};

/**
 * Generate both access and refresh tokens
 * @param {Object} user - User object
 * @returns {Object} Object containing both tokens
 */
export const generateTokenPair = (user) => {
    const payload = {
        id: user._id,
        email: user.email,
        role: user.role,
    };

    return {
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload),
    };
};
