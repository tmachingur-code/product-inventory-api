const { z } = require("zod");

describe("Product ID validation", () => {
    const productIdSchema = z.object({
        id: z.coerce.number().int().positive(),
    });

    test("should accept a valid positive integer ID", () => {
        const result = productIdSchema.safeParse({
            id: "15",
        });

        expect(result.success).toBe(true);
        expect(result.data.id).toBe(15);
    });

    test("should reject a non-numeric ID", () => {
        const result = productIdSchema.safeParse({
            id: "abc",
        });

        expect(result.success).toBe(false);
    });

    test("should reject a decimal ID", () => {
        const result = productIdSchema.safeParse({
            id: "2.5",
        });

        expect(result.success).toBe(false);
    });

    test("should reject zero", () => {
        const result = productIdSchema.safeParse({
            id: "0",
        });

        expect(result.success).toBe(false);
    });

    test("should reject a negative ID", () => {
        const result = productIdSchema.safeParse({
            id: "-1",
        });

        expect(result.success).toBe(false);
    });
});