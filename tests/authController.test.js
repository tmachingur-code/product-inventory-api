const userService = require("../src/services/userService");
const authController = require("../src/controllers/authController");

jest.mock("../src/services/userService");

describe("Auth Controller", () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            body: {},
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };

        next = jest.fn();
    });

    describe("register", () => {
        test("should register a user and return 201", async () => {
            req.body = {
                name: "John Doe",
                email: "john@example.com",
                password: "SecurePassword123!",
            };

            const createdUser = {
                id: 1,
                name: "John Doe",
                email: "john@example.com",
                role: "STAFF",
            };

            userService.registerUser.mockResolvedValue(
                createdUser
            );

            await authController.register(
                req,
                res,
                next
            );

            expect(
                userService.registerUser
            ).toHaveBeenCalledWith(req.body);

            expect(res.status).toHaveBeenCalledWith(201);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: createdUser,
            });

            expect(next).not.toHaveBeenCalled();
        });

        test("should pass registration errors to next", async () => {
            const error = new Error(
                "A user with this email already exists"
            );

            error.statusCode = 409;

            userService.registerUser.mockRejectedValue(
                error
            );

            await authController.register(
                req,
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(error);

            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });
    });

    describe("login", () => {
        test("should authenticate a user and return 200", async () => {
            req.body = {
                email: "john@example.com",
                password: "SecurePassword123!",
            };

            const loginResult = {
                user: {
                    id: 1,
                    name: "John Doe",
                    email: "john@example.com",
                    role: "STAFF",
                },
                token: "test-jwt-token",
            };

            userService.loginUser.mockResolvedValue(
                loginResult
            );

            await authController.login(
                req,
                res,
                next
            );

            expect(
                userService.loginUser
            ).toHaveBeenCalledWith(req.body);

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: loginResult,
            });

            expect(next).not.toHaveBeenCalled();
        });

        test("should pass login errors to next", async () => {
            const error = new Error(
                "Invalid email or password"
            );

            error.statusCode = 401;

            userService.loginUser.mockRejectedValue(
                error
            );

            await authController.login(
                req,
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(error);

            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });
    });
});