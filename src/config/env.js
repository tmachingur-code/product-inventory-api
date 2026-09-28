require("dotenv").config();

const port = Number(process.env.PORT || 3000);
const nodeEnv = process.env.NODE_ENV || "development";
const jwtSecret = process.env.JWT_SECRET;

if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(
        "PORT must be a valid number between 1 and 65535"
    );
}

if (nodeEnv === "production" && !jwtSecret) {
    throw new Error(
        "JWT_SECRET is required in production"
    );
}

const env = {
    port,
    nodeEnv,
    jwtSecret,
};

module.exports = env;