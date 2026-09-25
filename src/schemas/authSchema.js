const { z } = require("zod");

/**
 * Schema for user registration.
 *
 * Validates the data required to create a new account.
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
 * Schema for user login.
 *
 * Only email and password are required.
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

module.exports = {
    registerUserSchema,
    loginUserSchema,
};