const productController = require("../src/controllers/productController");
const productService = require("../src/services/productService");

jest.mock("../src/services/productService");

describe("Product Controller - Pagination Metadata", () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
        req = {
            query: {},
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        next = jest.fn();

        jest.clearAllMocks();
    });

    test("should return paginated products with metadata", async () => {
        req.query = {
            page: 2,
            limit: 10,
        };

        productService.getPaginatedProducts.mockResolvedValue({
            products: [
                {
                    id: 1,
                    name: "Laptop",
                    sku: "LAP-001",
                },
            ],
            pagination: {
                page: 2,
                limit: 10,
                total: 25,
                totalPages: 3,
            },
        });

        await productController.getPaginatedProducts(
            req,
            res,
            next
        );

        expect(
            productService.getPaginatedProducts
        ).toHaveBeenCalledWith({
            page: 2,
            limit: 10,
        });

        expect(res.status).toHaveBeenCalledWith(200);

        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: [
                {
                    id: 1,
                    name: "Laptop",
                    sku: "LAP-001",
                },
            ],
            pagination: {
                page: 2,
                limit: 10,
                total: 25,
                totalPages: 3,
            },
        });
    });

    test("should pass search, category, sorting, and pagination to the service", async () => {
        req.query = {
            search: "laptop",
            category: "Electronics",
            sortBy: "price",
            order: "asc",
            page: 1,
            limit: 10,
        };

        productService.getPaginatedProducts.mockResolvedValue({
            products: [],
            pagination: {
                page: 1,
                limit: 10,
                total: 0,
                totalPages: 0,
            },
        });

        await productController.getPaginatedProducts(
            req,
            res,
            next
        );

        expect(
            productService.getPaginatedProducts
        ).toHaveBeenCalledWith({
            search: "laptop",
            category: "Electronics",
            sortBy: "price",
            order: "asc",
            page: 1,
            limit: 10,
        });

        expect(res.status).toHaveBeenCalledWith(200);
    });

    test("should pass service errors to next", async () => {
        const error = new Error("Database error");

        productService.getPaginatedProducts.mockRejectedValue(
            error
        );

        await productController.getPaginatedProducts(
            req,
            res,
            next
        );

        expect(next).toHaveBeenCalledWith(error);
    });
});