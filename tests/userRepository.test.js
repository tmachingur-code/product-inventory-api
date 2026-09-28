const prisma = require("../src/config/prisma");
const userRepository = require("../src/repositories/userRepository");

describe("User Repository", () => {
    const testUser = {
        name: "Test User",
        email: `test-${Date.now()}@example.com`,
        passwordHash: "hashed-password",
    };

    let createdUser;

    beforeAll(async () => {
        createdUser = await userRepository.create(testUser);
    });

    afterAll(async () => {
        await prisma.user.deleteMany({
            where: {
                email: testUser.email,
            },
        });
    });

    test("should create a user", async () => {
        expect(createdUser).toEqual(
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

    test("should find a user by ID", async () => {
        const user = await userRepository.findById(
            createdUser.id
        );

        expect(user).not.toBeNull();
        expect(user.id).toBe(createdUser.id);
        expect(user.email).toBe(testUser.email);
    });

    test("should return null when user ID does not exist", async () => {
        const user = await userRepository.findById(
            999999999
        );

        expect(user).toBeNull();
    });

    test("should return all users ordered by creation date", async () => {
        const users = await userRepository.findAll();

        expect(Array.isArray(users)).toBe(true);

        const testUserFromList = users.find(
            (user) => user.id === createdUser.id
        );

        expect(testUserFromList).toEqual(
            expect.objectContaining({
                id: createdUser.id,
                email: testUser.email,
            })
        );
    });

    test("should update a user's role", async () => {
        const updatedUser = await userRepository.updateRole(
            createdUser.id,
            "ADMIN"
        );

        expect(updatedUser).toEqual(
            expect.objectContaining({
                id: createdUser.id,
                email: testUser.email,
                role: "ADMIN",
            })
        );
    });

    test("should allow the user's role to be changed back to STAFF", async () => {
        const updatedUser = await userRepository.updateRole(
            createdUser.id,
            "STAFF"
        );

        expect(updatedUser.role).toBe("STAFF");
    });
});