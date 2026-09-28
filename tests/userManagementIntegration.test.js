const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../src/app");
const env = require("../src/config/env");
const userService = require("../src/services/userService");

jest.mock("../src/services/userService");

describe("User Management API Integration", () => {
    const adminToken = jwt.sign(
        {
            userId: 1,
            role: "ADMIN",
        },
        env.jwtSecret,
        {
            expiresIn: "1h",
        }
    );

    const staffToken = jwt.sign(
        {
            userId: 2,
            role: "STAFF",
        },
        env.jwtSecret,
        {
            expiresIn: "1h",
        }
    );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("GET /api/users", () => {
        test("should reject unauthenticated requests", async () => {
            const response = await request(app)
                .get("/api/users");

            expect(response.status).toBe(401);

            expect(response.body).toEqual({
                success: false,
                message:
                    "Authentication token is required",
            });

            expect(
                userService.getAllUsers
            ).not.toHaveBeenCalled();
        });

        test("should reject STAFF users", async () => {
            const response = await request(app)
                .get("/api/users")
                .set(
                    "Authorization",
                    `Bearer ${staffToken}`
                );

            expect(response.status).toBe(403);

            expect(response.body).toEqual({
                success: false,
                message: "Access forbidden",
            });

            expect(
                userService.getAllUsers
            ).not.toHaveBeenCalled();
        });

        test("should allow ADMIN users", async () => {
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

            userService.getAllUsers.mockResolvedValue(
                users
            );

            const response = await request(app)
                .get("/api/users")
                .set(
                    "Authorization",
                    `Bearer ${adminToken}`
                );

            expect(response.status).toBe(200);

            expect(response.body).toEqual({
                success: true,
                data: users,
            });

            expect(
                response.body.data[0]
            ).not.toHaveProperty("passwordHash");

            expect(
                userService.getAllUsers
            ).toHaveBeenCalledTimes(1);
        });
    });

    describe("GET /api/users/:id", () => {
        test("should reject STAFF users", async () => {
            const response = await request(app)
                .get("/api/users/1")
                .set(
                    "Authorization",
                    `Bearer ${staffToken}`
                );

            expect(response.status).toBe(403);

            expect(
                userService.getUserById
            ).not.toHaveBeenCalled();
        });

        test("should reject an invalid user ID", async () => {
            const response = await request(app)
                .get("/api/users/abc")
                .set(
                    "Authorization",
                    `Bearer ${adminToken}`
                );

            expect(response.status).toBe(400);

            expect(response.body.success).toBe(false);

            expect(
                userService.getUserById
            ).not.toHaveBeenCalled();
        });

        test("should allow ADMIN users to get a user", async () => {
            const user = {
                id: 1,
                name: "John Doe",
                email: "john@example.com",
                role: "STAFF",
            };

            userService.getUserById.mockResolvedValue(
                user
            );

            const response = await request(app)
                .get("/api/users/1")
                .set(
                    "Authorization",
                    `Bearer ${adminToken}`
                );

            expect(response.status).toBe(200);

            expect(response.body).toEqual({
                success: true,
                data: user,
            });

            expect(
                userService.getUserById
            ).toHaveBeenCalledWith(1);
        });
    });

    describe("PATCH /api/users/:id/role", () => {
        test("should reject STAFF users", async () => {
            const response = await request(app)
                .patch("/api/users/1/role")
                .set(
                    "Authorization",
                    `Bearer ${staffToken}`
                )
                .send({
                    role: "ADMIN",
                });

            expect(response.status).toBe(403);

            expect(
                userService.updateUserRole
            ).not.toHaveBeenCalled();
        });

        test("should reject an invalid user ID", async () => {
            const response = await request(app)
                .patch("/api/users/abc/role")
                .set(
                    "Authorization",
                    `Bearer ${adminToken}`
                )
                .send({
                    role: "ADMIN",
                });

            expect(response.status).toBe(400);

            expect(response.body.success).toBe(false);

            expect(
                userService.updateUserRole
            ).not.toHaveBeenCalled();
        });

        test("should reject an invalid role", async () => {
            const response = await request(app)
                .patch("/api/users/1/role")
                .set(
                    "Authorization",
                    `Bearer ${adminToken}`
                )
                .send({
                    role: "SUPERUSER",
                });

            expect(response.status).toBe(400);

            expect(response.body.success).toBe(false);

            expect(
                userService.updateUserRole
            ).not.toHaveBeenCalled();
        });

        test("should allow ADMIN users to update a role", async () => {
            const updatedUser = {
                id: 1,
                name: "John Doe",
                email: "john@example.com",
                role: "ADMIN",
            };

            userService.updateUserRole.mockResolvedValue(
                updatedUser
            );

            const response = await request(app)
                .patch("/api/users/1/role")
                .set(
                    "Authorization",
                    `Bearer ${adminToken}`
                )
                .send({
                    role: "ADMIN",
                });

            expect(response.status).toBe(200);

            expect(response.body).toEqual({
                success: true,
                data: updatedUser,
            });

            expect(
                response.body.data
            ).not.toHaveProperty("passwordHash");

            expect(
                userService.updateUserRole
            ).toHaveBeenCalledWith(
                1,
                "ADMIN"
            );
        });
    });
});