const request = require("supertest");

const app = require("../src/app");
const productService = require("../src/services/productService");

// Mock the service so this test focuses on
// HTTP routing and response behavior.
jest.mock("../src/services/productService");

describe("GET /api/products/low-stock", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    test("should return low-stock products", async () => {
        const products = [
            {
                id: 1,
                name: "Low Stock Laptop",
                sku: "LOW-LAP-001",
                quantity: 3,
                lowStockThreshold: 5,
            },
            {
                id: 2,
                name: "Exact Threshold Keyboard",
                sku: "EXACT-KEY-001",
                quantity: 5,
                lowStockThreshold: 5,
            },
        ];

        productService.getLowStockProducts.mockResolvedValue(
            products
        );

        const response = await request(app).get(
            "/api/products/low-stock"
        );

        expect(response.statusCode).toBe(200);

        expect(
            productService.getLowStockProducts
        ).toHaveBeenCalled();

        expect(response.body).toEqual({
            success: true,
            data: products,
        });
    });
});