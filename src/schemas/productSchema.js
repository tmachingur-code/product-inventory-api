const { z } = require("zod");

/**
 * Shared fields used by product validation.
 *
 * These rules define what valid product data
 * should look like before it reaches the controller.
 */
const productFields = {
    name: z.string().trim().min(1, "Name is required"),

    sku: z.string().trim().min(1, "SKU is required"),

    price: z.number().positive("Price must be greater than 0"),

    quantity: z
        .number()
        .int("Quantity must be an integer")
        .nonnegative("Quantity cannot be negative"),

    category: z.string().trim().optional(),

    description: z.string().trim().optional(),

    lowStockThreshold: z
        .number()
        .int("Low stock threshold must be an integer")
        .nonnegative("Low stock threshold cannot be negative"),
};

/**
 * Schema for creating a product.
 */
const createProductSchema = z.object({
    name: productFields.name,
    sku: productFields.sku,
    price: productFields.price,
    description: productFields.description.optional(),
    quantity: productFields.quantity.optional(),
    category: productFields.category,
    lowStockThreshold: productFields.lowStockThreshold.optional(),
});

/**
 * Schema for updating a product.
 *
 * At least one field must be provided.
 */
const updateProductSchema = z
    .object({
        name: productFields.name.optional(),
        sku: productFields.sku.optional(),
        price: productFields.price.optional(),
        description: productFields.description.optional(),
        quantity: productFields.quantity.optional(),
        category: productFields.category,
        lowStockThreshold: productFields.lowStockThreshold.optional(),
    })
    .refine(
        (data) => Object.keys(data).length > 0,
        {
            message:
                "At least one field must be provided for an update",
        }
    );

/**
 * Schema for product route parameters.
 *
 * Express provides route parameters as strings,
 * so z.coerce.number() converts the ID to a number
 * before validating it.
 */
const productIdSchema = z.object({
    id: z.coerce.number().int().positive(),
});

/**
 * Schema for GET /api/products query parameters.
 */
const productQuerySchema = z.object({
    search: z
        .string()
        .trim()
        .min(1, "Search cannot be empty")
        .optional(),

    category: z
        .string()
        .trim()
        .min(1, "Category cannot be empty")
        .optional(),

    sortBy: z
        .enum([
            "name",
            "price",
            "quantity",
            "createdAt",
            "updatedAt",
        ])
        .optional(),

    order: z
        .enum(["asc", "desc"])
        .optional(),

    page: z.coerce
        .number()
        .int("Page must be an integer")
        .min(1, "Page must be at least 1")
        .optional(),

    limit: z.coerce
        .number()
        .int("Limit must be an integer")
        .min(1, "Limit must be at least 1")
        .max(100, "Limit cannot exceed 100")
        .optional(),
});

/**
 * Schema for adjusting product stock.
 *
 * Positive value:
 *     Adds stock.
 *
 * Negative value:
 *     Removes stock.
 *
 * Zero is not allowed because it does not
 * represent an actual inventory adjustment.
 */
const stockAdjustmentSchema = z.object({
    quantityDelta: z
        .number()
        .int("Stock adjustment must be an integer")
        .refine(
            (value) => value !== 0,
            "Stock adjustment cannot be zero"
        ),
});

module.exports = {
    createProductSchema,
    updateProductSchema,
    productIdSchema,
    productQuerySchema,
    stockAdjustmentSchema,
};