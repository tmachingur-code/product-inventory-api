const request = require("supertest");

const app = require("../src/app");
const productService = require("../src/services/productService");

// Mock the service so this test focuses on
// HTTP routing and response behavior.
jest.mock("../src/services/productService");

describe("GET /api/products/stats", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    test("should return inventory statistics", async () => {
        const stats = {
            totalProducts: 42,
            totalQuantity: 1250,
            lowStockCount: 7,
            inventoryValue: 38450.75,
        };

        productService.getInventoryStats.mockResolvedValue(
            stats
        );

        const response = await request(app).get(
            "/api/products/stats"
        );

        expect(response.statusCode).toBe(200);

        expect(
            productService.getInventoryStats
        ).toHaveBeenCalled();

        expect(response.body).toEqual({
            success: true,
            data: stats,
        });
    });
});