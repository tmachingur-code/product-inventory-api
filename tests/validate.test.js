const request = require("supertest");
const express = require("express");
const { z } = require("zod");

const validate = require("../src/middleware/validate");

describe("Validation middleware", () => {
    /**
     * Create a small test application so we can test
     * the middleware independently from the main API.
     */
    const createTestApp = (schema) => {
        const app = express();

        app.use(express.json());

        app.post(
            "/test",
            validate(schema),
            (req, res) => {
                res.status(200).json({
                    success: true,
                    data: req.body,
                });
            }
        );

        return app;
    };

    test("should allow a valid request to continue", async () => {
        const schema = z.object({
            name: z.string().min(1),
        });

        const app = createTestApp(schema);

        const response = await request(app)
            .post("/test")
            .send({
                name: "Laptop",
            });

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            success: true,
            data: {
                name: "Laptop",
            },
        });
    });

    test("should reject an invalid request with status 400", async () => {
        const schema = z.object({
            name: z.string().min(1),
        });

        const app = createTestApp(schema);

        const response = await request(app)
            .post("/test")
            .send({
                name: "",
            });

        expect(response.statusCode).toBe(400);
    });

    test("should return a useful validation error message", async () => {
        const schema = z.object({
            name: z.string().min(1),
        });

        const app = createTestApp(schema);

        const response = await request(app)
            .post("/test")
            .send({
                name: "",
            });

        expect(response.body).toEqual({
            success: false,
            message: "Validation failed",
            errors: [
                {
                    field: "name",
                    message: expect.any(String),
                },
            ],
        });
    });

    test("should return validation errors for multiple invalid fields", async () => {
        const schema = z.object({
            name: z.string().min(1),
            sku: z.string().min(1),
        });

        const app = createTestApp(schema);

        const response = await request(app)
            .post("/test")
            .send({
                name: "",
                sku: "",
            });

        expect(response.statusCode).toBe(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Validation failed");

        expect(response.body.errors).toHaveLength(2);
    });
});