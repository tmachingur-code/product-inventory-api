const prisma = require("../src/config/prisma");

/**
 * Close the Prisma database connection after
 * each Jest test file has finished running.
 *
 * This prevents Jest from keeping PostgreSQL
 * connections open after the tests complete.
 */
afterAll(async () => {
    await prisma.$disconnect();
});