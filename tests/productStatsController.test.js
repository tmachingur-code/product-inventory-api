const productController = require("../src/controllers/productController");
const productService = require("../src/services/productService");

// Mock the service so this test focuses only
// on controller behavior.
jest.mock("../src/services/productService");

describe("Product Controller - Inventory Statistics", () => {
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

        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const next = jest.fn();

        await productController.getInventoryStats(
            req,
            res,
            next
        );

        expect(
            productService.getInventoryStats
        ).toHaveBeenCalled();

        expect(res.status).toHaveBeenCalledWith(200);

        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: stats,
        });

        expect(next).not.toHaveBeenCalled();
    });
});