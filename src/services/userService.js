const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const env = require("../config/env");
const userRepository = require("../repositories/userRepository");

/**
 * User Service
 *
 * The service layer contains authentication business logic.
 *
 * Responsibilities:
 * - Check whether an email already exists
 * - Hash passwords
 * - Verify passwords
 * - Generate JWT tokens
 * - Prepare safe user data
 * - Communicate with the user repository
 */
const userService = {
    /**
     * Register a new user.
     */
    async registerUser(userData) {
        const existingUser = await userRepository.findByEmail(
            userData.email
        );

        // Prevent duplicate accounts.
        if (existingUser) {
            const error = new Error(
                "A user with this email already exists"
            );

            error.statusCode = 409;

            throw error;
        }

        // Hash the plain-text password before storing it.
        const passwordHash = await bcrypt.hash(
            userData.password,
            12
        );

        // Never send the plain-text password to the repository.
        const newUserData = {
            name: userData.name,
            email: userData.email,
            passwordHash,
        };

        const createdUser = await userRepository.create(
            newUserData
        );

        /**
         * Return only safe user information.
         *
         * The password hash must never be exposed
         * through the API response.
         */
        return {
            id: createdUser.id,
            name: createdUser.name,
            email: createdUser.email,
            role: createdUser.role,
        };
    },

    /**
     * Authenticate a user with email and password.
     */
    async loginUser(credentials) {
        const user = await userRepository.findByEmail(
            credentials.email
        );

        /**
         * Use the same authentication error when the
         * email does not exist or the password is wrong.
         *
         * This avoids revealing whether an email address
         * is registered in the system.
         */
        if (!user) {
            const error = new Error(
                "Invalid email or password"
            );

            error.statusCode = 401;

            throw error;
        }

        // Compare the supplied password with the stored hash.
        const passwordMatches = await bcrypt.compare(
            credentials.password,
            user.passwordHash
        );

        if (!passwordMatches) {
            const error = new Error(
                "Invalid email or password"
            );

            error.statusCode = 401;

            throw error;
        }

        /**
         * Create a JWT containing only the information
         * needed to identify and authorize the user.
         *
         * Never put the password or password hash in the token.
         */
        const token = jwt.sign(
            {
                userId: user.id,
                role: user.role,
            },
            env.jwtSecret,
            {
                expiresIn: "1h",
            }
        );

        /**
         * Return the token together with safe user data.
         *
         * The password hash is intentionally excluded.
         */
        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            token,
        };
    },
};

module.exports = userService;