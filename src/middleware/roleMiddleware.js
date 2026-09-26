/**
 * Role Authorization Middleware
 *
 * Checks whether the authenticated user has one
 * of the roles allowed to access a protected route.
 *
 * This middleware should be used AFTER authMiddleware,
 * because it expects req.user to already exist.
 *
 * Example:
 *
 * router.delete(
 *     "/:id",
 *     authMiddleware,
 *     roleMiddleware("ADMIN"),
 *     controller.delete
 * );
 */
const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        /**
         * Authentication middleware should have already
         * attached the authenticated user's information
         * to req.user.
         */
        if (!req.user || !req.user.role) {
            return res.status(403).json({
                success: false,
                message: "Access forbidden",
            });
        }

        /**
         * Check whether the user's role is included
         * in the roles allowed for this route.
         */
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Access forbidden",
            });
        }

        // The user's role is authorized.
        next();
    };
};

module.exports = roleMiddleware;