import Joi from 'joi';

/**
 * Deposit Request Validation Schema (Paystack)
 */
export const depositRequestSchema = Joi.object({
    amount: Joi.number()
        .min(10000)
        .required()
        .messages({
            'number.base': 'Amount must be a number',
            'number.min': 'Minimum deposit amount is ₦10,000',
            'any.required': 'Amount is required',
        }),
});

/**
 * Withdrawal Request Validation Schema
 */
export const withdrawalRequestSchema = Joi.object({
    amount: Joi.number()
        .min(5000)
        .required()
        .messages({
            'number.base': 'Amount must be a number',
            'number.min': 'Minimum withdrawal amount is ₦5,000',
            'any.required': 'Amount is required',
        }),

    bankAccountId: Joi.string()
        .optional()
        .messages({
            'string.base': 'Bank account ID must be a string',
        }),
});

/**
 * Bank Account Validation Schema
 */
export const bankAccountSchema = Joi.object({
    bankName: Joi.string()
        .required()
        .trim()
        .messages({
            'string.empty': 'Bank name is required',
            'any.required': 'Bank name is required',
        }),

    accountNumber: Joi.string()
        .pattern(/^\d{10}$/)
        .required()
        .messages({
            'string.empty': 'Account number is required',
            'string.pattern.base': 'Account number must be exactly 10 digits',
            'any.required': 'Account number is required',
        }),

    accountName: Joi.string()
        .required()
        .trim()
        .messages({
            'string.empty': 'Account name is required',
            'any.required': 'Account name is required',
        }),
});

/**
 * Transaction Query Validation Schema
 */
export const transactionQuerySchema = Joi.object({
    type: Joi.string()
        .valid('deposit', 'withdrawal', 'tpia_purchase', 'cycle_profit', 'refund', 'maturity_return')
        .optional(),

    status: Joi.string()
        .valid('pending', 'processing', 'completed', 'failed', 'cancelled')
        .optional(),

    page: Joi.number()
        .integer()
        .min(1)
        .default(1)
        .optional(),

    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(50)
        .optional(),

    startDate: Joi.date()
        .optional(),

    endDate: Joi.date()
        .optional()
        .when('startDate', {
            is: Joi.exist(),
            then: Joi.date().min(Joi.ref('startDate')),
        }),
});
