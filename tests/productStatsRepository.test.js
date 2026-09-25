const prisma = require("../src/config/prisma");
const productRepository = require("../src/repositories/productRepository");

describe("Product Repository - Inventory Statistics", () => {
    const testProducts = [
        {
            name: "Stats Laptop",
            sku: `STATS-LAP-${Date.now()}`,
            price: 1000,
            quantity: 5,
            category: "Stats Test",
            lowStockThreshold: 2,
        },
        {
            name: "Stats Mouse",
            sku: `STATS-MOUSE-${Date.now()}`,
            price: 50,
            quantity: 10,
            category: "Stats Test",
            lowStockThreshold: 3,
        },
        {
            name: "Stats Keyboard",
            sku: `STATS-KEY-${Date.now()}`,
            price: 100,
            quantity: 2,
            category: "Stats Test",
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
                category: "Stats Test",
            },
        });
    });

    test("should return correct inventory statistics", async () => {
        const stats = await productRepository.getInventoryStats();

        const expectedProducts = testProducts.length;

        const expectedQuantity = testProducts.reduce(
            (total, product) => total + product.quantity,
            0
        );

        const expectedInventoryValue = testProducts.reduce(
            (total, product) =>
                total + Number(product.price) * product.quantity,
            0
        );

        const expectedLowStockCount = testProducts.filter(
            (product) =>
                product.quantity <= product.lowStockThreshold
        ).length;

        expect(stats).toEqual(
            expect.objectContaining({
                totalProducts: expect.any(Number),
                totalQuantity: expect.any(Number),
                lowStockCount: expect.any(Number),
                inventoryValue: expect.any(Number),
            })
        );

        expect(stats.totalProducts).toBeGreaterThanOrEqual(
            expectedProducts
        );

        expect(stats.totalQuantity).toBeGreaterThanOrEqual(
            expectedQuantity
        );

        expect(stats.lowStockCount).toBeGreaterThanOrEqual(
            expectedLowStockCount
        );

        expect(stats.inventoryValue).toBeGreaterThanOrEqual(
            expectedInventoryValue
        );
    });
});