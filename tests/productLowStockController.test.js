const productController = require("../src/controllers/productController");
const productService = require("../src/services/productService");

// Mock the service so this test focuses only
// on controller behavior.
jest.mock("../src/services/productService");

describe("Product Controller - Low Stock", () => {
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

        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const next = jest.fn();

        await productController.getLowStockProducts(
            req,
            res,
            next
        );

        expect(
            productService.getLowStockProducts
        ).toHaveBeenCalled();

        expect(res.status).toHaveBeenCalledWith(200);

        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: products,
        });

        expect(next).not.toHaveBeenCalled();
    });
});