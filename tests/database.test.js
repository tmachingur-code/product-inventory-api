const prisma = require("../src/config/prisma");

describe("Database connection", () => {
    afterAll(async () => {
        // Close the Prisma connection after the test finishes
        await prisma.$disconnect();
    });

    test("should connect to PostgreSQL successfully", async () => {
        await expect(prisma.$connect()).resolves.toBeUndefined();
    });
});