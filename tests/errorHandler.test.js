const request = require("supertest");
const express = require("express");

const errorHandler = require("../src/middleware/errorHandler");

describe("Error handling", () => {
    let app;

    beforeEach(() => {
        app = express();

        // Prevent expected test errors from cluttering
        // the Jest output.
        jest.spyOn(console, "error").mockImplementation(
            () => {}
        );
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("should return 404 for an unknown route", async () => {
        const appWithRoutes = require("../src/app");

        const response = await request(
            appWithRoutes
        ).get("/does-not-exist");

        expect(response.statusCode).toBe(404);

        expect(response.body).toEqual({
            success: false,
            message: "Route not found",
        });
    });

    test("should return a custom status code and message for an application error", async () => {
        app.get("/test-error", (req, res, next) => {
            const error = new Error(
                "Product not found"
            );

            error.statusCode = 404;

            next(error);
        });

        app.use(errorHandler);

        const response = await request(app).get(
            "/test-error"
        );

        expect(response.statusCode).toBe(404);

        expect(response.body).toEqual({
            success: false,
            message: "Product not found",
        });
    });

    test("should return 409 for a conflict error", async () => {
        app.get("/test-conflict", (req, res, next) => {
            const error = new Error(
                "A product with this SKU already exists"
            );

            error.statusCode = 409;

            next(error);
        });

        app.use(errorHandler);

        const response = await request(app).get(
            "/test-conflict"
        );

        expect(response.statusCode).toBe(409);

        expect(response.body).toEqual({
            success: false,
            message:
                "A product with this SKU already exists",
        });
    });

    test("should return 409 for a Prisma unique constraint error", async () => {
        app.get(
            "/test-prisma-unique",
            (req, res, next) => {
                const error = new Error(
                    "Unique constraint failed on the fields: (`sku`)"
                );

                error.code = "P2002";

                next(error);
            }
        );

        app.use(errorHandler);

        const response = await request(app).get(
            "/test-prisma-unique"
        );

        expect(response.statusCode).toBe(409);

        expect(response.body).toEqual({
            success: false,
            message:
                "A record with the same unique value already exists",
        });
    });

    test("should return 409 with a product SKU message for a Prisma SKU unique constraint error", async () => {
        app.get(
            "/test-prisma-sku-unique",
            (req, res, next) => {
                const error = new Error(
                    "Unique constraint failed on the fields: (`sku`)"
                );

                error.code = "P2002";
                error.meta = {
                    target: ["sku"],
                };

                next(error);
            }
        );

        app.use(errorHandler);

        const response = await request(app).get(
            "/test-prisma-sku-unique"
        );

        expect(response.statusCode).toBe(409);

        expect(response.body).toEqual({
            success: false,
            message:
                "A product with this SKU already exists",
        });
    });

    test("should return 409 with a user email message for a Prisma email unique constraint error", async () => {
        app.get(
            "/test-prisma-email-unique",
            (req, res, next) => {
                const error = new Error(
                    "Unique constraint failed on the fields: (`email`)"
                );

                error.code = "P2002";
                error.meta = {
                    target: ["email"],
                };

                next(error);
            }
        );

        app.use(errorHandler);

        const response = await request(app).get(
            "/test-prisma-email-unique"
        );

        expect(response.statusCode).toBe(409);

        expect(response.body).toEqual({
            success: false,
            message:
                "A user with this email already exists",
        });
    });

    test("should return a generic message for an unknown Prisma unique constraint", async () => {
        app.get(
            "/test-prisma-unknown-unique",
            (req, res, next) => {
                const error = new Error(
                    "Unique constraint failed"
                );

                error.code = "P2002";
                error.meta = {
                    target: ["unknownField"],
                };

                next(error);
            }
        );

        app.use(errorHandler);

        const response = await request(app).get(
            "/test-prisma-unknown-unique"
        );

        expect(response.statusCode).toBe(409);

        expect(response.body).toEqual({
            success: false,
            message:
                "A record with the same unique value already exists",
        });
    });

    test("should return 500 for an unexpected server error", async () => {
        app.get("/test-server-error", () => {
            throw new Error(
                "Sensitive database implementation details"
            );
        });

        app.use(errorHandler);

        const response = await request(app).get(
            "/test-server-error"
        );

        expect(response.statusCode).toBe(500);

        expect(response.body).toEqual({
            success: false,
            message: "Internal server error",
        });
    });

    test("should not expose the internal error message for a 500 error", async () => {
        const internalMessage =
            "PrismaClientKnownRequestError: database connection failed";

        app.get(
            "/test-internal-error",
            (req, res, next) => {
                const error = new Error(
                    internalMessage
                );

                error.statusCode = 500;

                next(error);
            }
        );

        app.use(errorHandler);

        const response = await request(app).get(
            "/test-internal-error"
        );

        expect(response.statusCode).toBe(500);

        expect(response.body.message).toBe(
            "Internal server error"
        );

        expect(response.body.message).not.toContain(
            "PrismaClient"
        );

        expect(response.body.message).not.toContain(
            "database connection"
        );
    });

    test("should log expected client errors as warnings", async () => {
    const warn = jest.fn();
    const error = jest.fn();

    app.get("/test-client-error", (req, res, next) => {
        req.log = {
            warn,
            error,
        };

        const clientError = new Error(
            "Product not found"
        );

        clientError.statusCode = 404;

        next(clientError);
    });

    app.use(errorHandler);

    const response = await request(app).get(
        "/test-client-error"
    );

    expect(response.statusCode).toBe(404);

    expect(warn).toHaveBeenCalledWith(
        expect.objectContaining({
            statusCode: 404,
        }),
        "Request failed"
    );

    expect(error).not.toHaveBeenCalled();
});

test("should log 409 conflicts as warnings", async () => {
    const warn = jest.fn();
    const error = jest.fn();

    app.get("/test-conflict-logging", (req, res, next) => {
        req.log = {
            warn,
            error,
        };

        const conflictError = new Error(
            "A product with this SKU already exists"
        );

        conflictError.statusCode = 409;

        next(conflictError);
    });

    app.use(errorHandler);

    const response = await request(app).get(
        "/test-conflict-logging"
    );

    expect(response.statusCode).toBe(409);

    expect(warn).toHaveBeenCalledWith(
        expect.objectContaining({
            statusCode: 409,
        }),
        "Request failed"
    );

    expect(error).not.toHaveBeenCalled();
});

test("should log unexpected server errors as errors", async () => {
    const warn = jest.fn();
    const error = jest.fn();

    app.get("/test-server-error-logging", (req, res, next) => {
        req.log = {
            warn,
            error,
        };

        const serverError = new Error(
            "Database connection failed"
        );

        serverError.statusCode = 500;

        next(serverError);
    });

    app.use(errorHandler);

    const response = await request(app).get(
        "/test-server-error-logging"
    );

    expect(response.statusCode).toBe(500);

    expect(error).toHaveBeenCalledWith(
        expect.objectContaining({
            statusCode: 500,
        }),
        "Request failed"
    );

    expect(warn).not.toHaveBeenCalled();
});

    test("should use 500 when an error does not provide a status code", async () => {
        app.get(
            "/test-no-status",
            (req, res, next) => {
                next(
                    new Error(
                        "Unexpected application failure"
                    )
                );
            }
        );

        app.use(errorHandler);

        const response = await request(app).get(
            "/test-no-status"
        );

        expect(response.statusCode).toBe(500);

        expect(response.body).toEqual({
            success: false,
            message: "Internal server error",
        });
    });
});