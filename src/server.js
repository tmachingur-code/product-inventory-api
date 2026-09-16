const app = require("./app");
const env = require("./config/env");

// Start the HTTP server
app.listen(env.port, () => {
    console.log(
        `Server running on http://localhost:${env.port}`
    );
});