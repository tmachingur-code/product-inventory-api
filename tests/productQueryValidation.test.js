const { productQuerySchema } = require("../src/schemas/productSchema");

describe("Product Query Schema", () => {
    test("should accept an empty query", () => {
        const result = productQuerySchema.safeParse({});

        expect(result.success).toBe(true);
    });

    test("should accept a valid search query", () => {
        const result = productQuerySchema.safeParse({
            search: "laptop",
        });

        expect(result.success).toBe(true);
    });

    test("should accept a valid category query", () => {
        const result = productQuerySchema.safeParse({
            category: "Electronics",
        });

        expect(result.success).toBe(true);
    });

    test("should accept valid sorting parameters", () => {
        const result = productQuerySchema.safeParse({
            sortBy: "price",
            order: "desc",
        });

        expect(result.success).toBe(true);
    });

    test("should accept valid pagination parameters", () => {
        const result = productQuerySchema.safeParse({
            page: "2",
            limit: "10",
        });

        expect(result.success).toBe(true);

        expect(result.data.page).toBe(2);
        expect(result.data.limit).toBe(10);
    });

    test("should accept all valid query parameters together", () => {
        const result = productQuerySchema.safeParse({
            search: "laptop",
            category: "Electronics",
            sortBy: "price",
            order: "desc",
            page: "1",
            limit: "20",
        });

        expect(result.success).toBe(true);
    });

    test("should reject a non-numeric page", () => {
        const result = productQuerySchema.safeParse({
            page: "abc",
        });

        expect(result.success).toBe(false);
    });

    test("should reject a page less than 1", () => {
        const result = productQuerySchema.safeParse({
            page: "0",
        });

        expect(result.success).toBe(false);
    });

    test("should reject a negative page", () => {
        const result = productQuerySchema.safeParse({
            page: "-1",
        });

        expect(result.success).toBe(false);
    });

    test("should reject a non-numeric limit", () => {
        const result = productQuerySchema.safeParse({
            limit: "abc",
        });

        expect(result.success).toBe(false);
    });

    test("should reject a limit less than 1", () => {
        const result = productQuerySchema.safeParse({
            limit: "0",
        });

        expect(result.success).toBe(false);
    });

    test("should reject an excessively large limit", () => {
        const result = productQuerySchema.safeParse({
            limit: "101",
        });

        expect(result.success).toBe(false);
    });

    test("should reject an invalid sort field", () => {
        const result = productQuerySchema.safeParse({
            sortBy: "randomField",
        });

        expect(result.success).toBe(false);
    });

    test("should reject an invalid sort order", () => {
        const result = productQuerySchema.safeParse({
            order: "sideways",
        });

        expect(result.success).toBe(false);
    });

    test("should reject an empty search value", () => {
        const result = productQuerySchema.safeParse({
            search: "",
        });

        expect(result.success).toBe(false);
    });

    test("should reject an empty category value", () => {
        const result = productQuerySchema.safeParse({
            category: "",
        });

        expect(result.success).toBe(false);
    });
});