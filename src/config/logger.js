const pino = require("pino");

const logger = pino({
    level: process.env.LOG_LEVEL || "info",

    base: {
        service: "product-inventory-api",
    },

    timestamp: pino.stdTimeFunctions.isoTime,

    // Prevent sensitive authentication data from
    // appearing in application logs.
    redact: {
        paths: [
            "req.headers.authorization",
            "req.headers.cookie",
        ],
        censor: "[REDACTED]",
    },
});

module.exports = logger;