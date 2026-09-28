const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const env = require("../config/env");
const userRepository = require("../repositories/userRepository");

/**
 * Remove sensitive information before returning
 * a user to the controller.
 *
 * Password hashes must never be exposed through
 * the API response.
 */
const sanitizeUser = (user) => {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };
};

const userService = {
    /**
     * Register a new user.
     */
    async registerUser(userData) {
        const existingUser =
            await userRepository.findByEmail(
                userData.email
            );

        if (existingUser) {
            const error = new Error(
                "A user with this email already exists"
            );

            error.statusCode = 409;

            throw error;
        }

        const passwordHash = await bcrypt.hash(
            userData.password,
            12
        );

        const newUserData = {
            name: userData.name,
            email: userData.email,
            passwordHash,
        };

        const createdUser =
            await userRepository.create(
                newUserData
            );

        return sanitizeUser(createdUser);
    },

    /**
     * Authenticate a user and return a JWT.
     */
    async loginUser(credentials) {
        const user =
            await userRepository.findByEmail(
                credentials.email
            );

        if (!user) {
            const error = new Error(
                "Invalid email or password"
            );

            error.statusCode = 401;

            throw error;
        }

        const passwordMatches =
            await bcrypt.compare(
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

        return {
            user: sanitizeUser(user),
            token,
        };
    },

    /**
     * Return all users without password hashes.
     */
    async getAllUsers() {
        const users =
            await userRepository.findAll();

        return users.map(sanitizeUser);
    },

    /**
     * Return one user by ID without password hash.
     */
    async getUserById(id) {
        const userId = Number(id);

        const user =
            await userRepository.findById(userId);

        if (!user) {
            const error = new Error(
                "User not found"
            );

            error.statusCode = 404;

            throw error;
        }

        return sanitizeUser(user);
    },

    /**
     * Update a user's role.
     *
     * Only ADMIN and STAFF are valid roles.
     */
    async updateUserRole(id, role) {
        const userId = Number(id);

        const user =
            await userRepository.findById(userId);

        if (!user) {
            const error = new Error(
                "User not found"
            );

            error.statusCode = 404;

            throw error;
        }

        const updatedUser =
            await userRepository.updateRole(
                userId,
                role
            );

        return sanitizeUser(updatedUser);
    },
};

module.exports = userService;