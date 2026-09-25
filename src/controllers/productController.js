const productService = require("../services/productService");

/**
 * Product Controller
 *
 * The controller handles HTTP requests and responses.
 * It communicates with the service layer instead of
 * communicating directly with the database.
 */

/**
 * Create a new product.
 *
 * POST /api/products
 */
const createProduct = async (req, res, next) => {
    try {
        const product = await productService.createProduct(req.body);

        res.status(201).json({
            success: true,
            data: product,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Retrieve all products.
 *
 * GET /api/products
 *
 * This method is kept for backward compatibility.
 * The main route will use getPaginatedProducts()
 * so that pagination metadata is returned.
 */
const getAllProducts = async (req, res, next) => {
    try {
        const products = await productService.getAllProducts(
            req.query
        );

        res.status(200).json({
            success: true,
            data: products,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Retrieve paginated products with metadata.
 *
 * GET /api/products
 *
 * Supported query parameters:
 * - search
 * - category
 * - sortBy
 * - order
 * - page
 * - limit
 */
const getPaginatedProducts = async (req, res, next) => {
    try {
        // Pass validated query parameters to the service.
        const result = await productService.getPaginatedProducts(
            req.query
        );

        res.status(200).json({
            success: true,
            data: result.products,
            pagination: result.pagination,
        });
    } catch (error) {
        next(error);
    }
};

const getLowStockProducts = async (req, res, next) => {
    try {
        const products =
            await productService.getLowStockProducts();

        res.status(200).json({
            success: true,
            data: products,
        });
    } catch (error) {
        next(error);
    }
};

const getInventoryStats = async (req, res, next) => {
    try {
        const stats = await productService.getInventoryStats();

        res.status(200).json({
            success: true,
            data: stats,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Retrieve a product by its ID.
 *
 * GET /api/products/:id
 */
const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const product = await productService.getProductById(id);

        res.status(200).json({
            success: true,
            data: product,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Retrieve a product by its SKU.
 *
 * GET /api/products/sku/:sku
 */
const getProductBySku = async (req, res, next) => {
    try {
        const { sku } = req.params;

        const product = await productService.getProductBySku(sku);

        res.status(200).json({
            success: true,
            data: product,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update a product by its ID.
 *
 * PUT /api/products/:id
 */
const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        const product = await productService.updateProduct(
            id,
            req.body
        );

        res.status(200).json({
            success: true,
            data: product,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a product by its ID.
 *
 * DELETE /api/products/:id
 */
const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        const product = await productService.deleteProduct(id);

        res.status(200).json({
            success: true,
            data: product,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    getPaginatedProducts,
    getLowStockProducts,
    getInventoryStats,
    getProductById,
    getProductBySku,
    updateProduct,
    deleteProduct,
};