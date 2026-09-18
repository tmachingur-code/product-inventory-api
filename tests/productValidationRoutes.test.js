const request = require("supertest");
const app = require("../src/app");

describe("Product route validation", () => {
    describe("POST /api/products", () => {
        test("should reject a product with an empty name", async () => {
            const response = await request(app)
                .post("/api/products")
                .send({
                    name: "",
                    sku: "TEST-001",
                    price: 100,
                    quantity: 10,
                });

            expect(response.statusCode).toBe(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe("Validation failed");
        });

        test("should reject a product with a negative price", async () => {
            const response = await request(app)
                .post("/api/products")
                .send({
                    name: "Test Product",
                    sku: "TEST-002",
                    price: -100,
                    quantity: 10,
                });

            expect(response.statusCode).toBe(400);

            expect(response.body.success).toBe(false);
        });

        test("should reject a product with a negative quantity", async () => {
            const response = await request(app)
                .post("/api/products")
                .send({
                    name: "Test Product",
                    sku: "TEST-003",
                    price: 100,
                    quantity: -5,
                });

            expect(response.statusCode).toBe(400);

            expect(response.body.success).toBe(false);
        });

        test("should reject a product without a SKU", async () => {
            const response = await request(app)
                .post("/api/products")
                .send({
                    name: "Test Product",
                    price: 100,
                    quantity: 10,
                });

            expect(response.statusCode).toBe(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe("PUT /api/products/:id", () => {
        test("should reject an update with a negative price", async () => {
            const response = await request(app)
                .put("/api/products/1")
                .send({
                    price: -50,
                });

            expect(response.statusCode).toBe(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe("Validation failed");
        });

        test("should reject an empty update", async () => {
            const response = await request(app)
                .put("/api/products/1")
                .send({});

            expect(response.statusCode).toBe(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe("Validation failed");
        });
    });
});