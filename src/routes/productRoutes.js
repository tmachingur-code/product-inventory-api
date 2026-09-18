const express = require("express");

const productController = require("../controllers/productController");

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
router.post("/", productController.createProduct);

/**
 * Retrieve all products.
 *
 * GET /api/products
 */
router.get("/", productController.getAllProducts);

/**
 * Retrieve a product by SKU.
 *
 * GET /api/products/sku/:sku
 *
 * This route must come before /:id so that
 * "sku" is not interpreted as a product ID.
 */
router.get("/sku/:sku", productController.getProductBySku);

/**
 * Retrieve a product by ID.
 *
 * GET /api/products/:id
 */
router.get("/:id", productController.getProductById);

/**
 * Update a product.
 *
 * PUT /api/products/:id
 */
router.put("/:id", productController.updateProduct);

/**
 * Delete a product.
 *
 * DELETE /api/products/:id
 */
router.delete("/:id", productController.deleteProduct);

module.exports = router;