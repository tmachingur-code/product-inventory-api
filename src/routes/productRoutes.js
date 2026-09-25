const express = require("express");

const productController = require("../controllers/productController");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const {
    createProductSchema,
    updateProductSchema,
    productIdSchema,
    productQuerySchema,
} = require("../schemas/productSchema");

const router = express.Router();

/**
 * Create a product.
 *
 * Authentication required because this operation
 * changes inventory data.
 */
router.post(
    "/",
    authMiddleware,
    validate(createProductSchema),
    productController.createProduct
);

/**
 * Get products with pagination, search, filtering,
 * and sorting.
 *
 * This remains publicly accessible for now.
 */
router.get(
    "/",
    validate(productQuerySchema, "query"),
    productController.getPaginatedProducts
);

/**
 * Get products that are low in stock.
 */
router.get(
    "/low-stock",
    productController.getLowStockProducts
);

/**
 * Get inventory statistics.
 */
router.get(
    "/stats",
    productController.getInventoryStats
);

/**
 * Find a product by SKU.
 */
router.get(
    "/sku/:sku",
    productController.getProductBySku
);

/**
 * Get a product by ID.
 */
router.get(
    "/:id",
    validate(productIdSchema, "params"),
    productController.getProductById
);

/**
 * Update a product.
 *
 * Authentication required because this operation
 * changes inventory data.
 */
router.put(
    "/:id",
    authMiddleware,
    validate(productIdSchema, "params"),
    validate(updateProductSchema),
    productController.updateProduct
);

/**
 * Delete a product.
 *
 * Authentication required because this operation
 * removes inventory data.
 */
router.delete(
    "/:id",
    authMiddleware,
    validate(productIdSchema, "params"),
    productController.deleteProduct
);

module.exports = router;