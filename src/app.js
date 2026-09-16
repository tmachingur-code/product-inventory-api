const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
});

app.use(limiter);

// Health check
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Product Inventory API is running",
        status: "healthy",
    });
});

// Handle unknown routes
app.use(notFound);

// Centralized error handler
app.use(errorHandler);

module.exports = app;