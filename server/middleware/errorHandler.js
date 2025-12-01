const logger = require('../utils/logger');

// Custom error class
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
    let { statusCode, message } = err;

    // Default to 500 if no status code
    if (!statusCode) statusCode = 500;
    if (!message) message = 'Internal Server Error';

    // Log error
    if (statusCode >= 500) {
        logger.error('Server error', {
            error: message,
            stack: err.stack,
            url: req.originalUrl,
            method: req.method,
            ip: req.ip
        });
    } else {
        logger.warn('Client error', {
            error: message,
            url: req.originalUrl,
            method: req.method,
            statusCode
        });
    }

    // Send error response
    const response = {
        success: false,
        error: {
            message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    };

    res.status(statusCode).json(response);
};

// Validation error handler
const handleValidationError = (error) => {
    if (error.name === 'ZodError') {
        const errors = error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
        }));

        return new AppError(
            `Validation failed: ${errors.map(e => `${e.field} - ${e.message}`).join(', ')}`,
            400
        );
    }
    return error;
};

module.exports = {
    AppError,
    errorHandler,
    handleValidationError
};
