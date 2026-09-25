const express = require("express");
const request = require("supertest");
const jwt = require("jsonwebtoken");

const env = require("../src/config/env");
const productRoutes = require("../src/routes/productRoutes");

describe("Product route validation", () => {
    const app = express();

    app.use(express.json());
    app.use("/api/products", productRoutes);

    // Create a valid JWT for protected product routes.
    const token = jwt.sign(
        {
            userId: 1,
            role: "STAFF",
        },
        env.jwtSecret,
        {
            expiresIn: "1h",
        }
    );

    describe("POST /api/products", () => {
        test("should reject a product with an empty name", async () => {
            const response = await request(app)
                .post("/api/products")
                .set(
                    "Authorization",
                    `Bearer ${token}`
                )
                .send({
                    name: "",
                    sku: "TEST-001",
                    price: 100,
                    quantity: 10,
                });

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe(
                "Validation failed"
            );
        });

        test("should reject a product with a negative price", async () => {
            const response = await request(app)
                .post("/api/products")
                .set(
                    "Authorization",
                    `Bearer ${token}`
                )
                .send({
                    name: "Test Product",
                    sku: "TEST-002",
                    price: -100,
                    quantity: 10,
                });

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
        });

        test("should reject a product with a negative quantity", async () => {
            const response = await request(app)
                .post("/api/products")
                .set(
                    "Authorization",
                    `Bearer ${token}`
                )
                .send({
                    name: "Test Product",
                    sku: "TEST-003",
                    price: 100,
                    quantity: -10,
                });

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
        });

        test("should reject a product without a SKU", async () => {
            const response = await request(app)
                .post("/api/products")
                .set(
                    "Authorization",
                    `Bearer ${token}`
                )
                .send({
                    name: "Test Product",
                    price: 100,
                    quantity: 10,
                });

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe("PUT /api/products/:id", () => {
        test("should reject an update with a negative price", async () => {
            const response = await request(app)
                .put("/api/products/1")
                .set(
                    "Authorization",
                    `Bearer ${token}`
                )
                .send({
                    price: -100,
                });

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe(
                "Validation failed"
            );
        });

        test("should reject an empty update", async () => {
            const response = await request(app)
                .put("/api/products/1")
                .set(
                    "Authorization",
                    `Bearer ${token}`
                )
                .send({});

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe(
                "Validation failed"
            );
        });
    });
});