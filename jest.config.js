module.exports = {
    testEnvironment: "node",

    // Store test coverage reports in the coverage folder
    coverageDirectory: "coverage",

    // Include source files when generating coverage
    collectCoverageFrom: [
        "src/**/*.js",

        // server.js only starts the server, so don't include it
        "!src/server.js",
    ],
};