const app = require("./app");
const env = require("./config/env");
const logger = require("./config/logger");

// Start the HTTP server
app.listen(env.port, () => {
    logger.info(
        {
            port: env.port,
            environment: env.nodeEnv,
        },
        "Product Inventory API started"
    );
});