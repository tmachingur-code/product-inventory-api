const swaggerJsdoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.3",

        info: {
            title: "Product Inventory API",
            version: "1.0.0",
            description:
                "RESTful API for managing products, inventory, authentication, and stock information.",
        },

        servers: [
            {
                url: "http://localhost:3000",
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
                            enum: ["STAFF", "ADMIN"],
                            example: "STAFF",
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
                            example: 999.99,
                        },
                        quantity: {
                            type: "integer",
                            example: 10,
                        },
                        category: {
                            type: "string",
                            nullable: true,
                            example: "Electronics",
                        },
                        lowStockThreshold: {
                            type: "integer",
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