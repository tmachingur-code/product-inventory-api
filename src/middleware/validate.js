const validate = (schema, source = "body") => {
    return (req, res, next) => {
        const result = schema.safeParse(req[source]);

        // If validation fails, stop the request here.
        if (!result.success) {
            const errors = result.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            }));

            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors,
            });
        }

        // Replace the original data with the
        // validated and transformed data.
        req[source] = result.data;

        // Continue to the next middleware/controller.
        next();
    };
};

module.exports = validate;