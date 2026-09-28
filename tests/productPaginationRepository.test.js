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
     * Create test products before running the tests.
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

    test("should search product names case-insensitively", async () => {
        const result = await productRepository.findAllPaginated({
            search: uniqueTerm.toLowerCase(),
            page: 1,
            limit: 10,
        });

        expect(result.total).toBe(3);

        expect(result.products).toHaveLength(3);

        result.products.forEach((product) => {
            expect(product.name.toLowerCase()).toContain(
                uniqueTerm.toLowerCase()
            );
        });
    });

    test("should filter products by category case-insensitively", async () => {
        const result = await productRepository.findAllPaginated({
            category: "paginationtest",
            page: 1,
            limit: 10,
        });

        expect(result.total).toBeGreaterThanOrEqual(3);

        result.products.forEach((product) => {
            expect(product.category).toBe("PaginationTest");
        });
    });

    test("should sort products by price in ascending order", async () => {
        const result = await productRepository.findAllPaginated({
            search: uniqueTerm,
            sortBy: "price",
            order: "asc",
            page: 1,
            limit: 10,
        });

        expect(result.products).toHaveLength(3);

        expect(
            result.products.map((product) =>
                Number(product.price)
            )
        ).toEqual([10, 20, 30]);
    });

    test("should sort products by price in descending order", async () => {
        const result = await productRepository.findAllPaginated({
            search: uniqueTerm,
            sortBy: "price",
            order: "desc",
            page: 1,
            limit: 10,
        });

        expect(result.products).toHaveLength(3);

        expect(
            result.products.map((product) =>
                Number(product.price)
            )
        ).toEqual([30, 20, 10]);
    });

    test("should combine search, category, sorting, and pagination", async () => {
        const result = await productRepository.findAllPaginated({
            search: uniqueTerm,
            category: "PaginationTest",
            sortBy: "price",
            order: "desc",
            page: 1,
            limit: 2,
        });

        expect(result.total).toBe(3);

        expect(result.products).toHaveLength(2);

        expect(
            result.products.map((product) =>
                Number(product.price)
            )
        ).toEqual([30, 20]);

        result.products.forEach((product) => {
            expect(product.name.toLowerCase()).toContain(
                uniqueTerm.toLowerCase()
            );

            expect(product.category).toBe("PaginationTest");
        });
    });

    test("should return an empty page when page is beyond the last page", async () => {
        const result = await productRepository.findAllPaginated({
            search: uniqueTerm,
            page: 3,
            limit: 2,
        });

        expect(result.products).toHaveLength(0);

        expect(result.total).toBe(3);
    });

    test("should return zero products when there are no matches", async () => {
        const result = await productRepository.findAllPaginated({
            search: "DefinitelyNoMatchingProduct",
            page: 1,
            limit: 10,
        });

        expect(result.products).toHaveLength(0);

        expect(result.total).toBe(0);
    });

    test("should return zero products when search and category have no matching combination", async () => {
        const result = await productRepository.findAllPaginated({
            search: uniqueTerm,
            category: "NonExistingCategory",
            page: 1,
            limit: 10,
        });

        expect(result.products).toHaveLength(0);

        expect(result.total).toBe(0);
    });

    test("should sort products by name in ascending order", async () => {
        const result = await productRepository.findAllPaginated({
            search: uniqueTerm,
            sortBy: "name",
            order: "asc",
            page: 1,
            limit: 10,
        });

        expect(result.products).toHaveLength(3);

        expect(
            result.products.map((product) => product.name)
        ).toEqual([
            `${uniqueTerm} Product 1`,
            `${uniqueTerm} Product 2`,
            `${uniqueTerm} Product 3`,
        ]);
    });

    test("should sort products by quantity in ascending order", async () => {
        const result = await productRepository.findAllPaginated({
            search: uniqueTerm,
            sortBy: "quantity",
            order: "asc",
            page: 1,
            limit: 10,
        });

        expect(result.products).toHaveLength(3);

        expect(
            result.products.map((product) => product.quantity)
        ).toEqual([10, 15, 20]);
    });

    test("should sort products by quantity in descending order", async () => {
        const result = await productRepository.findAllPaginated({
            search: uniqueTerm,
            sortBy: "quantity",
            order: "desc",
            page: 1,
            limit: 10,
        });

        expect(result.products).toHaveLength(3);

        expect(
            result.products.map((product) => product.quantity)
        ).toEqual([20, 15, 10]);
    });

    test("should support page 1 with limit 1", async () => {
        const result = await productRepository.findAllPaginated({
            search: uniqueTerm,
            page: 1,
            limit: 1,
        });

        expect(result.products).toHaveLength(1);

        expect(result.total).toBe(3);
    });

    test("should support the maximum pagination limit of 100", async () => {
        const result = await productRepository.findAllPaginated({
            search: uniqueTerm,
            page: 1,
            limit: 100,
        });

        expect(result.products).toHaveLength(3);

        expect(result.total).toBe(3);
    });

    test("should fall back to createdAt when an invalid sort field is provided", async () => {
        const result = await productRepository.findAllPaginated({
            search: uniqueTerm,
            sortBy: "invalidSortField",
            order: "asc",
            page: 1,
            limit: 10,
        });

        expect(result.products).toHaveLength(3);

        expect(result.total).toBe(3);
    });
});