const productRepository = require("../src/repositories/productRepository");

describe("Product Repository - findAll", () => {
    const uniqueTerm = `FindAllTest${Date.now()}`;

    const testProducts = [
        {
            name: `${uniqueTerm} Laptop`,
            sku: `FINDALL-${Date.now()}-1`,
            price: 1000,
            quantity: 20,
            category: "Electronics",
        },
        {
            name: `${uniqueTerm} Mouse`,
            sku: `FINDALL-${Date.now()}-2`,
            price: 50,
            quantity: 5,
            category: "Accessories",
        },
        {
            name: `${uniqueTerm} Keyboard`,
            sku: `FINDALL-${Date.now()}-3`,
            price: 100,
            quantity: 10,
            category: "Accessories",
        },
    ];

    let createdProducts = [];

    beforeAll(async () => {
        for (const product of testProducts) {
            const created = await productRepository.create(product);
            createdProducts.push(created);
        }
    });

    afterAll(async () => {
        for (const product of createdProducts) {
            await productRepository.delete(product.id);
        }
    });

    test("should return all products", async () => {
        const products = await productRepository.findAll({
            search: uniqueTerm,
        });

        expect(products).toHaveLength(3);
    });

    test("should search product names case-insensitively", async () => {
        const products = await productRepository.findAll({
            search: uniqueTerm.toLowerCase(),
        });

        expect(products).toHaveLength(3);

        products.forEach((product) => {
            expect(product.name.toLowerCase()).toContain(
                uniqueTerm.toLowerCase()
            );
        });
    });

    test("should filter products by category case-insensitively", async () => {
        const products = await productRepository.findAll({
            search: uniqueTerm,
            category: "accessories",
        });

        expect(products).toHaveLength(2);

        products.forEach((product) => {
            expect(product.category).toBe("Accessories");
        });
    });

    test("should sort products by price in ascending order", async () => {
        const products = await productRepository.findAll({
            search: uniqueTerm,
            sortBy: "price",
            order: "asc",
        });

        expect(
            products.map((product) => Number(product.price))
        ).toEqual([50, 100, 1000]);
    });

    test("should sort products by price in descending order", async () => {
        const products = await productRepository.findAll({
            search: uniqueTerm,
            sortBy: "price",
            order: "desc",
        });

        expect(
            products.map((product) => Number(product.price))
        ).toEqual([1000, 100, 50]);
    });

    test("should fall back to createdAt for an invalid sort field", async () => {
        const products = await productRepository.findAll({
            search: uniqueTerm,
            sortBy: "invalidField",
        });

        expect(products).toHaveLength(3);
    });

    test("should apply pagination when limit is provided", async () => {
        const products = await productRepository.findAll({
            search: uniqueTerm,
            page: 2,
            limit: 2,
        });

        expect(products).toHaveLength(1);
    });

    test("should normalize invalid pagination values", async () => {
        const products = await productRepository.findAll({
            search: uniqueTerm,
            page: 0,
            limit: 0,
        });

        expect(products).toHaveLength(1);
    });

    test("should not apply pagination when limit is undefined", async () => {
        const products = await productRepository.findAll({
            search: uniqueTerm,
        });

        expect(products).toHaveLength(3);
    });
});