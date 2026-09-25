const productService = require("../src/services/productService");
const productRepository = require("../src/repositories/productRepository");

// Mock the repository so this test focuses only
// on service-layer behavior.
jest.mock("../src/repositories/productRepository");

describe("Product Service - Inventory Statistics", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    test("should return inventory statistics from the repository", async () => {
        const stats = {
            totalProducts: 42,
            totalQuantity: 1250,
            lowStockCount: 7,
            inventoryValue: 38450.75,
        };

        productRepository.getInventoryStats.mockResolvedValue(
            stats
        );

        const result = await productService.getInventoryStats();

        expect(
            productRepository.getInventoryStats
        ).toHaveBeenCalled();

        expect(result).toEqual(stats);
    });
});