const express = require("express");
const request = require("supertest");

const authRoutes = require("../src/routes/authRoutes");

const userService = require("../src/services/userService");

jest.mock("../src/services/userService");

const app = express();

app.use(express.json());
app.use("/api/auth", authRoutes);

// Simple test error handler
app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message,
    });
});

describe("Auth Routes", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("POST /api/auth/register", () => {
        test("should register a valid user", async () => {
            userService.registerUser.mockResolvedValue({
                id: 1,
                name: "John Doe",
                email: "john@example.com",
                role: "STAFF",
            });

            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "John Doe",
                    email: "john@example.com",
                    password: "SecurePassword123!",
                });

            expect(response.status).toBe(201);

            expect(response.body).toEqual({
                success: true,
                data: {
                    id: 1,
                    name: "John Doe",
                    email: "john@example.com",
                    role: "STAFF",
                },
            });

            expect(
                userService.registerUser
            ).toHaveBeenCalledWith({
                name: "John Doe",
                email: "john@example.com",
                password: "SecurePassword123!",
            });
        });

        test("should reject invalid registration data", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "",
                    email: "invalid-email",
                    password: "123",
                });

            expect(response.status).toBe(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe(
                "Validation failed"
            );

            expect(
                userService.registerUser
            ).not.toHaveBeenCalled();
        });
    });

    describe("POST /api/auth/login", () => {
        test("should login with valid credentials", async () => {
            userService.loginUser.mockResolvedValue({
                user: {
                    id: 1,
                    name: "John Doe",
                    email: "john@example.com",
                    role: "STAFF",
                },
                token: "test-jwt-token",
            });

            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "john@example.com",
                    password: "SecurePassword123!",
                });

            expect(response.status).toBe(200);

            expect(response.body).toEqual({
                success: true,
                data: {
                    user: {
                        id: 1,
                        name: "John Doe",
                        email: "john@example.com",
                        role: "STAFF",
                    },
                    token: "test-jwt-token",
                },
            });

            expect(
                userService.loginUser
            ).toHaveBeenCalledWith({
                email: "john@example.com",
                password: "SecurePassword123!",
            });
        });

        test("should reject invalid login data", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "invalid-email",
                    password: "123",
                });

            expect(response.status).toBe(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe(
                "Validation failed"
            );

            expect(
                userService.loginUser
            ).not.toHaveBeenCalled();
        });
    });
});