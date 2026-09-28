const userService = require("../services/userService");

/**
 * User Controller
 *
 * The controller handles HTTP requests and responses.
 *
 * It does not contain business logic.
 * Business logic belongs in the user service.
 */
const userController = {
    /**
     * GET /api/users
     *
     * Return all users.
     */
    async getAllUsers(req, res, next) {
        try {
            const users =
                await userService.getAllUsers();

            return res.status(200).json({
                success: true,
                data: users,
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/users/:id
     *
     * Return one user by ID.
     */
    async getUserById(req, res, next) {
        try {
            const { id } = req.params;

            const user =
                await userService.getUserById(id);

            return res.status(200).json({
                success: true,
                data: user,
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * PATCH /api/users/:id/role
     *
     * Update a user's role.
     */
    async updateUserRole(req, res, next) {
        try {
            const { id } = req.params;
            const { role } = req.body;

            const updatedUser =
                await userService.updateUserRole(
                    id,
                    role
                );

            return res.status(200).json({
                success: true,
                data: updatedUser,
            });
        } catch (error) {
            next(error);
        }
    },
};

module.exports = userController;