const productService = require("../src/services/productService");
const productRepository = require("../src/repositories/productRepository");

// Mock the repository so this test focuses only
// on service-layer behavior.
jest.mock("../src/repositories/productRepository");

describe("Product Service - Low Stock", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    test("should return low-stock products from the repository", async () => {
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

        productRepository.findLowStock.mockResolvedValue(products);

        const result = await productService.getLowStockProducts();

        expect(
            productRepository.findLowStock
        ).toHaveBeenCalled();

        expect(result).toEqual(products);
    });
});