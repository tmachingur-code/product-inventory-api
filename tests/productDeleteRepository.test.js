const prisma = require("../src/config/prisma");
const productRepository = require("../src/repositories/productRepository");

describe("Product Repository - Delete", () => {
    afterAll(async () => {
        await prisma.$disconnect();
    });

    test("should delete a product by its ID", async () => {
        const product = await prisma.product.create({
            data: {
                name: "Delete Test Product",
                description:
                    "Product used for delete repository testing",
                sku: `DELETE-TEST-${Date.now()}`,
                price: 100,
                quantity: 10,
                category: "Testing",
                lowStockThreshold: 5,
            },
        });

        const deletedProduct =
            await productRepository.delete(product.id);

        expect(deletedProduct).toEqual(
            expect.objectContaining({
                id: product.id,
                name: "Delete Test Product",
                sku: product.sku,
            })
        );

        const remainingProduct =
            await prisma.product.findUnique({
                where: {
                    id: product.id,
                },
            });

        expect(remainingProduct).toBeNull();
    });

    test("should return the deleted product", async () => {
        const product = await prisma.product.create({
            data: {
                name: "Delete Return Test Product",
                description:
                    "Product used to verify delete return value",
                sku: `DELETE-RETURN-${Date.now()}`,
                price: 150,
                quantity: 20,
                category: "Testing",
                lowStockThreshold: 5,
            },
        });

        const deletedProduct =
            await productRepository.delete(product.id);

        expect(deletedProduct.id).toBe(product.id);
        expect(deletedProduct.name).toBe(
            "Delete Return Test Product"
        );
        expect(deletedProduct.sku).toBe(product.sku);
    });
});