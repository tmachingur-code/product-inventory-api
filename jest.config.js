module.exports = {
    testEnvironment: "node",

    /**
     * Run the test setup file after Jest's
     * testing environment has been initialized.
     */
    setupFilesAfterEnv: [
        "<rootDir>/tests/setup.js",
    ],

    // Store test coverage reports in the coverage folder
    coverageDirectory: "coverage",

    // Include source files when generating coverage
    collectCoverageFrom: [
        "src/**/*.js",

        // server.js only starts the server, so don't include it
        "!src/server.js",
    ],
};