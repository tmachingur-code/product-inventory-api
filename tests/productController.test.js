const productService = require("../src/services/productService");
const productController = require("../src/controllers/productController");

jest.mock("../src/services/productService");

describe("Product Controller", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("createProduct", () => {
        test("should create a product and return 201", async () => {
            const productData = {
                name: "Laptop",
                sku: "LAPTOP-001",
                price: 999.99,
                quantity: 10,
            };

            const createdProduct = {
                id: 1,
                ...productData,
            };

            const req = {
                body: productData,
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            const next = jest.fn();

            productService.createProduct.mockResolvedValue(
                createdProduct
            );

            await productController.createProduct(req, res, next);

            expect(productService.createProduct).toHaveBeenCalledWith(
                productData
            );

            expect(res.status).toHaveBeenCalledWith(201);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: createdProduct,
            });

            expect(next).not.toHaveBeenCalled();
        });

        test("should pass errors to next", async () => {
            const error = new Error("Something went wrong");

            const req = {
                body: {
                    name: "Laptop",
                },
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            const next = jest.fn();

            productService.createProduct.mockRejectedValue(error);

            await productController.createProduct(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("getAllProducts", () => {
        test("should retrieve all products", async () => {
            const products = [
                {
                    id: 1,
                    name: "Laptop",
                },
                {
                    id: 2,
                    name: "Mouse",
                },
            ];

            const req = {
                query: {},
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            const next = jest.fn();

            productService.getAllProducts.mockResolvedValue(products);

            await productController.getAllProducts(req, res, next);

            expect(productService.getAllProducts).toHaveBeenCalledWith(
                {}
            );

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: products,
            });

            expect(next).not.toHaveBeenCalled();
        });

        test("should pass search query to the service", async () => {
            const products = [
                {
                    id: 1,
                    name: "Gaming Laptop",
                },
            ];

            const req = {
                query: {
                    search: "laptop",
                },
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            const next = jest.fn();

            productService.getAllProducts.mockResolvedValue(products);

            await productController.getAllProducts(req, res, next);

            expect(productService.getAllProducts).toHaveBeenCalledWith(
                {
                    search: "laptop",
                }
            );

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: products,
            });
        });

        test("should pass category query to the service", async () => {
            const products = [
                {
                    id: 1,
                    name: "Gaming Laptop",
                    category: "Electronics",
                },
            ];

            const req = {
                query: {
                    category: "Electronics",
                },
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            const next = jest.fn();

            productService.getAllProducts.mockResolvedValue(products);

            await productController.getAllProducts(req, res, next);

            expect(productService.getAllProducts).toHaveBeenCalledWith(
                {
                    category: "Electronics",
                }
            );

            expect(res.status).toHaveBeenCalledWith(200);
        });

        test("should pass sorting queries to the service", async () => {
            const products = [
                {
                    id: 1,
                    name: "Expensive Laptop",
                    price: 2000,
                },
                {
                    id: 2,
                    name: "Cheap Laptop",
                    price: 500,
                },
            ];

            const req = {
                query: {
                    sortBy: "price",
                    order: "desc",
                },
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            const next = jest.fn();

            productService.getAllProducts.mockResolvedValue(products);

            await productController.getAllProducts(req, res, next);

            expect(productService.getAllProducts).toHaveBeenCalledWith(
                {
                    sortBy: "price",
                    order: "desc",
                }
            );

            expect(res.status).toHaveBeenCalledWith(200);
        });

        test("should pass pagination queries to the service", async () => {
            const products = [
                {
                    id: 1,
                    name: "Laptop",
                },
            ];

            const req = {
                query: {
                    page: "2",
                    limit: "10",
                },
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            const next = jest.fn();

            productService.getAllProducts.mockResolvedValue(products);

            await productController.getAllProducts(req, res, next);

            expect(productService.getAllProducts).toHaveBeenCalledWith(
                {
                    page: "2",
                    limit: "10",
                }
            );

            expect(res.status).toHaveBeenCalledWith(200);
        });

        test("should pass combined query parameters to the service", async () => {
            const products = [
                {
                    id: 1,
                    name: "Gaming Laptop",
                    category: "Electronics",
                    price: 1500,
                },
            ];

            const req = {
                query: {
                    search: "laptop",
                    category: "Electronics",
                    sortBy: "price",
                    order: "desc",
                    page: "1",
                    limit: "10",
                },
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            const next = jest.fn();

            productService.getAllProducts.mockResolvedValue(products);

            await productController.getAllProducts(req, res, next);

            expect(productService.getAllProducts).toHaveBeenCalledWith(
                {
                    search: "laptop",
                    category: "Electronics",
                    sortBy: "price",
                    order: "desc",
                    page: "1",
                    limit: "10",
                }
            );

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: products,
            });
        });

        test("should pass errors to next", async () => {
            const error = new Error("Something went wrong");

            const req = {
                query: {},
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            const next = jest.fn();

            productService.getAllProducts.mockRejectedValue(error);

            await productController.getAllProducts(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("getProductById", () => {
        test("should return a product by ID", async () => {
            const product = {
                id: 1,
                name: "Laptop",
            };

            const req = {
                params: {
                    id: "1",
                },
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            const next = jest.fn();

            productService.getProductById.mockResolvedValue(product);

            await productController.getProductById(req, res, next);

            expect(productService.getProductById).toHaveBeenCalledWith(
                "1"
            );

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: product,
            });
        });

        test("should pass errors to next", async () => {
            const error = new Error("Product not found");

            const req = {
                params: {
                    id: "999",
                },
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            const next = jest.fn();

            productService.getProductById.mockRejectedValue(error);

            await productController.getProductById(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("getProductBySku", () => {
        test("should return a product by SKU", async () => {
            const product = {
                id: 1,
                name: "Laptop",
                sku: "LAPTOP-001",
            };

            const req = {
                params: {
                    sku: "LAPTOP-001",
                },
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            const next = jest.fn();

            productService.getProductBySku.mockResolvedValue(product);

            await productController.getProductBySku(req, res, next);

            expect(productService.getProductBySku).toHaveBeenCalledWith(
                "LAPTOP-001"
            );

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: product,
            });
        });

        test("should pass errors to next", async () => {
            const error = new Error("Product not found");

            const req = {
                params: {
                    sku: "UNKNOWN",
                },
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            const next = jest.fn();

            productService.getProductBySku.mockRejectedValue(error);

            await productController.getProductBySku(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("updateProduct", () => {
        test("should update a product", async () => {
            const updateData = {
                name: "Updated Laptop",
                price: 1200,
            };

            const updatedProduct = {
                id: 1,
                name: "Updated Laptop",
                price: 1200,
            };

            const req = {
                params: {
                    id: "1",
                },
                body: updateData,
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            const next = jest.fn();

            productService.updateProduct.mockResolvedValue(
                updatedProduct
            );

            await productController.updateProduct(req, res, next);

            expect(productService.updateProduct).toHaveBeenCalledWith(
                "1",
                updateData
            );

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: updatedProduct,
            });
        });

        test("should pass errors to next", async () => {
            const error = new Error("Product not found");

            const req = {
                params: {
                    id: "999",
                },
                body: {
                    name: "Updated Laptop",
                },
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            const next = jest.fn();

            productService.updateProduct.mockRejectedValue(error);

            await productController.updateProduct(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("deleteProduct", () => {
        test("should delete a product", async () => {
            const deletedProduct = {
                id: 1,
                name: "Laptop",
            };

            const req = {
                params: {
                    id: "1",
                },
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            const next = jest.fn();

            productService.deleteProduct.mockResolvedValue(
                deletedProduct
            );

            await productController.deleteProduct(req, res, next);

            expect(productService.deleteProduct).toHaveBeenCalledWith(
                "1"
            );

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: deletedProduct,
            });
        });

        test("should pass errors to next", async () => {
            const error = new Error("Product not found");

            const req = {
                params: {
                    id: "999",
                },
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            const next = jest.fn();

            productService.deleteProduct.mockRejectedValue(error);

            await productController.deleteProduct(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });
});