const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

jest.mock("../src/repositories/userRepository");

const userRepository = require("../src/repositories/userRepository");
const userService = require("../src/services/userService");

describe("User Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("registerUser", () => {
        test("should hash the password before creating a user", async () => {
            const userData = {
                name: "John Doe",
                email: "john@example.com",
                password: "SecurePassword123!",
            };

            userRepository.findByEmail.mockResolvedValue(null);

            userRepository.create.mockImplementation(
                async (data) => ({
                    id: 1,
                    name: data.name,
                    email: data.email,
                    passwordHash: data.passwordHash,
                    role: "STAFF",
                })
            );

            const user =
                await userService.registerUser(userData);

            expect(userRepository.create).toHaveBeenCalledTimes(1);

            const createArgument =
                userRepository.create.mock.calls[0][0];

            expect(createArgument).not.toHaveProperty(
                "password"
            );

            expect(createArgument.passwordHash).toBeDefined();

            expect(createArgument.passwordHash).not.toBe(
                userData.password
            );

            const passwordMatches = await bcrypt.compare(
                userData.password,
                createArgument.passwordHash
            );

            expect(passwordMatches).toBe(true);
        });

        test("should reject registration when email already exists", async () => {
            const existingUser = {
                id: 1,
                name: "Existing User",
                email: "existing@example.com",
                passwordHash: "existing-hash",
                role: "STAFF",
            };

            userRepository.findByEmail.mockResolvedValue(
                existingUser
            );

            await expect(
                userService.registerUser({
                    name: "New User",
                    email: "existing@example.com",
                    password: "SecurePassword123!",
                })
            ).rejects.toMatchObject({
                statusCode: 409,
            });

            expect(
                userRepository.create
            ).not.toHaveBeenCalled();
        });
    });

    describe("loginUser", () => {
        test("should reject login when email does not exist", async () => {
            userRepository.findByEmail.mockResolvedValue(null);

            await expect(
                userService.loginUser({
                    email: "missing@example.com",
                    password: "SecurePassword123!",
                })
            ).rejects.toMatchObject({
                statusCode: 401,
            });

            expect(
                userRepository.findByEmail
            ).toHaveBeenCalledWith(
                "missing@example.com"
            );
        });

        test("should reject login when password is incorrect", async () => {
            const passwordHash = await bcrypt.hash(
                "CorrectPassword123!",
                12
            );

            userRepository.findByEmail.mockResolvedValue({
                id: 1,
                name: "John Doe",
                email: "john@example.com",
                passwordHash,
                role: "STAFF",
            });

            await expect(
                userService.loginUser({
                    email: "john@example.com",
                    password: "WrongPassword123!",
                })
            ).rejects.toMatchObject({
                statusCode: 401,
            });
        });

        test("should return a JWT when email and password are correct", async () => {
            const password = "CorrectPassword123!";

            const passwordHash = await bcrypt.hash(
                password,
                12
            );

            userRepository.findByEmail.mockResolvedValue({
                id: 1,
                name: "John Doe",
                email: "john@example.com",
                passwordHash,
                role: "STAFF",
            });

            const result =
                await userService.loginUser({
                    email: "john@example.com",
                    password,
                });

            // The login response should contain a JWT.
            expect(result).toHaveProperty("token");
            expect(typeof result.token).toBe("string");
            expect(result.token.length).toBeGreaterThan(0);

            // Verify that the JWT contains the expected claims.
            const decoded = jwt.verify(
                result.token,
                process.env.JWT_SECRET
            );

            expect(decoded).toEqual(
                expect.objectContaining({
                    userId: 1,
                    role: "STAFF",
                })
            );

            // The user information should be returned
            // without exposing the password hash.
            expect(result.user).toEqual({
                id: 1,
                name: "John Doe",
                email: "john@example.com",
                role: "STAFF",
            });
        });
    });
});