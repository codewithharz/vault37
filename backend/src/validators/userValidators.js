import Joi from 'joi';

/**
 * Update Profile Validation Schema
 */
export const updateProfileSchema = Joi.object({
    fullName: Joi.string()
        .min(2)
        .max(100)
        .trim()
        .optional()
        .messages({
            'string.min': 'Full name must be at least 2 characters',
            'string.max': 'Full name cannot exceed 100 characters',
        }),

    phone: Joi.string()
        .pattern(/^(\+234|0)[\s-]*[789][01][\s-]*(\d[\s-]*){8}$/)
        .optional()
        .messages({
            'string.pattern.base': 'Please provide a valid Nigerian phone number (e.g., +2348012345678 or 08012345678)',
        }),
});

/**
 * Switch Mode Validation Schema
 */
export const switchModeSchema = Joi.object({
    mode: Joi.string()
        .valid('TPM', 'EPS')
        .required()
        .messages({
            'any.only': 'Mode must be either TPM or EPS',
            'any.required': 'Mode is required',
        }),
});
