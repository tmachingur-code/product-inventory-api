const productRepository = require("../src/repositories/productRepository");

describe("Product Repository - Pagination Metadata", () => {
    /**
     * Use a unique search term so the test only
     * works with products created by this test.
     */
    const uniqueTerm = `PaginationTest${Date.now()}`;

    const testProducts = [
        {
            name: `${uniqueTerm} Product 1`,
            sku: `PAG-${Date.now()}-1`,
            price: 10.00,
            quantity: 20,
            category: "PaginationTest",
        },
        {
            name: `${uniqueTerm} Product 2`,
            sku: `PAG-${Date.now()}-2`,
            price: 20.00,
            quantity: 15,
            category: "PaginationTest",
        },
        {
            name: `${uniqueTerm} Product 3`,
            sku: `PAG-${Date.now()}-3`,
            price: 30.00,
            quantity: 10,
            category: "PaginationTest",
        },
    ];

    let createdProducts = [];

    /**
     * Create test products before running the test.
     */
    beforeAll(async () => {
        for (const product of testProducts) {
            const created = await productRepository.create(product);
            createdProducts.push(created);
        }
    });

    /**
     * Remove the products created by this test
     * so the database is left clean.
     */
    afterAll(async () => {
        for (const product of createdProducts) {
            await productRepository.delete(product.id);
        }
    });

    test("should return products and pagination metadata", async () => {
        const result = await productRepository.findAllPaginated({
            search: uniqueTerm,
            page: 1,
            limit: 2,
        });

        expect(result).toHaveProperty("products");
        expect(result).toHaveProperty("total");

        expect(Array.isArray(result.products)).toBe(true);

        expect(result.products).toHaveLength(2);

        expect(result.total).toBe(3);
    });

    test("should return the correct products for the second page", async () => {
        const result = await productRepository.findAllPaginated({
            search: uniqueTerm,
            page: 2,
            limit: 2,
        });

        expect(result.products).toHaveLength(1);

        expect(result.total).toBe(3);
    });

    test("should return the correct total when filters are applied", async () => {
        const result = await productRepository.findAllPaginated({
            category: "PaginationTest",
            page: 1,
            limit: 2,
        });

        expect(result).toHaveProperty("products");
        expect(result).toHaveProperty("total");

        expect(result.total).toBeGreaterThanOrEqual(3);
    });
});