const prisma = require("../src/config/prisma");
const userRepository = require("../src/repositories/userRepository");

describe("User Repository", () => {
    const testUser = {
        name: "Test User",
        email: `test-${Date.now()}@example.com`,
        passwordHash: "hashed-password",
    };

    beforeAll(async () => {
        await userRepository.create(testUser);
    });

    afterAll(async () => {
        await prisma.user.deleteMany({
            where: {
                email: testUser.email,
            },
        });
    });

    test("should create a user", async () => {
        const user = await userRepository.findByEmail(
            testUser.email
        );

        expect(user).toEqual(
            expect.objectContaining({
                name: testUser.name,
                email: testUser.email,
                passwordHash: testUser.passwordHash,
                role: "STAFF",
            })
        );
    });

    test("should find a user by email", async () => {
        const user = await userRepository.findByEmail(
            testUser.email
        );

        expect(user).not.toBeNull();
        expect(user.email).toBe(testUser.email);
    });

    test("should return null when user email does not exist", async () => {
        const user = await userRepository.findByEmail(
            "does-not-exist@example.com"
        );

        expect(user).toBeNull();
    });
});