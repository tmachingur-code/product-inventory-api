const productRepository = require("../src/repositories/productRepository");
const prisma = require("../src/config/prisma");

jest.mock("../src/config/prisma", () => ({
    product: {
        updateMany: jest.fn(),
        findUnique: jest.fn(),
    },
}));

describe("Product Stock Repository", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("should increase stock atomically", async () => {
        prisma.product.updateMany.mockResolvedValue({
            count: 1,
        });

        prisma.product.findUnique.mockResolvedValue({
            id: 1,
            name: "Laptop",
            quantity: 15,
        });

        const result =
            await productRepository.adjustStock(1, 5);

        expect(
            prisma.product.updateMany
        ).toHaveBeenCalledWith({
            where: {
                id: 1,
            },
            data: {
                quantity: {
                    increment: 5,
                },
            },
        });

        expect(
            prisma.product.findUnique
        ).toHaveBeenCalledWith({
            where: {
                id: 1,
            },
        });

        expect(result.quantity).toBe(15);
    });

    test("should decrease stock only when enough stock is available", async () => {
        prisma.product.updateMany.mockResolvedValue({
            count: 1,
        });

        prisma.product.findUnique.mockResolvedValue({
            id: 1,
            name: "Laptop",
            quantity: 7,
        });

        const result =
            await productRepository.adjustStock(1, -3);

        expect(
            prisma.product.updateMany
        ).toHaveBeenCalledWith({
            where: {
                id: 1,
                quantity: {
                    gte: 3,
                },
            },
            data: {
                quantity: {
                    decrement: 3,
                },
            },
        });

        expect(result.quantity).toBe(7);
    });

    test("should return null when atomic stock reduction cannot be performed", async () => {
        prisma.product.updateMany.mockResolvedValue({
            count: 0,
        });

        const result =
            await productRepository.adjustStock(1, -10);

        expect(result).toBeNull();

        expect(
            prisma.product.findUnique
        ).not.toHaveBeenCalled();
    });
});