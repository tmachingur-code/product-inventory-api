const prisma = require("../config/prisma");

/**
 * Product Repository
 *
 * The repository is responsible only for
 * communicating with the database through Prisma.
 */
const productRepository = {
    /**
     * Create a new product.
     */
    async create(productData) {
        return prisma.product.create({
            data: productData,
        });
    },

    /**
     * Retrieve products.
     *
     * Supports:
     * - Search by product name
     * - Filter by category
     * - Sorting
     * - Pagination
     */
    async findAll(options = {}) {
        const {
            search,
            category,
            sortBy = "createdAt",
            order = "desc",
            page = 1,
            limit,
        } = options;

        // Build the database filtering conditions.
        const where = {};

        /**
         * Search product names.
         */
        if (search) {
            where.name = {
                contains: search,
                mode: "insensitive",
            };
        }

        /**
         * Filter products by category.
         */
        if (category) {
            where.category = {
                equals: category,
                mode: "insensitive",
            };
        }

        /**
         * Only allow known sortable fields.
         */
        const allowedSortFields = [
            "name",
            "price",
            "quantity",
            "createdAt",
            "updatedAt",
        ];

        const safeSortBy = allowedSortFields.includes(sortBy)
            ? sortBy
            : "createdAt";

        /**
         * Only allow ascending or descending order.
         */
        const safeOrder = order === "asc" ? "asc" : "desc";

        const queryOptions = {
            where,
            orderBy: {
                [safeSortBy]: safeOrder,
            },
        };

        /**
         * Apply pagination only when a limit is provided.
         */
        if (limit !== undefined) {
            const safePage = Math.max(Number(page) || 1, 1);
            const safeLimit = Math.max(Number(limit) || 1, 1);

            queryOptions.skip = (safePage - 1) * safeLimit;
            queryOptions.take = safeLimit;
        }

        return prisma.product.findMany(queryOptions);
    },

    /**
     * Retrieve products with pagination metadata.
     *
     * Returns:
     * - products: products on the requested page
     * - total: total number of matching products
     */
    async findAllPaginated(options = {}) {
        const {
            search,
            category,
            sortBy = "createdAt",
            order = "desc",
            page = 1,
            limit = 10,
        } = options;

        // Build the database filtering conditions.
        const where = {};

        /**
         * Search product names.
         */
        if (search) {
            where.name = {
                contains: search,
                mode: "insensitive",
            };
        }

        /**
         * Filter products by category.
         */
        if (category) {
            where.category = {
                equals: category,
                mode: "insensitive",
            };
        }

        /**
         * Only allow known sortable fields.
         */
        const allowedSortFields = [
            "name",
            "price",
            "quantity",
            "createdAt",
            "updatedAt",
        ];

        const safeSortBy = allowedSortFields.includes(sortBy)
            ? sortBy
            : "createdAt";

        /**
         * Only allow ascending or descending order.
         */
        const safeOrder = order === "asc" ? "asc" : "desc";

        /**
         * Convert pagination values to safe numbers.
         */
        const safePage = Math.max(Number(page) || 1, 1);
        const safeLimit = Math.max(Number(limit) || 1, 1);

        const skip = (safePage - 1) * safeLimit;

        /**
         * Run both database queries.
         *
         * findMany() retrieves the products for the
         * requested page.
         *
         * count() retrieves the total number of
         * products matching the filters.
         */
        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                orderBy: {
                    [safeSortBy]: safeOrder,
                },
                skip,
                take: safeLimit,
            }),

            prisma.product.count({
                where,
            }),
        ]);

        return {
            products,
            total,
        };
    },

    /**
     * Retrieve products that are low in stock.
     *
     * A product is considered low stock when its
     * quantity is less than or equal to its
     * configured low-stock threshold.
     *
     * Example:
     *
     * quantity = 3
     * lowStockThreshold = 5
     *
     * 3 <= 5 → low stock
     */
    async findLowStock() {
        return prisma.$queryRaw`
            SELECT *
            FROM "Product"
            WHERE quantity <= "lowStockThreshold"
            ORDER BY quantity ASC
        `;
    },

        /**
     * Retrieve inventory statistics.
     *
     * Calculates:
     * - Total number of products
     * - Total quantity of products in stock
     * - Number of low-stock products
     * - Total inventory value
     *
     * PostgreSQL performs the price × quantity
     * calculation directly in the database.
     */
    async getInventoryStats() {
        const result = await prisma.$queryRaw`
            SELECT
                COUNT(*)::int AS "totalProducts",
                COALESCE(SUM(quantity), 0)::int AS "totalQuantity",
                COUNT(
                    CASE
                        WHEN quantity <= "lowStockThreshold"
                        THEN 1
                    END
                )::int AS "lowStockCount",
                COALESCE(
                    SUM(price * quantity),
                    0
                )::numeric AS "inventoryValue"
            FROM "Product"
        `;

        return {
            totalProducts: result[0].totalProducts,
            totalQuantity: result[0].totalQuantity,
            lowStockCount: result[0].lowStockCount,
            inventoryValue: Number(result[0].inventoryValue),
        };
    },

    /**
     * Find a product by its ID.
     */
    async findById(id) {
        return prisma.product.findUnique({
            where: {
                id: id,
            },
        });
    },

    /**
     * Find a product by its SKU.
     */
    async findBySku(sku) {
        return prisma.product.findUnique({
            where: {
                sku: sku,
            },
        });
    },

    /**
     * Update a product by its ID.
     */
    async update(id, productData) {
        return prisma.product.update({
            where: {
                id: id,
            },
            data: productData,
        });
    },

    /**
     * Delete a product by its ID.
     */
    async delete(id) {
        return prisma.product.delete({
            where: {
                id: id,
            },
        });
    },
};

module.exports = productRepository;