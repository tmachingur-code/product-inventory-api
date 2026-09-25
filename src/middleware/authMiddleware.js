const jwt = require("jsonwebtoken");

const env = require("../config/env");

/**
 * Authentication Middleware
 *
 * Verifies the JWT supplied in the Authorization header.
 *
 * Expected format:
 *
 * Authorization: Bearer <token>
 *
 * When the token is valid, the decoded user information
 * is attached to req.user.
 */
const authMiddleware = (req, res, next) => {
    const authorizationHeader = req.headers.authorization;

    /**
     * Check whether the Authorization header exists
     * and follows the expected Bearer token format.
     */
    if (
        !authorizationHeader ||
        !authorizationHeader.startsWith("Bearer ")
    ) {
        return res.status(401).json({
            success: false,
            message: "Authentication token is required",
        });
    }

    // Extract the JWT from "Bearer <token>".
    const token = authorizationHeader.split(" ")[1];

    try {
        /**
         * Verify the token using the application's
         * JWT secret.
         *
         * jwt.verify() also checks whether the token
         * has expired.
         */
        const decoded = jwt.verify(
            token,
            env.jwtSecret
        );

        /**
         * Store the authenticated user's information
         * on the request object.
         *
         * Controllers further down the request chain
         * can access it through req.user.
         */
        req.user = decoded;

        // Authentication succeeded.
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message:
                "Invalid or expired authentication token",
        });
    }
};

module.exports = authMiddleware;