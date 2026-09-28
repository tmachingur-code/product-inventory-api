const prisma = require("../config/prisma");

const productRepository = {
    async create(productData) {
        return prisma.product.create({
            data: productData,
        });
    },

    async findAll(options = {}) {
        const {
            search,
            category,
            sortBy = "createdAt",
            order = "desc",
            page = 1,
            limit,
        } = options;

        const where = {};

        if (search) {
            where.name = {
                contains: search,
                mode: "insensitive",
            };
        }

        if (category) {
            where.category = {
                equals: category,
                mode: "insensitive",
            };
        }

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

        const safeOrder = order === "asc" ? "asc" : "desc";

        const queryOptions = {
            where,
            orderBy: {
                [safeSortBy]: safeOrder,
            },
        };

        if (limit !== undefined) {
            const safePage = Math.max(Number(page) || 1, 1);
            const safeLimit = Math.max(Number(limit) || 1, 1);

            queryOptions.skip = (safePage - 1) * safeLimit;
            queryOptions.take = safeLimit;
        }

        return prisma.product.findMany(queryOptions);
    },

    async findAllPaginated(options = {}) {
        const {
            search,
            category,
            sortBy = "createdAt",
            order = "desc",
            page = 1,
            limit = 10,
        } = options;

        const where = {};

        if (search) {
            where.name = {
                contains: search,
                mode: "insensitive",
            };
        }

        if (category) {
            where.category = {
                equals: category,
                mode: "insensitive",
            };
        }

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

        const safeOrder = order === "asc" ? "asc" : "desc";

        const safePage = Math.max(Number(page) || 1, 1);
        const safeLimit = Math.max(Number(limit) || 1, 1);

        const skip = (safePage - 1) * safeLimit;

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

    async findLowStock() {
        return prisma.$queryRaw`
            SELECT *
            FROM "Product"
            WHERE quantity <= "lowStockThreshold"
            ORDER BY quantity ASC
        `;
    },

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

    async adjustStock(id, quantityDelta) {
        if (quantityDelta > 0) {
            await prisma.product.updateMany({
                where: {
                    id,
                },
                data: {
                    quantity: {
                        increment: quantityDelta,
                    },
                },
            });
        } else {
            const amountToRemove = Math.abs(quantityDelta);

            const result = await prisma.product.updateMany({
                where: {
                    id,
                    quantity: {
                        gte: amountToRemove,
                    },
                },
                data: {
                    quantity: {
                        decrement: amountToRemove,
                    },
                },
            });

            if (result.count === 0) {
                return null;
            }
        }

        return prisma.product.findUnique({
            where: {
                id,
            },
        });
    },

    async findById(id) {
        return prisma.product.findUnique({
            where: {
                id,
            },
        });
    },

    async findBySku(sku) {
        return prisma.product.findUnique({
            where: {
                sku,
            },
        });
    },

    async update(id, productData) {
        return prisma.product.update({
            where: {
                id,
            },
            data: productData,
        });
    },

    async delete(id) {
    return prisma.product.delete({
        where: {
            id,
        },
    });
},
};

module.exports = productRepository;