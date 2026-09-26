const express = require("express");
const request = require("supertest");
const jwt = require("jsonwebtoken");

const env = require("../src/config/env");
const productRoutes = require("../src/routes/productRoutes");
const productService = require("../src/services/productService");

jest.mock("../src/services/productService");

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

    beforeEach(() => {
        jest.resetAllMocks();
    });

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

            expect(response.body).toEqual(
                expect.objectContaining({
                    success: false,
                    message: "Validation failed",
                })
            );

            expect(
                productService.createProduct
            ).not.toHaveBeenCalled();
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

            expect(
                productService.createProduct
            ).not.toHaveBeenCalled();
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

            expect(
                productService.createProduct
            ).not.toHaveBeenCalled();
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

            expect(
                productService.createProduct
            ).not.toHaveBeenCalled();
        });

        test("should reject a product with invalid data types", async () => {
            const response = await request(app)
                .post("/api/products")
                .set(
                    "Authorization",
                    `Bearer ${token}`
                )
                .send({
                    name: "Test Product",
                    sku: "TEST-004",
                    price: "not-a-number",
                    quantity: "ten",
                });

            expect(response.statusCode).toBe(400);

            expect(response.body).toEqual(
                expect.objectContaining({
                    success: false,
                    message: "Validation failed",
                })
            );

            expect(
                productService.createProduct
            ).not.toHaveBeenCalled();
        });

        test("should reject a product with a negative low-stock threshold", async () => {
            const response = await request(app)
                .post("/api/products")
                .set(
                    "Authorization",
                    `Bearer ${token}`
                )
                .send({
                    name: "Test Product",
                    sku: "TEST-005",
                    price: 100,
                    quantity: 10,
                    lowStockThreshold: -5,
                });

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);

            expect(
                productService.createProduct
            ).not.toHaveBeenCalled();
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

            expect(response.body).toEqual(
                expect.objectContaining({
                    success: false,
                    message: "Validation failed",
                })
            );

            expect(
                productService.updateProduct
            ).not.toHaveBeenCalled();
        });

        test("should reject an update with a negative quantity", async () => {
            const response = await request(app)
                .put("/api/products/1")
                .set(
                    "Authorization",
                    `Bearer ${token}`
                )
                .send({
                    quantity: -10,
                });

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);

            expect(
                productService.updateProduct
            ).not.toHaveBeenCalled();
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

            expect(response.body).toEqual(
                expect.objectContaining({
                    success: false,
                    message: "Validation failed",
                })
            );

            expect(
                productService.updateProduct
            ).not.toHaveBeenCalled();
        });

        test("should reject an update with an invalid product ID", async () => {
            const response = await request(app)
                .put("/api/products/not-a-number")
                .set(
                    "Authorization",
                    `Bearer ${token}`
                )
                .send({
                    price: 100,
                });

            expect(response.statusCode).toBe(400);

            expect(response.body).toEqual(
                expect.objectContaining({
                    success: false,
                    message: "Validation failed",
                })
            );

            expect(
                productService.updateProduct
            ).not.toHaveBeenCalled();
        });
    });

    describe("GET /api/products/:id", () => {
        test("should reject an invalid product ID", async () => {
            const response = await request(app)
                .get(
                    "/api/products/not-a-number"
                );

            expect(response.statusCode).toBe(400);

            expect(response.body).toEqual(
                expect.objectContaining({
                    success: false,
                    message: "Validation failed",
                })
            );

            expect(
                productService.getProductById
            ).not.toHaveBeenCalled();
        });
    });

    describe("GET /api/products", () => {
        test("should reject an invalid page value", async () => {
            const response = await request(app)
                .get(
                    "/api/products?page=invalid"
                );

            expect(response.statusCode).toBe(400);

            expect(response.body).toEqual(
                expect.objectContaining({
                    success: false,
                    message: "Validation failed",
                })
            );

            expect(
                productService.getPaginatedProducts
            ).not.toHaveBeenCalled();
        });

        test("should reject a page value below 1", async () => {
            const response = await request(app)
                .get(
                    "/api/products?page=0"
                );

            expect(response.statusCode).toBe(400);

            expect(response.body.success).toBe(false);

            expect(
                productService.getPaginatedProducts
            ).not.toHaveBeenCalled();
        });

        test("should reject a limit greater than 100", async () => {
            const response = await request(app)
                .get(
                    "/api/products?limit=101"
                );

            expect(response.statusCode).toBe(400);

            expect(response.body.success).toBe(false);

            expect(
                productService.getPaginatedProducts
            ).not.toHaveBeenCalled();
        });

        test("should reject an invalid sort order", async () => {
            const response = await request(app)
                .get(
                    "/api/products?order=random"
                );

            expect(response.statusCode).toBe(400);

            expect(response.body).toEqual(
                expect.objectContaining({
                    success: false,
                    message: "Validation failed",
                })
            );

            expect(
                productService.getPaginatedProducts
            ).not.toHaveBeenCalled();
        });

        test("should reject an invalid sort field", async () => {
            const response = await request(app)
                .get(
                    "/api/products?sortBy=invalid"
                );

            expect(response.statusCode).toBe(400);

            expect(response.body.success).toBe(false);

            expect(
                productService.getPaginatedProducts
            ).not.toHaveBeenCalled();
        });
    });
});