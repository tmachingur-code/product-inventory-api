const express = require("express");
const request = require("supertest");
const jwt = require("jsonwebtoken");

const env = require("../src/config/env");

jest.mock("../src/controllers/productController", () => ({
    createProduct: jest.fn(),
    getAllProducts: jest.fn(),
    getPaginatedProducts: jest.fn(),
    getLowStockProducts: jest.fn(),
    getInventoryStats: jest.fn(),

    adjustStock: jest.fn((req, res) => {
        return res.status(200).json({
            success: true,
            data: {
                id: Number(req.params.id),
                quantity: 7,
            },
        });
    }),

    getProductById: jest.fn(),
    getProductBySku: jest.fn(),
    updateProduct: jest.fn(),
    deleteProduct: jest.fn(),
}));

const productRoutes = require("../src/routes/productRoutes");

const app = express();

app.use(express.json());
app.use("/api/products", productRoutes);

describe("Product Stock Route", () => {
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

    test("should adjust stock for an authenticated STAFF user", async () => {
        const response = await request(app)
            .post("/api/products/1/stock")
            .set(
                "Authorization",
                `Bearer ${staffToken}`
            )
            .send({
                quantityDelta: -3,
            });

        expect(response.statusCode).toBe(200);

        expect(response.body.success).toBe(true);

        expect(response.body.data).toEqual({
            id: 1,
            quantity: 7,
        });
    });

    test("should allow an authenticated ADMIN user to adjust stock", async () => {
        const response = await request(app)
            .post("/api/products/1/stock")
            .set(
                "Authorization",
                `Bearer ${adminToken}`
            )
            .send({
                quantityDelta: 5,
            });

        expect(response.statusCode).toBe(200);

        expect(response.body.success).toBe(true);
    });

    test("should reject stock adjustment without authentication", async () => {
        const response = await request(app)
            .post("/api/products/1/stock")
            .send({
                quantityDelta: -3,
            });

        expect(response.statusCode).toBe(401);

        expect(response.body.message).toBe(
            "Authentication token is required"
        );
    });

    test("should reject a zero stock adjustment", async () => {
        const response = await request(app)
            .post("/api/products/1/stock")
            .set(
                "Authorization",
                `Bearer ${staffToken}`
            )
            .send({
                quantityDelta: 0,
            });

        expect(response.statusCode).toBe(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe(
            "Validation failed"
        );
    });

    test("should reject a non-integer stock adjustment", async () => {
        const response = await request(app)
            .post("/api/products/1/stock")
            .set(
                "Authorization",
                `Bearer ${staffToken}`
            )
            .send({
                quantityDelta: 2.5,
            });

        expect(response.statusCode).toBe(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe(
            "Validation failed"
        );
    });

    test("should reject an invalid product ID", async () => {
        const response = await request(app)
            .post("/api/products/abc/stock")
            .set(
                "Authorization",
                `Bearer ${staffToken}`
            )
            .send({
                quantityDelta: 5,
            });

        expect(response.statusCode).toBe(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe(
            "Validation failed"
        );
    });
});