/**
 * Custom Application Error Class
 * Extends the native Error class with HTTP status codes
 */
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true; // Distinguish operational errors from programming errors

        Error.captureStackTrace(this, this.constructor);
    }
}

export default AppError;
