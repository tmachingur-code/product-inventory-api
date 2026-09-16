require("dotenv").config();

const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

// Get the PostgreSQL connection string from the environment.
const connectionString = process.env.DATABASE_URL;

// Create the PostgreSQL driver adapter.
const adapter = new PrismaPg({
    connectionString,
});

// Create one Prisma Client instance for the application.
const prisma = new PrismaClient({
    adapter,
});

module.exports = prisma;