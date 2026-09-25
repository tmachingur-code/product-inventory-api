const express = require("express");

const productController = require("../controllers/productController");
const validate = require("../middleware/validate");

const {
    createProductSchema,
    updateProductSchema,
    productIdSchema,
    productQuerySchema,
} = require("../schemas/productSchema");

/**
 * Product Routes
 *
 * Defines the HTTP endpoints for products.
 * The routes delegate request handling to the
 * product controller.
 */
const router = express.Router();

/**
 * Create a product.
 *
 * POST /api/products
 */
router.post(
    "/",
    validate(createProductSchema),
    productController.createProduct
);

/**
 * Retrieve paginated products.
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
 *
 * The query is validated before reaching the controller.
 */
router.get(
    "/",
    validate(productQuerySchema, "query"),
    productController.getPaginatedProducts
);

router.get(
    "/low-stock",
    productController.getLowStockProducts
);

router.get(
    "/stats",
    productController.getInventoryStats
);

router.get(
    "/sku/:sku",
    productController.getProductBySku
);

router.get(
    "/:id",
    validate(productIdSchema, "params"),
    productController.getProductById
);

/**
 * Update a product.
 *
 * PUT /api/products/:id
 */
router.put(
    "/:id",
    validate(productIdSchema, "params"),
    validate(updateProductSchema),
    productController.updateProduct
);

/**
 * Delete a product.
 *
 * DELETE /api/products/:id
 */
router.delete(
    "/:id",
    validate(productIdSchema, "params"),
    productController.deleteProduct
);

module.exports = router;