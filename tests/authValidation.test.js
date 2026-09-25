const {
    registerUserSchema,
    loginUserSchema,
} = require("../src/schemas/authSchema");

describe("Auth Validation", () => {
    describe("registerUserSchema", () => {
        test("should accept valid registration data", () => {
            const result = registerUserSchema.safeParse({
                name: "John Doe",
                email: "john@example.com",
                password: "SecurePassword123!",
            });

            expect(result.success).toBe(true);
        });

        test("should reject an invalid email", () => {
            const result = registerUserSchema.safeParse({
                name: "John Doe",
                email: "not-an-email",
                password: "SecurePassword123!",
            });

            expect(result.success).toBe(false);
        });

        test("should reject a short password", () => {
            const result = registerUserSchema.safeParse({
                name: "John Doe",
                email: "john@example.com",
                password: "123",
            });

            expect(result.success).toBe(false);
        });

        test("should reject a missing name", () => {
            const result = registerUserSchema.safeParse({
                email: "john@example.com",
                password: "SecurePassword123!",
            });

            expect(result.success).toBe(false);
        });
    });

    describe("loginUserSchema", () => {
        test("should accept valid login data", () => {
            const result = loginUserSchema.safeParse({
                email: "john@example.com",
                password: "SecurePassword123!",
            });

            expect(result.success).toBe(true);
        });

        test("should reject an invalid email", () => {
            const result = loginUserSchema.safeParse({
                email: "not-an-email",
                password: "SecurePassword123!",
            });

            expect(result.success).toBe(false);
        });

        test("should reject a missing password", () => {
            const result = loginUserSchema.safeParse({
                email: "john@example.com",
            });

            expect(result.success).toBe(false);
        });
    });
});