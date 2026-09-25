const express = require("express");
const request = require("supertest");
const jwt = require("jsonwebtoken");

const env = require("../src/config/env");
const authMiddleware = require("../src/middleware/authMiddleware");

describe("Product Authentication", () => {
    const app = express();

    app.use(express.json());

    /**
     * Temporary protected route for testing.
     *
     * This represents a product endpoint that requires
     * an authenticated user.
     */
    app.post(
        "/api/products",
        authMiddleware,
        (req, res) => {
            res.status(201).json({
                success: true,
                message: "Product creation authorized",
                user: req.user,
            });
        }
    );

    test("should reject product creation without authentication", async () => {
        const response = await request(app)
            .post("/api/products")
            .send({
                name: "Test Product",
                sku: "TEST-001",
                price: 100,
                quantity: 10,
            });

        expect(response.status).toBe(401);

        expect(response.body).toEqual({
            success: false,
            message: "Authentication token is required",
        });
    });

    test("should allow product creation with a valid JWT", async () => {
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
            .post("/api/products")
            .set(
                "Authorization",
                `Bearer ${token}`
            )
            .send({
                name: "Test Product",
                sku: "TEST-001",
                price: 100,
                quantity: 10,
            });

        expect(response.status).toBe(201);

        expect(response.body).toEqual({
            success: true,
            message: "Product creation authorized",
            user: {
                userId: 5,
                role: "STAFF",
                iat: expect.any(Number),
                exp: expect.any(Number),
            },
        });
    });
});