jest.mock("dotenv", () => ({
    config: jest.fn(),
}));

describe("Environment configuration", () => {
    const originalEnv = process.env;

    afterEach(() => {
        process.env = originalEnv;
        jest.resetModules();
    });

    test("uses default values when optional environment variables are missing", () => {
        process.env = {
            NODE_ENV: "test",
            JWT_SECRET: "test-secret",
        };

        const env = require("../src/config/env");

        expect(env.port).toBe(3000);
        expect(env.nodeEnv).toBe("test");
        expect(env.jwtSecret).toBe("test-secret");
    });

    test("throws when PORT is invalid", () => {
        process.env = {
            NODE_ENV: "test",
            PORT: "invalid",
            JWT_SECRET: "test-secret",
        };

        expect(() => {
            require("../src/config/env");
        }).toThrow(
            "PORT must be a valid number between 1 and 65535"
        );
    });

    test("throws when PORT is outside the valid range", () => {
        process.env = {
            NODE_ENV: "test",
            PORT: "70000",
            JWT_SECRET: "test-secret",
        };

        expect(() => {
            require("../src/config/env");
        }).toThrow(
            "PORT must be a valid number between 1 and 65535"
        );
    });

    test("throws when JWT_SECRET is missing in production", () => {
        process.env = {
            NODE_ENV: "production",
            PORT: "3000",
        };

        expect(() => {
            require("../src/config/env");
        }).toThrow(
            "JWT_SECRET is required in production"
        );
    });

    test("allows missing JWT_SECRET outside production", () => {
        process.env = {
            NODE_ENV: "test",
            PORT: "3000",
        };

        const env = require("../src/config/env");

        expect(env.jwtSecret).toBeUndefined();
    });
});