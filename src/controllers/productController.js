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
        // Pass the request body to the service layer.
        const product = await productService.createProduct(req.body);

        // Return the newly created product.
        res.status(201).json({
            success: true,
            data: product,
        });
    } catch (error) {
        // Pass errors to the centralized error handler.
        next(error);
    }
};

/**
 * Retrieve all products.
 *
 * GET /api/products
 */
const getAllProducts = async (req, res, next) => {
    try {
        // Ask the service layer for all products.
        const products = await productService.getAllProducts();

        // Return the products.
        res.status(200).json({
            success: true,
            data: products,
        });
    } catch (error) {
        // Pass errors to the centralized error handler.
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
        // Get the product ID from the route parameter.
        const { id } = req.params;

        // Pass the ID to the service layer.
        const product = await productService.getProductById(id);

        // Return the requested product.
        res.status(200).json({
            success: true,
            data: product,
        });
    } catch (error) {
        // Pass errors to the centralized error handler.
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
        // Get the SKU from the route parameter.
        const { sku } = req.params;

        // Pass the SKU to the service layer.
        const product = await productService.getProductBySku(sku);

        // Return the requested product.
        res.status(200).json({
            success: true,
            data: product,
        });
    } catch (error) {
        // Pass errors to the centralized error handler.
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
        // Get the product ID from the route parameter.
        const { id } = req.params;

        // Pass the ID and updated data to the service layer.
        const product = await productService.updateProduct(
            id,
            req.body
        );

        // Return the updated product.
        res.status(200).json({
            success: true,
            data: product,
        });
    } catch (error) {
        // Pass errors to the centralized error handler.
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
        // Get the product ID from the route parameter.
        const { id } = req.params;

        // Ask the service layer to delete the product.
        const product = await productService.deleteProduct(id);

        // Return the deleted product.
        res.status(200).json({
            success: true,
            data: product,
        });
    } catch (error) {
        // Pass errors to the centralized error handler.
        next(error);
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    getProductBySku,
    updateProduct,
    deleteProduct,
};