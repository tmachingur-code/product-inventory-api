const express = require("express");
const request = require("supertest");
const bcrypt = require("bcryptjs");

const prisma = require("../src/config/prisma");

const authRoutes = require("../src/routes/authRoutes");
const productRoutes = require("../src/routes/productRoutes");

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

// Simple test error handler
app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message,
    });
});

describe("Authentication Flow Integration", () => {
    const timestamp = Date.now();

    const staffUser = {
        name: "Integration Staff",
        email: `integration.staff.${timestamp}@example.com`,
        password: "SecurePassword123!",
    };

    const adminUser = {
        name: "Integration Admin",
        email: `integration.admin.${timestamp}@example.com`,
        password: "SecurePassword123!",
    };

    let staffToken;
    let adminToken;
    let staffProductId;

    beforeAll(async () => {
        // Create an ADMIN user directly in the database.
        // The public registration endpoint intentionally
        // creates STAFF users only.
        const passwordHash = await bcrypt.hash(
            adminUser.password,
            12
        );

        await prisma.user.create({
            data: {
                name: adminUser.name,
                email: adminUser.email,
                passwordHash,
                role: "ADMIN",
            },
        });
    });

    afterAll(async () => {
        // Remove products created by these integration tests.
        if (staffProductId) {
            await prisma.product.delete({
                where: {
                    id: staffProductId,
                },
            });
        }

        // Remove the test users.
        await prisma.user.deleteMany({
            where: {
                email: {
                    in: [
                        staffUser.email,
                        adminUser.email,
                    ],
                },
            },
        });
    });

    describe("STAFF authentication flow", () => {
        test("should register a STAFF user", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send(staffUser);

            expect(response.status).toBe(201);

            expect(response.body).toEqual({
                success: true,
                data: {
                    id: expect.any(Number),
                    name: staffUser.name,
                    email: staffUser.email,
                    role: "STAFF",
                },
            });
        });

        test("should login the STAFF user and return a JWT", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: staffUser.email,
                    password: staffUser.password,
                });

            expect(response.status).toBe(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.user).toEqual({
                id: expect.any(Number),
                name: staffUser.name,
                email: staffUser.email,
                role: "STAFF",
            });

            expect(response.body.data.token).toEqual(
                expect.any(String)
            );

            staffToken = response.body.data.token;
        });

        test("should allow the authenticated STAFF user to create a product", async () => {
            const response = await request(app)
                .post("/api/products")
                .set(
                    "Authorization",
                    `Bearer ${staffToken}`
                )
                .send({
                    name: "Integration Test Product",
                    sku: `AUTH-FLOW-${timestamp}`,
                    price: 150.00,
                    quantity: 10,
                    category: "Testing",
                    lowStockThreshold: 5,
                });

            expect(response.status).toBe(201);

            expect(response.body.success).toBe(true);

            expect(response.body.data).toEqual(
                expect.objectContaining({
                    id: expect.any(Number),
                    name: "Integration Test Product",
                    sku: `AUTH-FLOW-${timestamp}`,
                    quantity: 10,
                    category: "Testing",
                })
            );

            staffProductId = response.body.data.id;
        });

        test("should reject the STAFF user from deleting a product", async () => {
            const response = await request(app)
                .delete(`/api/products/${staffProductId}`)
                .set(
                    "Authorization",
                    `Bearer ${staffToken}`
                );

            expect(response.status).toBe(403);

            expect(response.body).toEqual({
                success: false,
                message: "Access forbidden",
            });
        });
    });

    describe("ADMIN authentication flow", () => {
        test("should login the ADMIN user and return a JWT", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: adminUser.email,
                    password: adminUser.password,
                });

            expect(response.status).toBe(200);

            expect(response.body.success).toBe(true);

            expect(response.body.data.user).toEqual({
                id: expect.any(Number),
                name: adminUser.name,
                email: adminUser.email,
                role: "ADMIN",
            });

            expect(response.body.data.token).toEqual(
                expect.any(String)
            );

            adminToken = response.body.data.token;
        });

        test("should allow the ADMIN user to delete a product", async () => {
            const response = await request(app)
                .delete(`/api/products/${staffProductId}`)
                .set(
                    "Authorization",
                    `Bearer ${adminToken}`
                );

            expect(response.status).toBe(200);

            expect(response.body.success).toBe(true);

            staffProductId = null;
        });
    });
});