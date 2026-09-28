const userService = require("../src/services/userService");
const userController = require("../src/controllers/userController");

jest.mock("../src/services/userService");

describe("User Controller", () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            params: {},
            body: {},
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        next = jest.fn();
    });

    describe("getAllUsers", () => {
        test("should return all users with status 200", async () => {
            const users = [
                {
                    id: 1,
                    name: "John Doe",
                    email: "john@example.com",
                    role: "STAFF",
                },
                {
                    id: 2,
                    name: "Jane Doe",
                    email: "jane@example.com",
                    role: "ADMIN",
                },
            ];

            userService.getAllUsers.mockResolvedValue(users);

            await userController.getAllUsers(
                req,
                res,
                next
            );

            expect(
                userService.getAllUsers
            ).toHaveBeenCalledTimes(1);

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: users,
            });

            expect(next).not.toHaveBeenCalled();
        });

        test("should pass service errors to next", async () => {
            const error = new Error(
                "Database error"
            );

            userService.getAllUsers.mockRejectedValue(
                error
            );

            await userController.getAllUsers(
                req,
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("getUserById", () => {
        test("should return a user with status 200", async () => {
            req.params.id = "1";

            const user = {
                id: 1,
                name: "John Doe",
                email: "john@example.com",
                role: "STAFF",
            };

            userService.getUserById.mockResolvedValue(
                user
            );

            await userController.getUserById(
                req,
                res,
                next
            );

            expect(
                userService.getUserById
            ).toHaveBeenCalledWith("1");

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: user,
            });
        });

        test("should pass service errors to next", async () => {
            req.params.id = "999";

            const error = new Error(
                "User not found"
            );

            error.statusCode = 404;

            userService.getUserById.mockRejectedValue(
                error
            );

            await userController.getUserById(
                req,
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("updateUserRole", () => {
        test("should update a user's role and return status 200", async () => {
            req.params.id = "1";
            req.body = {
                role: "ADMIN",
            };

            const updatedUser = {
                id: 1,
                name: "John Doe",
                email: "john@example.com",
                role: "ADMIN",
            };

            userService.updateUserRole.mockResolvedValue(
                updatedUser
            );

            await userController.updateUserRole(
                req,
                res,
                next
            );

            expect(
                userService.updateUserRole
            ).toHaveBeenCalledWith(
                "1",
                "ADMIN"
            );

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: updatedUser,
            });
        });

        test("should pass service errors to next", async () => {
            req.params.id = "999";
            req.body = {
                role: "ADMIN",
            };

            const error = new Error(
                "User not found"
            );

            error.statusCode = 404;

            userService.updateUserRole.mockRejectedValue(
                error
            );

            await userController.updateUserRole(
                req,
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(error);
        });
    });
});