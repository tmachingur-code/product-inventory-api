const request = require("supertest");
const app = require("../src/app");

describe("GET /", () => {
    test("should return the API health status", async () => {
        const response = await request(app).get("/");

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            message: "Product Inventory API is running",
            status: "healthy",
        });
    });
});