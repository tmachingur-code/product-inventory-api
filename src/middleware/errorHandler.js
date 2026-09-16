/**
 * Centralized error-handling middleware.
 *
 * Express identifies error-handling middleware by
 * the four parameters: err, req, res, next.
 */
const errorHandler = (err, req, res, next) => {
    console.error(err);

    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal server error",
    });
};

module.exports = errorHandler;