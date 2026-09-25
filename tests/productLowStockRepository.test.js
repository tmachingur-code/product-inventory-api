const prisma = require("../src/config/prisma");
const productRepository = require("../src/repositories/productRepository");

describe("Product Repository - Low Stock", () => {
    const testProducts = [
        {
            name: "Low Stock Laptop",
            sku: `LOW-LAP-${Date.now()}`,
            price: 1200,
            quantity: 3,
            category: "Low Stock Test",
            lowStockThreshold: 5,
        },
        {
            name: "Normal Stock Mouse",
            sku: `NORMAL-MOUSE-${Date.now()}`,
            price: 25,
            quantity: 20,
            category: "Low Stock Test",
            lowStockThreshold: 5,
        },
        {
            name: "Exact Threshold Keyboard",
            sku: `EXACT-KEY-${Date.now()}`,
            price: 75,
            quantity: 5,
            category: "Low Stock Test",
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
                category: "Low Stock Test",
            },
        });
    });

    test("should return products whose quantity is at or below the low-stock threshold", async () => {
        const products = await productRepository.findLowStock();

        const testResults = products.filter(
            (product) =>
                product.category === "Low Stock Test"
        );

        expect(testResults).toHaveLength(2);

        expect(
            testResults.some(
                (product) =>
                    product.name === "Low Stock Laptop"
            )
        ).toBe(true);

        expect(
            testResults.some(
                (product) =>
                    product.name === "Exact Threshold Keyboard"
            )
        ).toBe(true);

        expect(
            testResults.some(
                (product) =>
                    product.name === "Normal Stock Mouse"
            )
        ).toBe(false);
    });
});