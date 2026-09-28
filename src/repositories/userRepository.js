const prisma = require("../config/prisma");

/**
 * User Repository
 *
 * The repository is responsible only for
 * communicating with the database through Prisma.
 *
 * Business logic belongs in the service layer.
 */
const userRepository = {
    /**
     * Create a new user.
     */
    async create(userData) {
        return prisma.user.create({
            data: userData,
        });
    },

    /**
     * Find a user by email.
     *
     * Used during registration and login.
     */
    async findByEmail(email) {
        return prisma.user.findUnique({
            where: {
                email,
            },
        });
    },

    /**
     * Find a user by ID.
     */
    async findById(id) {
        return prisma.user.findUnique({
            where: {
                id,
            },
        });
    },

    /**
     * Return all users.
     *
     * The service layer will remove passwordHash
     * before sending users to the API client.
     */
    async findAll() {
        return prisma.user.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });
    },

    /**
     * Update a user's role.
     *
     * The service layer is responsible for checking
     * whether the user exists and whether the requested
     * role is allowed.
     */
    async updateRole(id, role) {
        return prisma.user.update({
            where: {
                id,
            },
            data: {
                role,
            },
        });
    },
};

module.exports = userRepository;