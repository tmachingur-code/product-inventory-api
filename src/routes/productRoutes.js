const express = require("express");

const productController = require("../controllers/productController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");

const {
    createProductSchema,
    updateProductSchema,
    productIdSchema,
    productQuerySchema,
} = require("../schemas/productSchema");

const router = express.Router();

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a product
 *     description: Creates a new product. Requires authentication and STAFF or ADMIN role.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - sku
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 example: Laptop
 *               description:
 *                 type: string
 *                 example: Business laptop
 *               sku:
 *                 type: string
 *                 example: LAP-001
 *               price:
 *                 type: number
 *                 format: double
 *                 minimum: 0
 *                 example: 999.99
 *               quantity:
 *                 type: integer
 *                 minimum: 0
 *                 example: 10
 *               category:
 *                 type: string
 *                 example: Electronics
 *               lowStockThreshold:
 *                 type: integer
 *                 minimum: 0
 *                 example: 5
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication token is required or invalid
 *       403:
 *         description: Access forbidden
 *       409:
 *         description: A product with this SKU already exists
 */
router.post(
    "/",
    authMiddleware,
    roleMiddleware("STAFF", "ADMIN"),
    validate(createProductSchema),
    productController.createProduct
);

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get products
 *     description: Returns products with optional search, filtering, sorting, and pagination.
 *     tags:
 *       - Products
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search products by name or SKU.
 *         example: laptop
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter products by category.
 *         example: Electronics
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum:
 *             - name
 *             - price
 *             - quantity
 *             - createdAt
 *             - updatedAt
 *         description: Field used to sort products.
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum:
 *             - asc
 *             - desc
 *         description: Sort order.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of products per page.
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *       400:
 *         description: Invalid query parameters
 */
router.get(
    "/",
    validate(productQuerySchema, "query"),
    productController.getPaginatedProducts
);

/**
 * @swagger
 * /api/products/low-stock:
 *   get:
 *     summary: Get low-stock products
 *     description: Returns products whose quantity is at or below their low-stock threshold.
 *     tags:
 *       - Products
 *     responses:
 *       200:
 *         description: Low-stock products retrieved successfully
 */
router.get(
    "/low-stock",
    productController.getLowStockProducts
);

/**
 * @swagger
 * /api/products/stats:
 *   get:
 *     summary: Get inventory statistics
 *     description: Returns overall inventory statistics.
 *     tags:
 *       - Products
 *     responses:
 *       200:
 *         description: Inventory statistics retrieved successfully
 */
router.get(
    "/stats",
    productController.getInventoryStats
);

/**
 * @swagger
 * /api/products/sku/{sku}:
 *   get:
 *     summary: Get a product by SKU
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: sku
 *         required: true
 *         schema:
 *           type: string
 *         example: LAP-001
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *       404:
 *         description: Product not found
 */
router.get(
    "/sku/:sku",
    productController.getProductBySku
);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 1
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *       400:
 *         description: Invalid product ID
 *       404:
 *         description: Product not found
 */
router.get(
    "/:id",
    validate(productIdSchema, "params"),
    productController.getProductById
);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product
 *     description: Updates an existing product. Requires authentication and STAFF or ADMIN role.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Updated Laptop
 *               description:
 *                 type: string
 *                 example: Updated business laptop
 *               sku:
 *                 type: string
 *                 example: LAP-001
 *               price:
 *                 type: number
 *                 format: double
 *                 minimum: 0
 *                 example: 1099.99
 *               quantity:
 *                 type: integer
 *                 minimum: 0
 *                 example: 15
 *               category:
 *                 type: string
 *                 example: Electronics
 *               lowStockThreshold:
 *                 type: integer
 *                 minimum: 0
 *                 example: 5
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication token is required or invalid
 *       403:
 *         description: Access forbidden
 *       404:
 *         description: Product not found
 *       409:
 *         description: A product with this SKU already exists
 */
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("STAFF", "ADMIN"),
    validate(productIdSchema, "params"),
    validate(updateProductSchema),
    productController.updateProduct
);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     description: Deletes an existing product. Requires authentication and ADMIN role.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 1
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       400:
 *         description: Invalid product ID
 *       401:
 *         description: Authentication token is required or invalid
 *       403:
 *         description: Access forbidden
 *       404:
 *         description: Product not found
 */
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN"),
    validate(productIdSchema, "params"),
    productController.deleteProduct
);

module.exports = router;