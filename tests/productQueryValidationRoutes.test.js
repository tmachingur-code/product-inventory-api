const request = require("supertest");
const app = require("../src/app");

describe("Product Query Validation Routes", () => {
    /**
     * Invalid page should be rejected by
     * the query validation middleware.
     */
    test("should reject a non-numeric page", async () => {
        const response = await request(app)
            .get("/api/products?page=abc");

        expect(response.statusCode).toBe(400);

        expect(response.body.success).toBe(false);

        expect(response.body.message).toBe(
            "Validation failed"
        );
    });

    /**
     * Page numbers below 1 should be rejected.
     */
    test("should reject a page less than 1", async () => {
        const response = await request(app)
            .get("/api/products?page=0");

        expect(response.statusCode).toBe(400);

        expect(response.body.success).toBe(false);
    });

    /**
     * Limits below 1 should be rejected.
     */
    test("should reject a limit less than 1", async () => {
        const response = await request(app)
            .get("/api/products?limit=0");

        expect(response.statusCode).toBe(400);

        expect(response.body.success).toBe(false);
    });

    /**
     * Limits above 100 should be rejected.
     */
    test("should reject a limit greater than 100", async () => {
        const response = await request(app)
            .get("/api/products?limit=101");

        expect(response.statusCode).toBe(400);

        expect(response.body.success).toBe(false);
    });

    /**
     * Invalid sort fields should be rejected.
     */
    test("should reject an invalid sort field", async () => {
        const response = await request(app)
            .get("/api/products?sortBy=invalid");

        expect(response.statusCode).toBe(400);

        expect(response.body.success).toBe(false);
    });

    /**
     * Invalid sort orders should be rejected.
     */
    test("should reject an invalid sort order", async () => {
        const response = await request(app)
            .get("/api/products?order=random");

        expect(response.statusCode).toBe(400);

        expect(response.body.success).toBe(false);
    });

    /**
     * Valid query parameters should pass
     * validation and reach the controller.
     */
    test("should accept valid query parameters", async () => {
        const response = await request(app)
            .get(
                "/api/products?search=laptop&category=Electronics&sortBy=price&order=asc&page=1&limit=10"
            );

        /**
         * The request should NOT fail with a validation error.
         *
         * The actual database response may depend on
         * the current contents of the database.
         */
        expect(response.statusCode).not.toBe(400);
    });
});