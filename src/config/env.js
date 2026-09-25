require("dotenv").config();

/**
 * Application environment configuration.
 *
 * Keeping environment variables in one place makes
 * the rest of the application easier to maintain.
 */
const env = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || "development",
    jwtSecret: process.env.JWT_SECRET,
};

module.exports = env;