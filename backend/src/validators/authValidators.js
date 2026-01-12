import Joi from 'joi';

/**
 * Registration Validation Schema
 */
export const registerSchema = Joi.object({
    fullName: Joi.string()
        .min(2)
        .max(100)
        .trim()
        .required()
        .messages({
            'string.empty': 'Full name is required',
            'string.min': 'Full name must be at least 2 characters',
            'string.max': 'Full name cannot exceed 100 characters',
        }),

    email: Joi.string()
        .email()
        .lowercase()
        .trim()
        .required()
        .messages({
            'string.empty': 'Email is required',
            'string.email': 'Please provide a valid email address',
        }),

    password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .required()
        .messages({
            'string.empty': 'Password is required',
            'string.min': 'Password must be at least 8 characters',
            'string.pattern.base':
                'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        }),

    confirmPassword: Joi.string()
        .valid(Joi.ref('password'))
        .required()
        .messages({
            'any.only': 'Passwords do not match',
            'string.empty': 'Please confirm your password',
        }),

    phone: Joi.string()
        .pattern(/^(\+234|0)[\s-]*[789][01][\s-]*(\d[\s-]*){8}$/)
        .required()
        .messages({
            'string.empty': 'Phone number is required',
            'string.pattern.base': 'Please provide a valid Nigerian phone number (e.g., +2348012345678 or 08012345678)',
        }),

    referralCode: Joi.string()
        .optional()
        .allow(''),
});

/**
 * Login Validation Schema
 */
export const loginSchema = Joi.object({
    email: Joi.string()
        .email()
        .lowercase()
        .trim()
        .required()
        .messages({
            'string.empty': 'Email is required',
            'string.email': 'Please provide a valid email address',
        }),

    password: Joi.string()
        .required()
        .messages({
            'string.empty': 'Password is required',
        }),
});

/**
 * Refresh Token Validation Schema
 */
export const refreshTokenSchema = Joi.object({
    refreshToken: Joi.string()
        .required()
        .messages({
            'string.empty': 'Refresh token is required',
        }),
});

/**
 * Forgot Password Validation Schema
 */
export const forgotPasswordSchema = Joi.object({
    email: Joi.string()
        .email()
        .lowercase()
        .trim()
        .required()
        .messages({
            'string.empty': 'Email is required',
            'string.email': 'Please provide a valid email address',
        }),
});

/**
 * Reset Password Validation Schema
 */
export const resetPasswordSchema = Joi.object({
    token: Joi.string()
        .required()
        .messages({
            'string.empty': 'Reset token is required',
        }),

    password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .required()
        .messages({
            'string.empty': 'Password is required',
            'string.min': 'Password must be at least 8 characters',
            'string.pattern.base':
                'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        }),

    confirmPassword: Joi.string()
        .valid(Joi.ref('password'))
        .required()
        .messages({
            'any.only': 'Passwords do not match',
            'string.empty': 'Please confirm your password',
        }),
});
