const productRepository = require("../repositories/productRepository");

/**
 * Product Service
 *
 * The service layer contains business logic.
 * It communicates with the repository instead of
 * communicating directly with the database.
 */
const productService = {
    /**
     * Create a new product.
     */
    async createProduct(productData) {
        const existingProduct =
            await productRepository.findBySku(productData.sku);

        if (existingProduct) {
            const error = new Error(
                "A product with this SKU already exists"
            );

            error.statusCode = 409;

            throw error;
        }

        return productRepository.create(productData);
    },

    /**
     * Retrieve products.
     */
    async getAllProducts(options = {}) {
        return productRepository.findAll(options);
    },

    /**
     * Retrieve paginated products with metadata.
     */
    async getPaginatedProducts(options = {}) {
        const {
            page = 1,
            limit = 10,
        } = options;

        const result =
            await productRepository.findAllPaginated(options);

        const totalPages = Math.ceil(
            result.total / limit
        );

        return {
            products: result.products,
            pagination: {
                page,
                limit,
                total: result.total,
                totalPages,
            },
        };
    },

    /**
     * Retrieve low-stock products.
     */
    async getLowStockProducts() {
        return productRepository.findLowStock();
    },

    /**
     * Retrieve inventory statistics.
     */
    async getInventoryStats() {
        return productRepository.getInventoryStats();
    },

    /**
     * Adjust product stock.
     *
     * Positive quantityDelta adds stock.
     *
     * Negative quantityDelta removes stock.
     *
     * The service validates the business rules before
     * asking the repository to modify the database.
     */
    async adjustStock(id, quantityDelta) {
        const productId = Number(id);

        if (quantityDelta === 0) {
            const error = new Error(
                "Stock adjustment cannot be zero"
            );

            error.statusCode = 400;

            throw error;
        }

        const product =
            await productRepository.findById(productId);

        if (!product) {
            const error = new Error("Product not found");

            error.statusCode = 404;

            throw error;
        }

        if (
            quantityDelta < 0 &&
            product.quantity + quantityDelta < 0
        ) {
            const error = new Error("Insufficient stock");

            error.statusCode = 400;

            throw error;
        }

        const updatedProduct =
            await productRepository.adjustStock(
                productId,
                quantityDelta
            );

        /**
         * The conditional database update may fail if
         * another request changes the stock between the
         * initial check and the update.
         */
        if (!updatedProduct) {
            const error = new Error("Insufficient stock");

            error.statusCode = 400;

            throw error;
        }

        return updatedProduct;
    },

    /**
     * Retrieve a product by its ID.
     */
    async getProductById(id) {
        const productId = Number(id);

        const product =
            await productRepository.findById(productId);

        if (!product) {
            const error = new Error("Product not found");

            error.statusCode = 404;

            throw error;
        }

        return product;
    },

    /**
     * Retrieve a product by its SKU.
     */
    async getProductBySku(sku) {
        const product =
            await productRepository.findBySku(sku);

        if (!product) {
            const error = new Error("Product not found");

            error.statusCode = 404;

            throw error;
        }

        return product;
    },

    /**
     * Update a product by its ID.
     */
    async updateProduct(id, productData) {
        const productId = Number(id);

        const product =
            await productRepository.findById(productId);

        if (!product) {
            const error = new Error("Product not found");

            error.statusCode = 404;

            throw error;
        }

        if (productData.sku) {
            const existingProduct =
                await productRepository.findBySku(
                    productData.sku
                );

            if (
                existingProduct &&
                existingProduct.id !== productId
            ) {
                const error = new Error(
                    "A product with this SKU already exists"
                );

                error.statusCode = 409;

                throw error;
            }
        }

        return productRepository.update(
            productId,
            productData
        );
    },

    /**
     * Delete a product by its ID.
     */
    async deleteProduct(id) {
        const productId = Number(id);

        const product =
            await productRepository.findById(productId);

        if (!product) {
            const error = new Error("Product not found");

            error.statusCode = 404;

            throw error;
        }

        return productRepository.delete(productId);
    },
};

module.exports = productService;