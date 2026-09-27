const productService = require("../src/services/productService");
const productRepository = require("../src/repositories/productRepository");

jest.mock("../src/repositories/productRepository");

describe("Product Stock Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("should increase product stock", async () => {
        productRepository.findById.mockResolvedValue({
            id: 1,
            name: "Laptop",
            quantity: 10,
        });

        productRepository.adjustStock.mockResolvedValue({
            id: 1,
            name: "Laptop",
            quantity: 15,
        });

        const result =
            await productService.adjustStock(1, 5);

        expect(
            productRepository.adjustStock
        ).toHaveBeenCalledWith(1, 5);

        expect(result.quantity).toBe(15);
    });

    test("should decrease product stock", async () => {
        productRepository.findById.mockResolvedValue({
            id: 1,
            name: "Laptop",
            quantity: 10,
        });

        productRepository.adjustStock.mockResolvedValue({
            id: 1,
            name: "Laptop",
            quantity: 7,
        });

        const result =
            await productService.adjustStock(1, -3);

        expect(
            productRepository.adjustStock
        ).toHaveBeenCalledWith(1, -3);

        expect(result.quantity).toBe(7);
    });

    test("should reject a zero stock adjustment", async () => {
        await expect(
            productService.adjustStock(1, 0)
        ).rejects.toMatchObject({
            statusCode: 400,
            message: "Stock adjustment cannot be zero",
        });

        expect(
            productRepository.findById
        ).not.toHaveBeenCalled();

        expect(
            productRepository.adjustStock
        ).not.toHaveBeenCalled();
    });

    test("should reject stock adjustment that would make quantity negative", async () => {
        productRepository.findById.mockResolvedValue({
            id: 1,
            name: "Laptop",
            quantity: 3,
        });

        await expect(
            productService.adjustStock(1, -5)
        ).rejects.toMatchObject({
            statusCode: 400,
            message: "Insufficient stock",
        });

        expect(
            productRepository.adjustStock
        ).not.toHaveBeenCalled();
    });

    test("should reject adjustment for a product that does not exist", async () => {
        productRepository.findById.mockResolvedValue(null);

        await expect(
            productService.adjustStock(999, 5)
        ).rejects.toMatchObject({
            statusCode: 404,
            message: "Product not found",
        });

        expect(
            productRepository.adjustStock
        ).not.toHaveBeenCalled();
    });
});