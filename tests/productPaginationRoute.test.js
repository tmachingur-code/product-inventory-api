const request = require("supertest");

const app = require("../src/app");
const prisma = require("../src/config/prisma");

describe("GET /api/products - Pagination", () => {
    const testProducts = [
        {
            name: "Pagination Laptop",
            sku: `PAGE-LAP-${Date.now()}`,
            price: 1200,
            quantity: 10,
            category: "Pagination Test",
            lowStockThreshold: 5,
        },
        {
            name: "Pagination Mouse",
            sku: `PAGE-MOUSE-${Date.now()}`,
            price: 25,
            quantity: 20,
            category: "Pagination Test",
            lowStockThreshold: 5,
        },
        {
            name: "Pagination Keyboard",
            sku: `PAGE-KEY-${Date.now()}`,
            price: 75,
            quantity: 15,
            category: "Pagination Test",
            lowStockThreshold: 5,
        },
    ];

    beforeAll(async () => {
        await prisma.product.createMany({
            data: testProducts,
        });
    });

    afterAll(async () => {
        await prisma.product.deleteMany({
            where: {
                category: "Pagination Test",
            },
        });
    });

    test("should return products with pagination metadata", async () => {
        const response = await request(app)
            .get("/api/products")
            .query({
                category: "Pagination Test",
                page: 1,
                limit: 2,
            });

        expect(response.statusCode).toBe(200);

        expect(response.body.success).toBe(true);

        expect(response.body.data).toHaveLength(2);

        expect(response.body.pagination).toEqual({
            page: 1,
            limit: 2,
            total: 3,
            totalPages: 2,
        });
    });

    test("should return the correct second page", async () => {
        const response = await request(app)
            .get("/api/products")
            .query({
                category: "Pagination Test",
                page: 2,
                limit: 2,
            });

        expect(response.statusCode).toBe(200);

        expect(response.body.success).toBe(true);

        expect(response.body.data).toHaveLength(1);

        expect(response.body.pagination).toEqual({
            page: 2,
            limit: 2,
            total: 3,
            totalPages: 2,
        });
    });

    test("should return default pagination when page and limit are omitted", async () => {
        const response = await request(app)
            .get("/api/products")
            .query({
                category: "Pagination Test",
            });

        expect(response.statusCode).toBe(200);

        expect(response.body.success).toBe(true);

        expect(response.body.pagination).toEqual({
            page: 1,
            limit: 10,
            total: 3,
            totalPages: 1,
        });
    });
});