const request = require("supertest");

const app = require("../src/app");
const productService = require("../src/services/productService");

// Mock the service so these tests focus on
// routing and HTTP integration rather than the database.
jest.mock("../src/services/productService");

describe("Product Routes", () => {
    beforeEach(() => {
        // Reset all mocked service functions before every test.
        jest.resetAllMocks();
    });

    test("POST /api/products should create a product", async () => {
        // Fake product returned by the service.
        const product = {
            id: 1,
            name: "Test Laptop",
            description: "Laptop for route testing",
            sku: "LAP-001",
            price: 999.99,
            quantity: 10,
            category: "Electronics",
            lowStockThreshold: 5,
        };

        // Tell the mocked service what to return.
        productService.createProduct.mockResolvedValue(product);

        // Send the HTTP request.
        const response = await request(app)
            .post("/api/products")
            .send({
                name: "Test Laptop",
                description: "Laptop for route testing",
                sku: "LAP-001",
                price: 999.99,
                quantity: 10,
                category: "Electronics",
                lowStockThreshold: 5,
            });

        // Verify the HTTP response.
        expect(response.statusCode).toBe(201);

        // Verify the response body.
        expect(response.body).toEqual({
            success: true,
            data: product,
        });
    });

    test("GET /api/products should return paginated products", async () => {
        // Fake products returned by the service.
        const products = [
            {
                id: 1,
                name: "Test Laptop",
                sku: "LAP-001",
                price: 999.99,
                quantity: 10,
            },
            {
                id: 2,
                name: "Test Mouse",
                sku: "MOU-001",
                price: 29.99,
                quantity: 20,
            },
        ];

        // Fake pagination metadata returned by the service.
        const pagination = {
            page: 1,
            limit: 10,
            total: 2,
            totalPages: 1,
        };

        // Tell the mocked service what to return.
        productService.getPaginatedProducts.mockResolvedValue({
            products,
            pagination,
        });

        // Send the HTTP request.
        const response = await request(app).get("/api/products");

        // Verify the HTTP response.
        expect(response.statusCode).toBe(200);

        // Verify the service received the validated
        // default query values.
        expect(
            productService.getPaginatedProducts
        ).toHaveBeenCalledWith({});

        // Verify the response body.
        expect(response.body).toEqual({
            success: true,
            data: products,
            pagination,
        });
    });

    test("GET /api/products/:id should return a product", async () => {
        // Fake product returned by the service.
        const product = {
            id: 1,
            name: "Test Laptop",
            sku: "LAP-001",
            price: 999.99,
            quantity: 10,
        };

        // Tell the mocked service what to return.
        productService.getProductById.mockResolvedValue(product);

        // Send the HTTP request.
        const response = await request(app).get("/api/products/1");

        // Verify the HTTP response.
        expect(response.statusCode).toBe(200);

        // Verify the response body.
        expect(response.body).toEqual({
            success: true,
            data: product,
        });
    });

    test("GET /api/products/sku/:sku should return a product", async () => {
        // Fake product returned by the service.
        const product = {
            id: 1,
            name: "Test Laptop",
            sku: "LAP-001",
            price: 999.99,
            quantity: 10,
        };

        // Tell the mocked service what to return.
        productService.getProductBySku.mockResolvedValue(product);

        // Send the HTTP request.
        const response = await request(app).get(
            "/api/products/sku/LAP-001"
        );

        // Verify the HTTP response.
        expect(response.statusCode).toBe(200);

        // Verify the response body.
        expect(response.body).toEqual({
            success: true,
            data: product,
        });
    });

    test("PUT /api/products/:id should update a product", async () => {
        // Fake product returned by the service.
        const product = {
            id: 1,
            name: "Updated Laptop",
            sku: "LAP-001",
            price: 1099.99,
            quantity: 15,
        };

        // Tell the mocked service what to return.
        productService.updateProduct.mockResolvedValue(product);

        // Data sent by the client.
        const updateData = {
            name: "Updated Laptop",
            price: 1099.99,
            quantity: 15,
        };

        // Send the HTTP request.
        const response = await request(app)
            .put("/api/products/1")
            .send(updateData);

        // Verify the HTTP response.
        expect(response.statusCode).toBe(200);

        // Verify the response body.
        expect(response.body).toEqual({
            success: true,
            data: product,
        });
    });

    test("DELETE /api/products/:id should delete a product", async () => {
        // Fake product returned by the service.
        const product = {
            id: 1,
            name: "Test Laptop",
            sku: "LAP-001",
            price: 999.99,
            quantity: 10,
        };

        // Tell the mocked service what to return.
        productService.deleteProduct.mockResolvedValue(product);

        // Send the HTTP request.
        const response = await request(app).delete(
            "/api/products/1"
        );

        // Verify the HTTP response.
        expect(response.statusCode).toBe(200);

        // Verify the response body.
        expect(response.body).toEqual({
            success: true,
            data: product,
        });
    });
});