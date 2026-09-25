const productRepository = require("../src/repositories/productRepository");
const productService = require("../src/services/productService");

// Mock the repository so these tests focus only on
// service-layer business logic.
jest.mock("../src/repositories/productRepository");

describe("Product Service", () => {
    beforeEach(() => {
        // Clear mock history before every test.
        jest.clearAllMocks();
    });

    describe("createProduct", () => {
        test("should create a product when the SKU does not exist", async () => {
            const productData = {
                name: "Test Laptop",
                sku: "TEST-LAPTOP",
                price: 999.99,
                quantity: 10,
            };

            const createdProduct = {
                id: 1,
                ...productData,
            };

            productRepository.findBySku.mockResolvedValue(null);
            productRepository.create.mockResolvedValue(createdProduct);

            const result = await productService.createProduct(productData);

            expect(productRepository.findBySku).toHaveBeenCalledWith(
                productData.sku
            );

            expect(productRepository.create).toHaveBeenCalledWith(
                productData
            );

            expect(result).toEqual(createdProduct);
        });

        test("should reject a duplicate SKU", async () => {
            const productData = {
                name: "Test Laptop",
                sku: "DUPLICATE-SKU",
                price: 999.99,
                quantity: 10,
            };

            productRepository.findBySku.mockResolvedValue({
                id: 1,
                ...productData,
            });

            await expect(
                productService.createProduct(productData)
            ).rejects.toMatchObject({
                statusCode: 409,
                message: "A product with this SKU already exists",
            });

            expect(productRepository.create).not.toHaveBeenCalled();
        });
    });

    describe("getAllProducts", () => {
        test("should retrieve all products", async () => {
            const products = [
                {
                    id: 1,
                    name: "Laptop",
                    sku: "LAPTOP-001",
                    price: 999.99,
                    quantity: 10,
                },
                {
                    id: 2,
                    name: "Mouse",
                    sku: "MOUSE-001",
                    price: 29.99,
                    quantity: 20,
                },
            ];

            productRepository.findAll.mockResolvedValue(products);

            const result = await productService.getAllProducts();

            expect(productRepository.findAll).toHaveBeenCalledWith({});

            expect(result).toEqual(products);
        });

        test("should pass search options to the repository", async () => {
            const products = [
                {
                    id: 1,
                    name: "Gaming Laptop",
                    sku: "LAPTOP-001",
                    price: 1500,
                    quantity: 10,
                },
            ];

            const options = {
                search: "laptop",
            };

            productRepository.findAll.mockResolvedValue(products);

            const result = await productService.getAllProducts(options);

            expect(productRepository.findAll).toHaveBeenCalledWith(
                options
            );

            expect(result).toEqual(products);
        });

        test("should pass category options to the repository", async () => {
            const products = [
                {
                    id: 1,
                    name: "Gaming Laptop",
                    sku: "LAPTOP-001",
                    price: 1500,
                    quantity: 10,
                    category: "Electronics",
                },
            ];

            const options = {
                category: "Electronics",
            };

            productRepository.findAll.mockResolvedValue(products);

            const result = await productService.getAllProducts(options);

            expect(productRepository.findAll).toHaveBeenCalledWith(
                options
            );

            expect(result).toEqual(products);
        });

        test("should pass sorting options to the repository", async () => {
            const products = [
                {
                    id: 2,
                    name: "Expensive Laptop",
                    price: 2000,
                },
                {
                    id: 1,
                    name: "Cheap Laptop",
                    price: 500,
                },
            ];

            const options = {
                sortBy: "price",
                order: "desc",
            };

            productRepository.findAll.mockResolvedValue(products);

            const result = await productService.getAllProducts(options);

            expect(productRepository.findAll).toHaveBeenCalledWith(
                options
            );

            expect(result).toEqual(products);
        });

        test("should pass pagination options to the repository", async () => {
            const products = [
                {
                    id: 1,
                    name: "Laptop",
                    price: 999.99,
                },
            ];

            const options = {
                page: 2,
                limit: 10,
            };

            productRepository.findAll.mockResolvedValue(products);

            const result = await productService.getAllProducts(options);

            expect(productRepository.findAll).toHaveBeenCalledWith(
                options
            );

            expect(result).toEqual(products);
        });

        test("should pass combined query options to the repository", async () => {
            const products = [
                {
                    id: 1,
                    name: "Gaming Laptop",
                    category: "Electronics",
                    price: 1500,
                },
            ];

            const options = {
                search: "laptop",
                category: "Electronics",
                sortBy: "price",
                order: "desc",
                page: 1,
                limit: 10,
            };

            productRepository.findAll.mockResolvedValue(products);

            const result = await productService.getAllProducts(options);

            expect(productRepository.findAll).toHaveBeenCalledWith(
                options
            );

            expect(result).toEqual(products);
        });
    });

    describe("getProductById", () => {
        test("should return a product by ID", async () => {
            const product = {
                id: 1,
                name: "Laptop",
                sku: "LAPTOP-001",
            };

            productRepository.findById.mockResolvedValue(product);

            const result = await productService.getProductById("1");

            expect(productRepository.findById).toHaveBeenCalledWith(1);
            expect(result).toEqual(product);
        });

        test("should throw 404 when the product does not exist", async () => {
            productRepository.findById.mockResolvedValue(null);

            await expect(
                productService.getProductById("999")
            ).rejects.toMatchObject({
                statusCode: 404,
                message: "Product not found",
            });
        });
    });

    describe("getProductBySku", () => {
        test("should return a product by SKU", async () => {
            const product = {
                id: 1,
                name: "Laptop",
                sku: "LAPTOP-001",
            };

            productRepository.findBySku.mockResolvedValue(product);

            const result = await productService.getProductBySku(
                "LAPTOP-001"
            );

            expect(productRepository.findBySku).toHaveBeenCalledWith(
                "LAPTOP-001"
            );

            expect(result).toEqual(product);
        });

        test("should throw 404 when the product does not exist", async () => {
            productRepository.findBySku.mockResolvedValue(null);

            await expect(
                productService.getProductBySku("UNKNOWN")
            ).rejects.toMatchObject({
                statusCode: 404,
                message: "Product not found",
            });
        });
    });

    describe("updateProduct", () => {
        test("should update an existing product", async () => {
            const existingProduct = {
                id: 1,
                name: "Old Laptop",
                sku: "LAPTOP-001",
            };

            const updateData = {
                name: "Updated Laptop",
                price: 1200,
            };

            const updatedProduct = {
                ...existingProduct,
                ...updateData,
            };

            productRepository.findById.mockResolvedValue(existingProduct);
            productRepository.update.mockResolvedValue(updatedProduct);

            const result = await productService.updateProduct(
                "1",
                updateData
            );

            expect(productRepository.findById).toHaveBeenCalledWith(1);

            expect(productRepository.update).toHaveBeenCalledWith(
                1,
                updateData
            );

            expect(result).toEqual(updatedProduct);
        });

        test("should throw 404 when updating a product that does not exist", async () => {
            productRepository.findById.mockResolvedValue(null);

            await expect(
                productService.updateProduct("999", {
                    name: "Updated Laptop",
                })
            ).rejects.toMatchObject({
                statusCode: 404,
                message: "Product not found",
            });
        });

        test("should reject an update that uses another product's SKU", async () => {
            const existingProduct = {
                id: 1,
                name: "Laptop",
                sku: "LAPTOP-001",
            };

            const conflictingProduct = {
                id: 2,
                name: "Another Laptop",
                sku: "LAPTOP-002",
            };

            productRepository.findById.mockResolvedValue(existingProduct);
            productRepository.findBySku.mockResolvedValue(
                conflictingProduct
            );

            await expect(
                productService.updateProduct("1", {
                    sku: "LAPTOP-002",
                })
            ).rejects.toMatchObject({
                statusCode: 409,
                message: "A product with this SKU already exists",
            });

            expect(productRepository.update).not.toHaveBeenCalled();
        });
    });

    describe("deleteProduct", () => {
        test("should delete an existing product", async () => {
            const product = {
                id: 1,
                name: "Laptop",
                sku: "LAPTOP-001",
            };

            productRepository.findById.mockResolvedValue(product);
            productRepository.delete.mockResolvedValue(product);

            const result = await productService.deleteProduct("1");

            expect(productRepository.findById).toHaveBeenCalledWith(1);
            expect(productRepository.delete).toHaveBeenCalledWith(1);

            expect(result).toEqual(product);
        });

        test("should throw 404 when deleting a product that does not exist", async () => {
            productRepository.findById.mockResolvedValue(null);

            await expect(
                productService.deleteProduct("999")
            ).rejects.toMatchObject({
                statusCode: 404,
                message: "Product not found",
            });

            expect(productRepository.delete).not.toHaveBeenCalled();
        });
    });
});