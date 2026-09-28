const { z } = require("zod");

/**
 * User registration validation.
 */
const registerUserSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters"),

    email: z
        .string()
        .trim()
        .email("Invalid email address"),

    password: z
        .string()
        .min(
            8,
            "Password must be at least 8 characters"
        ),
});

/**
 * User login validation.
 */
const loginUserSchema = z.object({
    email: z
        .string()
        .trim()
        .email("Invalid email address"),

    password: z
        .string()
        .min(
            8,
            "Password must be at least 8 characters"
        ),
});

/**
 * Validate a user ID in a URL parameter.
 *
 * Example:
 * /api/users/5
 */
const userIdSchema = z.object({
    id: z.coerce
        .number()
        .int("User ID must be an integer")
        .positive("User ID must be greater than 0"),
});

/**
 * Validate a role update request.
 *
 * Only STAFF and ADMIN are valid roles.
 */
const updateUserRoleSchema = z.object({
    role: z.enum(
        ["STAFF", "ADMIN"],
        {
            message:
                "Role must be either STAFF or ADMIN",
        }
    ),
});

module.exports = {
    registerUserSchema,
    loginUserSchema,
    userIdSchema,
    updateUserRoleSchema,
};