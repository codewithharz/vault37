import AppError from '../utils/AppError.js';

/**
 * Joi Validation Middleware
 * Validates request body, query, or params against a Joi schema
 * @param {Object} schema - Joi validation schema
 * @param {String} property - Property to validate (body, query, params)
 */
const validate = (schema, property = 'body') => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false, // Return all errors, not just the first one
            stripUnknown: true, // Remove unknown fields
        });

        if (error) {
            const errorMessage = error.details
                .map((detail) => detail.message)
                .join(', ');

            return next(new AppError(errorMessage, 400));
        }

        // Replace request property with validated value
        // Note: req.query is read-only, so we need to handle it differently
        if (property === 'query') {
            // For query, we need to modify the existing object, not replace it
            Object.keys(req.query).forEach(key => delete req.query[key]);
            Object.assign(req.query, value);
        } else {
            req[property] = value;
        }

        next();
    };
};

export default validate;
