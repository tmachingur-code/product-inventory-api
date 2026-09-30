const swaggerJsdoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.3",

        info: {
            title: "Product Inventory API",
            version: "1.0.0",
            description:
                "RESTful API for managing products, inventory, authentication, and user management.",
        },

        servers: [
            {
                url: "https://product-inventory-api-j3sm.onrender.com",
                description: "Local development server",
            },
        ],

        tags: [
            {
                name: "Authentication",
                description:
                    "User registration and authentication",
            },
            {
                name: "Users",
                description:
                    "User management and role administration",
            },
            {
                name: "Products",
                description:
                    "Product and inventory management",
            },
        ],

        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description:
                        "Enter a valid JWT token. Example: Bearer eyJhbGciOiJIUzI1NiIs...",
                },
            },

            schemas: {
                User: {
                    type: "object",
                    properties: {
                        id: {
                            type: "integer",
                            example: 1,
                        },
                        name: {
                            type: "string",
                            example: "John Doe",
                        },
                        email: {
                            type: "string",
                            format: "email",
                            example:
                                "john@example.com",
                        },
                        role: {
                            type: "string",
                            enum: [
                                "STAFF",
                                "ADMIN",
                            ],
                            example: "STAFF",
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time",
                        },
                    },
                },

                RegisterUser: {
                    type: "object",
                    required: [
                        "name",
                        "email",
                        "password",
                    ],
                    properties: {
                        name: {
                            type: "string",
                            minLength: 2,
                            example: "John Doe",
                        },
                        email: {
                            type: "string",
                            format: "email",
                            example:
                                "john@example.com",
                        },
                        password: {
                            type: "string",
                            format: "password",
                            minLength: 8,
                            example:
                                "StrongPassword123!",
                        },
                    },
                },

                LoginUser: {
                    type: "object",
                    required: [
                        "email",
                        "password",
                    ],
                    properties: {
                        email: {
                            type: "string",
                            format: "email",
                            example:
                                "john@example.com",
                        },
                        password: {
                            type: "string",
                            format: "password",
                            example:
                                "StrongPassword123!",
                        },
                    },
                },

                AuthResponse: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean",
                            example: true,
                        },
                        data: {
                            type: "object",
                            properties: {
                                user: {
                                    $ref: "#/components/schemas/User",
                                },
                                token: {
                                    type: "string",
                                    example:
                                        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                                },
                            },
                        },
                    },
                },

                UpdateUserRole: {
                    type: "object",
                    required: ["role"],
                    properties: {
                        role: {
                            type: "string",
                            enum: [
                                "STAFF",
                                "ADMIN",
                            ],
                            example: "ADMIN",
                        },
                    },
                },

                Product: {
                    type: "object",
                    properties: {
                        id: {
                            type: "integer",
                            example: 1,
                        },
                        name: {
                            type: "string",
                            example: "Laptop",
                        },
                        description: {
                            type: "string",
                            nullable: true,
                            example:
                                "Business laptop",
                        },
                        sku: {
                            type: "string",
                            example: "LAP-001",
                        },
                        price: {
                            type: "number",
                            format: "double",
                            minimum: 0,
                            example: 999.99,
                        },
                        quantity: {
                            type: "integer",
                            minimum: 0,
                            example: 10,
                        },
                        category: {
                            type: "string",
                            nullable: true,
                            example: "Electronics",
                        },
                        lowStockThreshold: {
                            type: "integer",
                            minimum: 0,
                            example: 5,
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time",
                        },
                    },
                },

                CreateProduct: {
                    type: "object",
                    required: [
                        "name",
                        "sku",
                        "price",
                    ],
                    properties: {
                        name: {
                            type: "string",
                            example: "Laptop",
                        },
                        description: {
                            type: "string",
                            example:
                                "Business laptop",
                        },
                        sku: {
                            type: "string",
                            example: "LAP-001",
                        },
                        price: {
                            type: "number",
                            format: "double",
                            minimum: 0,
                            example: 999.99,
                        },
                        quantity: {
                            type: "integer",
                            minimum: 0,
                            example: 10,
                        },
                        category: {
                            type: "string",
                            example: "Electronics",
                        },
                        lowStockThreshold: {
                            type: "integer",
                            minimum: 0,
                            example: 5,
                        },
                    },
                },

                UpdateProduct: {
                    type: "object",
                    properties: {
                        name: {
                            type: "string",
                            example: "Updated Laptop",
                        },
                        description: {
                            type: "string",
                            nullable: true,
                            example:
                                "Updated description",
                        },
                        price: {
                            type: "number",
                            format: "double",
                            minimum: 0,
                            example: 1099.99,
                        },
                        quantity: {
                            type: "integer",
                            minimum: 0,
                            example: 15,
                        },
                        category: {
                            type: "string",
                            nullable: true,
                            example: "Electronics",
                        },
                        lowStockThreshold: {
                            type: "integer",
                            minimum: 0,
                            example: 5,
                        },
                    },
                },

                StockAdjustment: {
                    type: "object",
                    required: ["quantityDelta"],
                    properties: {
                        quantityDelta: {
                            type: "integer",
                            example: -3,
                            description:
                                "Positive values add stock. Negative values remove stock.",
                        },
                    },
                },

                Pagination: {
                    type: "object",
                    properties: {
                        page: {
                            type: "integer",
                            example: 1,
                        },
                        limit: {
                            type: "integer",
                            example: 10,
                        },
                        total: {
                            type: "integer",
                            example: 25,
                        },
                        totalPages: {
                            type: "integer",
                            example: 3,
                        },
                    },
                },

                ProductListResponse: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean",
                            example: true,
                        },
                        data: {
                            type: "array",
                            items: {
                                $ref: "#/components/schemas/Product",
                            },
                        },
                        pagination: {
                            $ref: "#/components/schemas/Pagination",
                        },
                    },
                },

                Error: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean",
                            example: false,
                        },
                        message: {
                            type: "string",
                            example:
                                "Product not found",
                        },
                        errors: {
                            type: "array",
                            description:
                                "Validation errors, when applicable.",
                            items: {
                                type: "object",
                                properties: {
                                    field: {
                                        type: "string",
                                        example: "price",
                                    },
                                    message: {
                                        type: "string",
                                        example:
                                            "Price must be greater than or equal to 0",
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },

    apis: [
        "./src/routes/*.js",
    ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;