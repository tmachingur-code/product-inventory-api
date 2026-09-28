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

    test("uses the default development environment when NODE_ENV is missing", () => {
        process.env = {
            JWT_SECRET: "test-secret",
        };

        const env = require("../src/config/env");

        expect(env.port).toBe(3000);
        expect(env.nodeEnv).toBe("development");
        expect(env.jwtSecret).toBe("test-secret");
    });

    test("uses a custom PORT when it is valid", () => {
        process.env = {
            NODE_ENV: "test",
            PORT: "4000",
            JWT_SECRET: "test-secret",
        };

        const env = require("../src/config/env");

        expect(env.port).toBe(4000);
        expect(env.nodeEnv).toBe("test");
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

    test("throws when PORT is zero", () => {
        process.env = {
            NODE_ENV: "test",
            PORT: "0",
            JWT_SECRET: "test-secret",
        };

        expect(() => {
            require("../src/config/env");
        }).toThrow(
            "PORT must be a valid number between 1 and 65535"
        );
    });

    test("throws when PORT is greater than 65535", () => {
        process.env = {
            NODE_ENV: "test",
            PORT: "65536",
            JWT_SECRET: "test-secret",
        };

        expect(() => {
            require("../src/config/env");
        }).toThrow(
            "PORT must be a valid number between 1 and 65535"
        );
    });

    test("accepts the minimum valid PORT", () => {
        process.env = {
            NODE_ENV: "test",
            PORT: "1",
            JWT_SECRET: "test-secret",
        };

        const env = require("../src/config/env");

        expect(env.port).toBe(1);
    });

    test("accepts the maximum valid PORT", () => {
        process.env = {
            NODE_ENV: "test",
            PORT: "65535",
            JWT_SECRET: "test-secret",
        };

        const env = require("../src/config/env");

        expect(env.port).toBe(65535);
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

    test("loads production environment with JWT_SECRET", () => {
        process.env = {
            NODE_ENV: "production",
            PORT: "4000",
            JWT_SECRET: "production-secret",
        };

        const env = require("../src/config/env");

        expect(env.port).toBe(4000);
        expect(env.nodeEnv).toBe("production");
        expect(env.jwtSecret).toBe("production-secret");
    });
});