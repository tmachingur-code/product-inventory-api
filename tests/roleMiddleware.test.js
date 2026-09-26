const express = require("express");
const request = require("supertest");
const jwt = require("jsonwebtoken");

const env = require("../src/config/env");

const authMiddleware = require("../src/middleware/authMiddleware");
const roleMiddleware = require("../src/middleware/roleMiddleware");

describe("Role Authorization Middleware", () => {
    /**
     * Create a small test application.
     *
     * Authentication runs before authorization because
     * roleMiddleware expects req.user to already exist.
     */
    const createTestApp = (allowedRoles) => {
        const app = express();

        app.get(
            "/protected",
            authMiddleware,
            roleMiddleware(...allowedRoles),
            (req, res) => {
                res.status(200).json({
                    success: true,
                    message: "Access granted",
                });
            }
        );

        return app;
    };

    /**
     * Create a valid JWT with the supplied role.
     */
    const createToken = (role) => {
        const payload = {
            userId: 1,
        };

        // Only include the role when one was provided.
        if (role !== undefined) {
            payload.role = role;
        }

        return jwt.sign(
            payload,
            env.jwtSecret,
            {
                expiresIn: "1h",
            }
        );
    };

    test("should allow a user with an allowed role", async () => {
        const app = createTestApp(["ADMIN"]);

        const token = createToken("ADMIN");

        const response = await request(app)
            .get("/protected")
            .set(
                "Authorization",
                `Bearer ${token}`
            );

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            success: true,
            message: "Access granted",
        });
    });

    test("should reject a user without the required role", async () => {
        const app = createTestApp(["ADMIN"]);

        const token = createToken("STAFF");

        const response = await request(app)
            .get("/protected")
            .set(
                "Authorization",
                `Bearer ${token}`
            );

        expect(response.statusCode).toBe(403);

        expect(response.body).toEqual({
            success: false,
            message: "Access forbidden",
        });
    });

    test("should allow multiple authorized roles", async () => {
        const app = createTestApp([
            "STAFF",
            "ADMIN",
        ]);

        const token = createToken("STAFF");

        const response = await request(app)
            .get("/protected")
            .set(
                "Authorization",
                `Bearer ${token}`
            );

        expect(response.statusCode).toBe(200);
    });

    test("should reject a token without a role", async () => {
        const app = createTestApp(["ADMIN"]);

        const token = createToken();

        const response = await request(app)
            .get("/protected")
            .set(
                "Authorization",
                `Bearer ${token}`
            );

        expect(response.statusCode).toBe(403);

        expect(response.body).toEqual({
            success: false,
            message: "Access forbidden",
        });
    });

    test("should reject a user with an unexpected role", async () => {
        const app = createTestApp([
            "STAFF",
            "ADMIN",
        ]);

        const token = createToken("MANAGER");

        const response = await request(app)
            .get("/protected")
            .set(
                "Authorization",
                `Bearer ${token}`
            );

        expect(response.statusCode).toBe(403);

        expect(response.body).toEqual({
            success: false,
            message: "Access forbidden",
        });
    });

    test("should reject access when no roles are configured", async () => {
        const app = createTestApp([]);

        const token = createToken("STAFF");

        const response = await request(app)
            .get("/protected")
            .set(
                "Authorization",
                `Bearer ${token}`
            );

        expect(response.statusCode).toBe(403);

        expect(response.body).toEqual({
            success: false,
            message: "Access forbidden",
        });
    });
});