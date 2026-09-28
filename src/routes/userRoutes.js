const express = require("express");

const userController = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");

const {
    userIdSchema,
    updateUserRoleSchema,
} = require("../schemas/authSchema");

const router = express.Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     description: Returns all registered users without password hashes.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         description: Authentication token is missing or invalid
 *       403:
 *         description: User does not have ADMIN privileges
 */
router.get(
    "/",
    authMiddleware,
    roleMiddleware("ADMIN"),
    userController.getAllUsers
);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     description: Returns one user without exposing the password hash.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid user ID
 *       401:
 *         description: Authentication token is missing or invalid
 *       403:
 *         description: User does not have ADMIN privileges
 *       404:
 *         description: User not found
 */
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN"),
    validate(userIdSchema, "params"),
    userController.getUserById
);

/**
 * @swagger
 * /api/users/{id}/role:
 *   patch:
 *     summary: Update a user's role
 *     description: Changes a user's role between STAFF and ADMIN.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRole'
 *     responses:
 *       200:
 *         description: User role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid user ID or role
 *       401:
 *         description: Authentication token is missing or invalid
 *       403:
 *         description: User does not have ADMIN privileges
 *       404:
 *         description: User not found     
 */
router.patch(
    "/:id/role",
    authMiddleware,
    roleMiddleware("ADMIN"),
    validate(userIdSchema, "params"),
    validate(updateUserRoleSchema),
    userController.updateUserRole
);

module.exports = router;