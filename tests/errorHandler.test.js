const request = require("supertest");
const app = require("../src/app");

describe("Error handling", () => {
    test("should return 404 for an unknown route", async () => {
        const response = await request(app).get("/does-not-exist");

        expect(response.statusCode).toBe(404);

        expect(response.body).toEqual({
            success: false,
            message: "Route not found",
        });
    });
});