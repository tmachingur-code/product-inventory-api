const express = require("express");
const request = require("supertest");
const jwt = require("jsonwebtoken");

const env = require("../src/config/env");

const app = require("../src/app");
const productService = require("../src/services/productService");

// Mock the service so these tests focus on
// routing and HTTP integration rather than the database.
jest.mock("../src/services/productService");

describe("Product Routes", () => {
    // Create a JWT for a STAFF user.
    const staffToken = jwt.sign(
        {
            userId: 1,
            role: "STAFF",
        },
        env.jwtSecret,
        {
            expiresIn: "1h",
        }
    );

    // Create a JWT for an ADMIN user.
    const adminToken = jwt.sign(
        {
            userId: 2,
            role: "ADMIN",
        },
        env.jwtSecret,
        {
            expiresIn: "1h",
        }
    );

    beforeEach(() => {
        // Reset all mocked service functions before every test.
        jest.resetAllMocks();
    });

    test("POST /api/products should create a product", async () => {
        const product = {
            id: 1,
            name: "Test Laptop",
            description: "Laptop for route testing",
            sku: "LAP-001",
            price: 999.99,
            quantity: 10,
            category: "Electronics",
            lowStockThreshold: 5,
        };

        productService.createProduct.mockResolvedValue(product);

        const response = await request(app)
            .post("/api/products")
            .set(
                "Authorization",
                `Bearer ${staffToken}`
            )
            .send({
                name: "Test Laptop",
                description: "Laptop for route testing",
                sku: "LAP-001",
                price: 999.99,
                quantity: 10,
                category: "Electronics",
                lowStockThreshold: 5,
            });

        expect(response.statusCode).toBe(201);

        expect(response.body).toEqual({
            success: true,
            data: product,
        });
    });

    test("GET /api/products should return paginated products", async () => {
        const products = [
            {
                id: 1,
                name: "Test Laptop",
                sku: "LAP-001",
                price: 999.99,
                quantity: 10,
            },
            {
                id: 2,
                name: "Test Mouse",
                sku: "MOU-001",
                price: 29.99,
                quantity: 20,
            },
        ];

        const pagination = {
            page: 1,
            limit: 10,
            total: 2,
            totalPages: 1,
        };

        productService.getPaginatedProducts.mockResolvedValue({
            products,
            pagination,
        });

        const response = await request(app).get(
            "/api/products"
        );

        expect(response.statusCode).toBe(200);

        expect(
            productService.getPaginatedProducts
        ).toHaveBeenCalledWith({});

        expect(response.body).toEqual({
            success: true,
            data: products,
            pagination,
        });
    });

    test("GET /api/products/:id should return a product", async () => {
        const product = {
            id: 1,
            name: "Test Laptop",
            sku: "LAP-001",
            price: 999.99,
            quantity: 10,
        };

        productService.getProductById.mockResolvedValue(product);

        const response = await request(app).get(
            "/api/products/1"
        );

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            success: true,
            data: product,
        });
    });

    test("GET /api/products/sku/:sku should return a product", async () => {
        const product = {
            id: 1,
            name: "Test Laptop",
            sku: "LAP-001",
            price: 999.99,
            quantity: 10,
        };

        productService.getProductBySku.mockResolvedValue(product);

        const response = await request(app).get(
            "/api/products/sku/LAP-001"
        );

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            success: true,
            data: product,
        });
    });

    test("PUT /api/products/:id should update a product", async () => {
        const product = {
            id: 1,
            name: "Updated Laptop",
            sku: "LAP-001",
            price: 1099.99,
            quantity: 15,
        };

        productService.updateProduct.mockResolvedValue(product);

        const updateData = {
            name: "Updated Laptop",
            price: 1099.99,
            quantity: 15,
        };

        const response = await request(app)
            .put("/api/products/1")
            .set(
                "Authorization",
                `Bearer ${staffToken}`
            )
            .send(updateData);

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            success: true,
            data: product,
        });
    });

    test("DELETE /api/products/:id should delete a product for an ADMIN user", async () => {
        const product = {
            id: 1,
            name: "Test Laptop",
            sku: "LAP-001",
            price: 999.99,
            quantity: 10,
        };

        productService.deleteProduct.mockResolvedValue(product);

        const response = await request(app)
            .delete("/api/products/1")
            .set(
                "Authorization",
                `Bearer ${adminToken}`
            );

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            success: true,
            data: product,
        });
    });

    test("DELETE /api/products/:id should reject a STAFF user", async () => {
        const response = await request(app)
            .delete("/api/products/1")
            .set(
                "Authorization",
                `Bearer ${staffToken}`
            );

        expect(response.statusCode).toBe(403);

        expect(response.body).toEqual({
            success: false,
            message: "Access forbidden",
        });

        expect(
            productService.deleteProduct
        ).not.toHaveBeenCalled();
    });
});