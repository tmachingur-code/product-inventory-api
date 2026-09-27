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
        const product =
            await productService.createProduct(req.body);

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
 */
const getAllProducts = async (req, res, next) => {
    try {
        const products =
            await productService.getAllProducts(req.query);

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
 */
const getPaginatedProducts = async (req, res, next) => {
    try {
        const result =
            await productService.getPaginatedProducts(
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

/**
 * Retrieve low-stock products.
 */
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

/**
 * Retrieve inventory statistics.
 */
const getInventoryStats = async (req, res, next) => {
    try {
        const stats =
            await productService.getInventoryStats();

        res.status(200).json({
            success: true,
            data: stats,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Adjust product stock.
 *
 * POST /api/products/:id/stock
 */
const adjustStock = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { quantityDelta } = req.body;

        const product =
            await productService.adjustStock(
                id,
                quantityDelta
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
 * Retrieve a product by its ID.
 */
const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const product =
            await productService.getProductById(id);

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
 */
const getProductBySku = async (req, res, next) => {
    try {
        const { sku } = req.params;

        const product =
            await productService.getProductBySku(sku);

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
 */
const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        const product =
            await productService.updateProduct(
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
 */
const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        const product =
            await productService.deleteProduct(id);

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
    adjustStock,
    getProductById,
    getProductBySku,
    updateProduct,
    deleteProduct,
};