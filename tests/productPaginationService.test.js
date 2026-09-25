const productService = require("../src/services/productService");
const productRepository = require("../src/repositories/productRepository");

jest.mock("../src/repositories/productRepository");

describe("Product Service - Pagination Metadata", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("should return products with pagination metadata", async () => {
        productRepository.findAllPaginated.mockResolvedValue({
            products: [
                {
                    id: 1,
                    name: "Laptop",
                    sku: "LAP-001",
                },
                {
                    id: 2,
                    name: "Keyboard",
                    sku: "KEY-001",
                },
            ],
            total: 25,
        });

        const result = await productService.getPaginatedProducts({
            page: 2,
            limit: 10,
        });

        expect(
            productRepository.findAllPaginated
        ).toHaveBeenCalledWith({
            page: 2,
            limit: 10,
        });

        expect(result.products).toHaveLength(2);

        expect(result.pagination).toEqual({
            page: 2,
            limit: 10,
            total: 25,
            totalPages: 3,
        });
    });

    test("should calculate totalPages correctly", async () => {
        productRepository.findAllPaginated.mockResolvedValue({
            products: [],
            total: 21,
        });

        const result = await productService.getPaginatedProducts({
            page: 3,
            limit: 10,
        });

        expect(result.pagination).toEqual({
            page: 3,
            limit: 10,
            total: 21,
            totalPages: 3,
        });
    });

    test("should handle a total that divides evenly by the limit", async () => {
        productRepository.findAllPaginated.mockResolvedValue({
            products: [],
            total: 20,
        });

        const result = await productService.getPaginatedProducts({
            page: 1,
            limit: 10,
        });

        expect(result.pagination.totalPages).toBe(2);
    });

    test("should pass search, category, and sorting options to the repository", async () => {
        productRepository.findAllPaginated.mockResolvedValue({
            products: [],
            total: 5,
        });

        await productService.getPaginatedProducts({
            search: "laptop",
            category: "Electronics",
            sortBy: "price",
            order: "asc",
            page: 1,
            limit: 10,
        });

        expect(
            productRepository.findAllPaginated
        ).toHaveBeenCalledWith({
            search: "laptop",
            category: "Electronics",
            sortBy: "price",
            order: "asc",
            page: 1,
            limit: 10,
        });
    });
});