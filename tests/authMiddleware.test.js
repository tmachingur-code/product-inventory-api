const jwt = require("jsonwebtoken");
const express = require("express");
const request = require("supertest");

const env = require("../src/config/env");
const authMiddleware = require("../src/middleware/authMiddleware");

describe("Authentication Middleware", () => {
    /**
     * Create a small test application.
     *
     * This lets us test the middleware in the same
     * way it will be used in the real API.
     */
    const createTestApp = () => {
        const app = express();

        app.get(
            "/protected",
            authMiddleware,
            (req, res) => {
                res.status(200).json({
                    success: true,
                    user: req.user,
                });
            }
        );

        return app;
    };

    test("should reject a request when authorization header is missing", async () => {
        const app = createTestApp();

        const response = await request(app)
            .get("/protected");

        expect(response.status).toBe(401);

        expect(response.body).toEqual({
            success: false,
            message: "Authentication token is required",
        });
    });

    test("should reject a request when authorization header is malformed", async () => {
        const app = createTestApp();

        const response = await request(app)
            .get("/protected")
            .set("Authorization", "InvalidToken");

        expect(response.status).toBe(401);

        expect(response.body).toEqual({
            success: false,
            message: "Authentication token is required",
        });
    });

    test("should reject an invalid JWT", async () => {
        const app = createTestApp();

        const response = await request(app)
            .get("/protected")
            .set(
                "Authorization",
                "Bearer invalid.jwt.token"
            );

        expect(response.status).toBe(401);

        expect(response.body).toEqual({
            success: false,
            message: "Invalid or expired authentication token",
        });
    });

    test("should reject an expired JWT", async () => {
        const app = createTestApp();

        const token = jwt.sign(
            {
                userId: 1,
                role: "STAFF",
            },
            env.jwtSecret,
            {
                expiresIn: "-1s",
            }
        );

        const response = await request(app)
            .get("/protected")
            .set(
                "Authorization",
                `Bearer ${token}`
            );

        expect(response.status).toBe(401);

        expect(response.body).toEqual({
            success: false,
            message: "Invalid or expired authentication token",
        });
    });

    test("should allow a request with a valid JWT", async () => {
        const app = createTestApp();

        const token = jwt.sign(
            {
                userId: 5,
                role: "STAFF",
            },
            env.jwtSecret,
            {
                expiresIn: "1h",
            }
        );

        const response = await request(app)
            .get("/protected")
            .set(
                "Authorization",
                `Bearer ${token}`
            );

        expect(response.status).toBe(200);

        expect(response.body).toEqual({
            success: true,
            user: {
                userId: 5,
                role: "STAFF",
                iat: expect.any(Number),
                exp: expect.any(Number),
            },
        });
    });
});