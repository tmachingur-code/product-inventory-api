const { z } = require("zod");
const {
    createProductSchema,
    updateProductSchema,
} = require("../src/schemas/productSchema");

describe("Product validation schemas", () => {
    describe("createProductSchema", () => {
        test("should accept a valid product", () => {
            const product = {
                name: "Laptop",
                sku: "LAP-001",
                price: 999.99,
                quantity: 10,
                category: "Electronics",
                description: "A powerful laptop",
                lowStockThreshold: 5,
            };

            const result = createProductSchema.safeParse(product);

            expect(result.success).toBe(true);
        });

        test("should reject a product without a name", () => {
            const product = {
                sku: "LAP-001",
                price: 999.99,
            };

            const result = createProductSchema.safeParse(product);

            expect(result.success).toBe(false);
        });

        test("should reject an empty name", () => {
            const product = {
                name: "",
                sku: "LAP-001",
                price: 999.99,
            };

            const result = createProductSchema.safeParse(product);

            expect(result.success).toBe(false);
        });

        test("should reject a product without a SKU", () => {
            const product = {
                name: "Laptop",
                price: 999.99,
            };

            const result = createProductSchema.safeParse(product);

            expect(result.success).toBe(false);
        });

        test("should reject a negative price", () => {
            const product = {
                name: "Laptop",
                sku: "LAP-001",
                price: -100,
            };

            const result = createProductSchema.safeParse(product);

            expect(result.success).toBe(false);
        });

        test("should reject a negative quantity", () => {
            const product = {
                name: "Laptop",
                sku: "LAP-001",
                price: 999.99,
                quantity: -5,
            };

            const result = createProductSchema.safeParse(product);

            expect(result.success).toBe(false);
        });

        test("should reject a non-integer quantity", () => {
            const product = {
                name: "Laptop",
                sku: "LAP-001",
                price: 999.99,
                quantity: 2.5,
            };

            const result = createProductSchema.safeParse(product);

            expect(result.success).toBe(false);
        });

        test("should reject a negative low stock threshold", () => {
            const product = {
                name: "Laptop",
                sku: "LAP-001",
                price: 999.99,
                lowStockThreshold: -1,
            };

            const result = createProductSchema.safeParse(product);

            expect(result.success).toBe(false);
        });
    });

    describe("updateProductSchema", () => {
        test("should accept a partial product update", () => {
            const product = {
                price: 799.99,
            };

            const result = updateProductSchema.safeParse(product);

            expect(result.success).toBe(true);
        });

        test("should accept updating multiple fields", () => {
            const product = {
                name: "Updated Laptop",
                price: 799.99,
                quantity: 15,
            };

            const result = updateProductSchema.safeParse(product);

            expect(result.success).toBe(true);
        });

        test("should reject an empty update", () => {
            const result = updateProductSchema.safeParse({});

            expect(result.success).toBe(false);
        });

        test("should reject a negative price during update", () => {
            const product = {
                price: -50,
            };

            const result = updateProductSchema.safeParse(product);

            expect(result.success).toBe(false);
        });
    });
});