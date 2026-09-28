const productService = require("../src/services/productService");
const productRepository = require("../src/repositories/productRepository");

jest.mock("../src/repositories/productRepository");

describe("Product Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("createProduct", () => {
        test("should create a product when SKU does not already exist", async () => {
            const productData = {
                name: "Laptop",
                description: "Business laptop",
                sku: "LAP-001",
                price: 1200,
                quantity: 10,
                category: "Electronics",
                lowStockThreshold: 5,
            };

            productRepository.findBySku.mockResolvedValue(null);

            productRepository.create.mockResolvedValue({
                id: 1,
                ...productData,
            });

            const result =
                await productService.createProduct(
                    productData
                );

            expect(
                productRepository.findBySku
            ).toHaveBeenCalledWith("LAP-001");

            expect(
                productRepository.create
            ).toHaveBeenCalledWith(productData);

            expect(result).toEqual({
                id: 1,
                ...productData,
            });
        });

        test("should throw 409 when SKU already exists", async () => {
            productRepository.findBySku.mockResolvedValue({
                id: 1,
                sku: "LAP-001",
            });

            await expect(
                productService.createProduct({
                    name: "Laptop",
                    sku: "LAP-001",
                })
            ).rejects.toMatchObject({
                statusCode: 409,
                message:
                    "A product with this SKU already exists",
            });

            expect(
                productRepository.create
            ).not.toHaveBeenCalled();
        });
    });

    describe("getAllProducts", () => {
        test("should return all products", async () => {
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

            productRepository.findAll.mockResolvedValue(
                products
            );

            const result =
                await productService.getAllProducts();

            expect(
                productRepository.findAll
            ).toHaveBeenCalledWith({});

            expect(result).toEqual(products);
        });

        test("should pass options to the repository", async () => {
            const options = {
                search: "laptop",
                category: "Electronics",
                sortBy: "price",
                order: "asc",
                page: 2,
                limit: 5,
            };

            productRepository.findAll.mockResolvedValue(
                []
            );

            await productService.getAllProducts(options);

            expect(
                productRepository.findAll
            ).toHaveBeenCalledWith(options);
        });
    });

    describe("getPaginatedProducts", () => {
        test("should return products with pagination metadata", async () => {
            const result = {
                products: [
                    {
                        id: 1,
                        name: "Laptop",
                    },
                ],
                total: 15,
            };

            productRepository.findAllPaginated.mockResolvedValue(
                result
            );

            const response =
                await productService.getPaginatedProducts({
                    page: 2,
                    limit: 10,
                });

            expect(
                productRepository.findAllPaginated
            ).toHaveBeenCalledWith({
                page: 2,
                limit: 10,
            });

            expect(response).toEqual({
                products: result.products,
                pagination: {
                    page: 2,
                    limit: 10,
                    total: 15,
                    totalPages: 2,
                },
            });
        });

        test("should use default pagination values when no options are provided", async () => {
            const result = {
                products: [
                    {
                        id: 1,
                        name: "Laptop",
                    },
                ],
                total: 15,
            };

            productRepository.findAllPaginated.mockResolvedValue(
                result
            );

            const response =
                await productService.getPaginatedProducts();

            expect(
                productRepository.findAllPaginated
            ).toHaveBeenCalledWith({});

            expect(response).toEqual({
                products: result.products,
                pagination: {
                    page: 1,
                    limit: 10,
                    total: 15,
                    totalPages: 2,
                },
            });
        });

        test("should calculate totalPages correctly", async () => {
            productRepository.findAllPaginated.mockResolvedValue(
                {
                    products: [],
                    total: 21,
                }
            );

            const response =
                await productService.getPaginatedProducts({
                    page: 1,
                    limit: 10,
                });

            expect(
                response.pagination.totalPages
            ).toBe(3);
        });

        test("should pass search, category, sorting, and pagination options", async () => {
            const options = {
                search: "laptop",
                category: "Electronics",
                sortBy: "price",
                order: "asc",
                page: 2,
                limit: 5,
            };

            productRepository.findAllPaginated.mockResolvedValue(
                {
                    products: [],
                    total: 0,
                }
            );

            await productService.getPaginatedProducts(
                options
            );

            expect(
                productRepository.findAllPaginated
            ).toHaveBeenCalledWith(options);
        });
    });

    describe("getLowStockProducts", () => {
        test("should return low-stock products", async () => {
            const products = [
                {
                    id: 1,
                    name: "Keyboard",
                    quantity: 2,
                    lowStockThreshold: 5,
                },
            ];

            productRepository.findLowStock.mockResolvedValue(
                products
            );

            const result =
                await productService.getLowStockProducts();

            expect(
                productRepository.findLowStock
            ).toHaveBeenCalled();

            expect(result).toEqual(products);
        });
    });

    describe("getInventoryStats", () => {
        test("should return inventory statistics", async () => {
            const stats = {
                totalProducts: 10,
                totalQuantity: 100,
                lowStockCount: 3,
                inventoryValue: 25000,
            };

            productRepository.getInventoryStats.mockResolvedValue(
                stats
            );

            const result =
                await productService.getInventoryStats();

            expect(
                productRepository.getInventoryStats
            ).toHaveBeenCalled();

            expect(result).toEqual(stats);
        });
    });

    describe("adjustStock", () => {
        test("should increase stock when quantityDelta is positive", async () => {
            const product = {
                id: 1,
                name: "Laptop",
                quantity: 10,
            };

            const updatedProduct = {
                ...product,
                quantity: 15,
            };

            productRepository.findById.mockResolvedValue(
                product
            );

            productRepository.adjustStock.mockResolvedValue(
                updatedProduct
            );

            const result =
                await productService.adjustStock(1, 5);

            expect(
                productRepository.findById
            ).toHaveBeenCalledWith(1);

            expect(
                productRepository.adjustStock
            ).toHaveBeenCalledWith(1, 5);

            expect(result).toEqual(updatedProduct);
        });

        test("should decrease stock when enough stock is available", async () => {
            const product = {
                id: 1,
                name: "Laptop",
                quantity: 10,
            };

            const updatedProduct = {
                ...product,
                quantity: 7,
            };

            productRepository.findById.mockResolvedValue(
                product
            );

            productRepository.adjustStock.mockResolvedValue(
                updatedProduct
            );

            const result =
                await productService.adjustStock(1, -3);

            expect(result).toEqual(updatedProduct);

            expect(
                productRepository.adjustStock
            ).toHaveBeenCalledWith(1, -3);
        });

        test("should throw 400 when quantityDelta is zero", async () => {
            await expect(
                productService.adjustStock(1, 0)
            ).rejects.toMatchObject({
                statusCode: 400,
                message:
                    "Stock adjustment cannot be zero",
            });

            expect(
                productRepository.findById
            ).not.toHaveBeenCalled();
        });

        test("should throw 404 when product does not exist", async () => {
            productRepository.findById.mockResolvedValue(
                null
            );

            await expect(
                productService.adjustStock(1, 5)
            ).rejects.toMatchObject({
                statusCode: 404,
                message: "Product not found",
            });

            expect(
                productRepository.adjustStock
            ).not.toHaveBeenCalled();
        });

        test("should throw 400 when there is insufficient stock", async () => {
            productRepository.findById.mockResolvedValue({
                id: 1,
                quantity: 2,
            });

            await expect(
                productService.adjustStock(1, -5)
            ).rejects.toMatchObject({
                statusCode: 400,
                message: "Insufficient stock",
            });

            expect(
                productRepository.adjustStock
            ).not.toHaveBeenCalled();
        });

        test("should throw 400 when the repository update fails because of insufficient stock", async () => {
            productRepository.findById.mockResolvedValue({
                id: 1,
                quantity: 10,
            });

            productRepository.adjustStock.mockResolvedValue(
                null
            );

            await expect(
                productService.adjustStock(1, -5)
            ).rejects.toMatchObject({
                statusCode: 400,
                message: "Insufficient stock",
            });
        });
    });

    describe("getProductById", () => {
        test("should return a product by ID", async () => {
            const product = {
                id: 1,
                name: "Laptop",
            };

            productRepository.findById.mockResolvedValue(
                product
            );

            const result =
                await productService.getProductById(1);

            expect(
                productRepository.findById
            ).toHaveBeenCalledWith(1);

            expect(result).toEqual(product);
        });

        test("should throw 404 when product does not exist", async () => {
            productRepository.findById.mockResolvedValue(
                null
            );

            await expect(
                productService.getProductById(1)
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
                sku: "LAP-001",
                name: "Laptop",
            };

            productRepository.findBySku.mockResolvedValue(
                product
            );

            const result =
                await productService.getProductBySku(
                    "LAP-001"
                );

            expect(
                productRepository.findBySku
            ).toHaveBeenCalledWith("LAP-001");

            expect(result).toEqual(product);
        });

        test("should throw 404 when SKU does not exist", async () => {
            productRepository.findBySku.mockResolvedValue(
                null
            );

            await expect(
                productService.getProductBySku(
                    "UNKNOWN"
                )
            ).rejects.toMatchObject({
                statusCode: 404,
                message: "Product not found",
            });
        });
    });

    describe("updateProduct", () => {
        test("should update a product", async () => {
            const existingProduct = {
                id: 1,
                name: "Laptop",
                sku: "LAP-001",
            };

            const updateData = {
                name: "Gaming Laptop",
            };

            const updatedProduct = {
                ...existingProduct,
                ...updateData,
            };

            productRepository.findById.mockResolvedValue(
                existingProduct
            );

            productRepository.update.mockResolvedValue(
                updatedProduct
            );

            const result =
                await productService.updateProduct(
                    1,
                    updateData
                );

            expect(
                productRepository.update
            ).toHaveBeenCalledWith(
                1,
                updateData
            );

            expect(result).toEqual(updatedProduct);
        });

        test("should update SKU when the new SKU is not already used", async () => {
            const existingProduct = {
                id: 1,
                name: "Laptop",
                sku: "LAP-001",
            };

            const updateData = {
                sku: "LAP-002",
            };

            productRepository.findById.mockResolvedValue(
                existingProduct
            );

            productRepository.findBySku.mockResolvedValue(
                null
            );

            productRepository.update.mockResolvedValue({
                ...existingProduct,
                ...updateData,
            });

            await productService.updateProduct(
                1,
                updateData
            );

            expect(
                productRepository.findBySku
            ).toHaveBeenCalledWith("LAP-002");

            expect(
                productRepository.update
            ).toHaveBeenCalledWith(
                1,
                updateData
            );
        });

        test("should throw 404 when updating a missing product", async () => {
            productRepository.findById.mockResolvedValue(
                null
            );

            await expect(
                productService.updateProduct(1, {
                    name: "Updated",
                })
            ).rejects.toMatchObject({
                statusCode: 404,
                message: "Product not found",
            });

            expect(
                productRepository.update
            ).not.toHaveBeenCalled();
        });

        test("should throw 409 when new SKU belongs to another product", async () => {
            productRepository.findById.mockResolvedValue({
                id: 1,
                sku: "LAP-001",
            });

            productRepository.findBySku.mockResolvedValue({
                id: 2,
                sku: "LAP-002",
            });

            await expect(
                productService.updateProduct(1, {
                    sku: "LAP-002",
                })
            ).rejects.toMatchObject({
                statusCode: 409,
                message:
                    "A product with this SKU already exists",
            });

            expect(
                productRepository.update
            ).not.toHaveBeenCalled();
        });
    });

    describe("deleteProduct", () => {
        test("should delete an existing product", async () => {
            const product = {
                id: 1,
                name: "Laptop",
            };

            productRepository.findById.mockResolvedValue(
                product
            );

            productRepository.delete.mockResolvedValue(
                product
            );

            const result =
                await productService.deleteProduct(1);

            expect(
                productRepository.findById
            ).toHaveBeenCalledWith(1);

            expect(
                productRepository.delete
            ).toHaveBeenCalledWith(1);

            expect(result).toEqual(product);
        });

        test("should throw 404 when deleting a missing product", async () => {
            productRepository.findById.mockResolvedValue(
                null
            );

            await expect(
                productService.deleteProduct(1)
            ).rejects.toMatchObject({
                statusCode: 404,
                message: "Product not found",
            });

            expect(
                productRepository.delete
            ).not.toHaveBeenCalled();
        });
    });
});