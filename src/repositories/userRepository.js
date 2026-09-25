const prisma = require("../config/prisma");

/**
 * User Repository
 *
 * The repository is responsible only for communicating
 * with the database through Prisma.
 */
const userRepository = {
    /**
     * Create a new user.
     *
     * The password should already be hashed before
     * it reaches the repository.
     */
    async create(userData) {
        return prisma.user.create({
            data: userData,
        });
    },

    /**
     * Find a user by email.
     *
     * Email is unique in the database, so Prisma's
     * findUnique method is appropriate here.
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
};

module.exports = userRepository;