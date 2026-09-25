const userService = require("../services/userService");

/**
 * Auth Controller
 *
 * The controller handles HTTP request and response logic.
 *
 * Business logic stays inside the user service.
 */
const authController = {
    /**
     * Register a new user.
     */
    async register(req, res, next) {
        try {
            const user = await userService.registerUser(
                req.body
            );

            return res.status(201).json({
                success: true,
                data: user,
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Authenticate an existing user.
     */
    async login(req, res, next) {
        try {
            const result = await userService.loginUser(
                req.body
            );

            return res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    },
};

module.exports = authController;