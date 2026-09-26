/**
 * Centralized error-handling middleware.
 *
 * Express identifies error-handling middleware by
 * the four parameters: err, req, res, next.
 *
 * Application errors with an explicit statusCode can
 * expose their message to the client.
 *
 * Known Prisma database errors are converted into
 * appropriate API responses.
 *
 * Unexpected server errors return a generic message
 * so internal implementation details are not exposed.
 */
const errorHandler = (err, req, res, next) => {
    /**
     * Determine the HTTP status code before logging.
     *
     * Errors without an explicit status code are treated
     * as unexpected server errors and receive status 500.
     */
    const statusCode = err.statusCode || 500;

    /**
     * Use the request logger when available.
     *
     * pino-http attaches the logger to req.log.
     *
     * Expected client errors (4xx) are logged as warnings
     * because they represent handled request problems.
     *
     * Unexpected server errors (5xx) are logged as errors
     * because they may require investigation.
     *
     * The fallback keeps this middleware usable in
     * isolated unit tests where pino-http is not installed
     * on the test Express application.
     */
    const logData = {
        err,
        statusCode,
        prismaCode: err.code,
    };

    if (req.log) {
        if (statusCode >= 500) {
            req.log.error(
                logData,
                "Request failed"
            );
        } else {
            req.log.warn(
                logData,
                "Request failed"
            );
        }
    } else {
        console.error(err);
    }

    /**
     * Prisma P2002 means a unique constraint was violated.
     *
     * The meta.target property identifies the field or
     * fields that caused the unique constraint violation.
     */
    if (err.code === "P2002") {
        const target = err.meta?.target;

        if (
            Array.isArray(target) &&
            target.includes("sku")
        ) {
            return res.status(409).json({
                success: false,
                message:
                    "A product with this SKU already exists",
            });
        }

        if (
            Array.isArray(target) &&
            target.includes("email")
        ) {
            return res.status(409).json({
                success: false,
                message:
                    "A user with this email already exists",
            });
        }

        /**
         * Keep a generic message for unique constraints
         * that do not have a specific client-facing message.
         */
        return res.status(409).json({
            success: false,
            message:
                "A record with the same unique value already exists",
        });
    }

    /**
     * Do not expose internal error details for
     * unexpected server errors.
     */
    const message =
        statusCode >= 500
            ? "Internal server error"
            : err.message || "Request failed";

    return res.status(statusCode).json({
        success: false,
        message,
    });
};

module.exports = errorHandler;