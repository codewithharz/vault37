import Joi from 'joi';

/**
 * Purchase TPIA Validation Schema
 */
export const purchaseTPIASchema = Joi.object({
    mode: Joi.string()
        .valid('TPM', 'EPS')
        .optional(),
    commodityId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .optional()
        .messages({
            'string.pattern.base': 'Invalid commodity ID format',
        }),
    cycleStartMode: Joi.string()
        .valid('CLUSTER', 'IMMEDIATE')
        .default('CLUSTER')
        .optional(),
    quantity: Joi.number()
        .integer()
        .min(1)
        .max(10)
        .default(1)
        .optional()
        .messages({
            'number.base': 'Quantity must be a number',
            'number.integer': 'Quantity must be an integer',
            'number.min': 'Quantity must be at least 1',
            'number.max': 'Quantity cannot exceed 10',
        }),
});

/**
 * Approval Validation Schema
 */
export const approvalSchema = Joi.object({
    notes: Joi.string()
        .optional()
        .trim()
        .max(500)
        .messages({
            'string.max': 'Notes cannot exceed 500 characters',
        }),
});

/**
 * Rejection Validation Schema
 */
export const rejectionSchema = Joi.object({
    reason: Joi.string()
        .required()
        .trim()
        .min(10)
        .max(500)
        .messages({
            'string.empty': 'Rejection reason is required',
            'string.min': 'Rejection reason must be at least 10 characters',
            'string.max': 'Rejection reason cannot exceed 500 characters',
            'any.required': 'Rejection reason is required',
        }),
});
