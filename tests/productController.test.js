const request = require("supertest");
const express = require("express");

const productController = require("../src/controllers/productController");
const productService = require("../src/services/productService");

// Mock the service so controller tests do not use the database.
jest.mock("../src/services/productService");

describe("Product Controller", () => {
    let app;

    beforeEach(() => {
        // Create a fresh Express application for every test.
        app = express();

        // Allow Express to read JSON request bodies.
        app.use(express.json());

        // Test route for creating a product.
        app.post("/products", productController.createProduct);

        // Test route for retrieving all products.
        app.get("/products", productController.getAllProducts);

        // Test route for retrieving a product by ID.
        app.get("/products/:id", productController.getProductById);

        // Test route for retrieving a product by SKU.
        app.get(
            "/products/sku/:sku",
            productController.getProductBySku
        );

        app.put("/products/:id", productController.updateProduct);

        app.delete("/products/:id", productController.deleteProduct);

        // Simple error handler for controller tests.
        app.use((err, req, res, next) => {
            res.status(err.statusCode || 500).json({
                success: false,
                message: err.message,
            });
        });

        // Reset mocked service functions before every test.
        jest.resetAllMocks();
    });

    test("should create a product and return 201", async () => {
        // Data sent by the client.
        const productData = {
            name: "Test Laptop",
            description: "Laptop for controller testing",
            sku: "LAP-001",
            price: 999.99,
            quantity: 10,
            category: "Electronics",
            lowStockThreshold: 5,
        };

        // Fake product returned by the service.
        const createdProduct = {
            id: 1,
            ...productData,
        };

        // Tell the mocked service what to return.
        productService.createProduct.mockResolvedValue(createdProduct);

        // Send the HTTP request.
        const response = await request(app)
            .post("/products")
            .send(productData);

        // Verify the HTTP response.
        expect(response.statusCode).toBe(201);

        // Verify the response body.
        expect(response.body).toEqual({
            success: true,
            data: createdProduct,
        });

        // Verify that the controller passed the request body
        // directly to the service.
        expect(productService.createProduct).toHaveBeenCalledWith(
            productData
        );
    });

    test("should pass service errors to the error handler", async () => {
        // Create an error that the service might throw.
        const error = new Error(
            "A product with this SKU already exists"
        );

        // This error should become HTTP 409 Conflict.
        error.statusCode = 409;

        // Make the mocked service reject with the error.
        productService.createProduct.mockRejectedValue(error);

        // Send the HTTP request.
        const response = await request(app)
            .post("/products")
            .send({
                name: "Duplicate Laptop",
                sku: "LAP-001",
                price: 999.99,
                quantity: 10,
            });

        // Verify the error status code.
        expect(response.statusCode).toBe(409);

        // Verify the error response.
        expect(response.body).toEqual({
            success: false,
            message: "A product with this SKU already exists",
        });
    });

    test("should return all products", async () => {
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

        // Tell the mocked service what to return.
        productService.getAllProducts.mockResolvedValue(products);

        // Send the HTTP request.
        const response = await request(app).get("/products");

        // Verify the HTTP response.
        expect(response.statusCode).toBe(200);

        // Verify the response body.
        expect(response.body).toEqual({
            success: true,
            data: products,
        });

        // Verify that the controller called the service.
        expect(productService.getAllProducts).toHaveBeenCalled();
    });

    test("should return a product by ID", async () => {
        // Fake product returned by the service.
        const product = {
            id: 1,
            name: "Test Laptop",
            description: "Laptop for controller testing",
            sku: "LAP-001",
            price: 999.99,
            quantity: 10,
            category: "Electronics",
            lowStockThreshold: 5,
        };

        // Tell the mocked service what to return.
        productService.getProductById.mockResolvedValue(product);

        // Send the HTTP request.
        const response = await request(app).get("/products/1");

        // Verify the HTTP response.
        expect(response.statusCode).toBe(200);

        // Verify the response body.
        expect(response.body).toEqual({
            success: true,
            data: product,
        });

        // Route parameters are strings, so the controller
        // should pass "1" to the service.
        expect(productService.getProductById).toHaveBeenCalledWith("1");
    });

    test("should return a product by SKU", async () => {
        // Fake product returned by the service.
        const product = {
            id: 1,
            name: "Test Laptop",
            description: "Laptop for controller testing",
            sku: "LAP-001",
            price: 999.99,
            quantity: 10,
            category: "Electronics",
            lowStockThreshold: 5,
        };

        // Tell the mocked service what to return.
        productService.getProductBySku.mockResolvedValue(product);

        // Send the HTTP request.
        const response = await request(app).get(
            "/products/sku/LAP-001"
        );

        // Verify the HTTP response.
        expect(response.statusCode).toBe(200);

        // Verify the response body.
        expect(response.body).toEqual({
            success: true,
            data: product,
        });

        // Verify that the controller passed the SKU
        // to the service.
        expect(productService.getProductBySku).toHaveBeenCalledWith(
            "LAP-001"
        );
    });

    test("should return 404 when product by ID is not found", async () => {
    // Create the error that the service would throw.
    const error = new Error("Product not found");

    // This should become HTTP 404 Not Found.
    error.statusCode = 404;

    // Make the mocked service reject with the error.
    productService.getProductById.mockRejectedValue(error);

    // Send the HTTP request.
    const response = await request(app).get("/products/999");

    // Verify the HTTP status code.
    expect(response.statusCode).toBe(404);

    // Verify the error response.
    expect(response.body).toEqual({
        success: false,
        message: "Product not found",
    });

    // Verify that the controller passed the ID
    // to the service.
    expect(productService.getProductById).toHaveBeenCalledWith("999");
});

    test("should update a product and return 200", async () => {
        // Data sent by the client.
        const updateData = {
            name: "Updated Laptop",
            price: 1099.99,
            quantity: 15,
        };

        // Fake product returned by the service.
        const updatedProduct = {
            id: 1,
            name: "Updated Laptop",
            description: "Updated laptop",
            sku: "LAP-001",
            price: 1099.99,
            quantity: 15,
            category: "Electronics",
            lowStockThreshold: 5,
        };

        // Tell the mocked service what to return.
        productService.updateProduct.mockResolvedValue(updatedProduct);

        // Send the HTTP request.
        const response = await request(app)
            .put("/products/1")
            .send(updateData);

        // Verify the HTTP response.
        expect(response.statusCode).toBe(200);

        // Verify the response body.
        expect(response.body).toEqual({
            success: true,
            data: updatedProduct,
        });

        // Verify that the controller passed the ID
        // and request body to the service.
        expect(productService.updateProduct).toHaveBeenCalledWith(
            "1",
            updateData
        );
    });

    test("should return 404 when updating a product that does not exist", async () => {
        // Create the error that the service would throw.
        const error = new Error("Product not found");

        // This should become HTTP 404 Not Found.
        error.statusCode = 404;

        // Make the mocked service reject with the error.
        productService.updateProduct.mockRejectedValue(error);

        // Send the HTTP request.
        const response = await request(app)
            .put("/products/999")
            .send({
                name: "Updated Product",
            });

        // Verify the HTTP status code.
        expect(response.statusCode).toBe(404);

        // Verify the error response.
        expect(response.body).toEqual({
            success: false,
            message: "Product not found",
        });

        // Verify that the controller passed the ID
        // and request body to the service.
        expect(productService.updateProduct).toHaveBeenCalledWith(
            "999",
            {
                name: "Updated Product",
            }
        );
    });

    test("should return 409 when updating a product with a duplicate SKU", async () => {
        // Create the error that the service would throw.
        const error = new Error(
            "A product with this SKU already exists"
        );

        // This should become HTTP 409 Conflict.
        error.statusCode = 409;

        // Make the mocked service reject with the error.
        productService.updateProduct.mockRejectedValue(error);

        // Send the HTTP request.
        const response = await request(app)
            .put("/products/1")
            .send({
                sku: "EXISTING-SKU",
            });

        // Verify the HTTP status code.
        expect(response.statusCode).toBe(409);

        // Verify the error response.
        expect(response.body).toEqual({
            success: false,
            message: "A product with this SKU already exists",
        });
    });

    test("should delete a product and return 200", async () => {
        // Fake product returned by the service.
        const deletedProduct = {
            id: 1,
            name: "Test Laptop",
            sku: "LAP-001",
            price: 999.99,
            quantity: 10,
        };

        // Tell the mocked service what to return.
        productService.deleteProduct.mockResolvedValue(deletedProduct);

        // Send the HTTP request.
        const response = await request(app).delete("/products/1");

        // Verify the HTTP response.
        expect(response.statusCode).toBe(200);

        // Verify the response body.
        expect(response.body).toEqual({
            success: true,
            data: deletedProduct,
        });

        // Verify that the controller passed the ID
        // to the service.
        expect(productService.deleteProduct).toHaveBeenCalledWith("1");
    });

    test("should return 404 when deleting a product that does not exist", async () => {
        // Create the error that the service would throw.
        const error = new Error("Product not found");

        // This should become HTTP 404 Not Found.
        error.statusCode = 404;

        // Make the mocked service reject with the error.
        productService.deleteProduct.mockRejectedValue(error);

        // Send the HTTP request.
        const response = await request(app).delete("/products/999");

        // Verify the HTTP status code.
        expect(response.statusCode).toBe(404);

        // Verify the error response.
        expect(response.body).toEqual({
            success: false,
            message: "Product not found",
        });

        // Verify that the controller passed the ID
        // to the service.
        expect(productService.deleteProduct).toHaveBeenCalledWith("999");
    });
});