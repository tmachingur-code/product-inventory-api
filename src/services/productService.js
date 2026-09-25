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
     *
     * Checks whether the SKU already exists before
     * creating the product.
     */
    async createProduct(productData) {
        const existingProduct = await productRepository.findBySku(
            productData.sku
        );

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
     *
     * Query options such as search, category, sorting,
     * and pagination are passed to the repository.
     */
    async getAllProducts(options = {}) {
        return productRepository.findAll(options);
    },

    /**
     * Retrieve paginated products with metadata.
     *
     * The repository returns the products for the
     * requested page and the total number of matching
     * products.
     *
     * The service calculates totalPages because this
     * is business/application logic rather than
     * database logic.
     */
    async getPaginatedProducts(options = {}) {
        const {
            page = 1,
            limit = 10,
        } = options;

        const result = await productRepository.findAllPaginated(
            options
        );

        const totalPages = Math.ceil(result.total / limit);

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
     * Retrieve products that are low in stock.
     *
     * The repository determines which products
     * meet the low-stock condition.
     */
    async getLowStockProducts() {
        return productRepository.findLowStock();
    },

        /**
     * Retrieve inventory statistics.
     *
     * The repository performs the database calculations
     * and returns the aggregated inventory information.
     */
    async getInventoryStats() {
        return productRepository.getInventoryStats();
    },

    /**
     * Retrieve a product by its ID.
     */
    async getProductById(id) {
        const productId = Number(id);
        const product = await productRepository.findById(productId);

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
        const product = await productRepository.findBySku(sku);

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

        const product = await productRepository.findById(productId);

        if (!product) {
            const error = new Error("Product not found");
            error.statusCode = 404;
            throw error;
        }

        if (productData.sku) {
            const existingProduct = await productRepository.findBySku(
                productData.sku
            );

            if (existingProduct && existingProduct.id !== productId) {
                const error = new Error(
                    "A product with this SKU already exists"
                );
                error.statusCode = 409;
                throw error;
            }
        }

        return productRepository.update(productId, productData);
    },

    /**
     * Delete a product by its ID.
     */
    async deleteProduct(id) {
        const productId = Number(id);

        const product = await productRepository.findById(productId);

        if (!product) {
            const error = new Error("Product not found");
            error.statusCode = 404;
            throw error;
        }

        return productRepository.delete(productId);
    },
};

module.exports = productService;