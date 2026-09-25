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

        /**
         * Replace the request data with the validated
         * and transformed data.
         *
         * Express exposes req.query through a special
         * property, so directly assigning to req.query
         * may not replace the parsed query object.
         *
         * Defining the property explicitly ensures that
         * Zod transformations such as z.coerce.number()
         * are preserved.
         */
        Object.defineProperty(req, source, {
            value: result.data,
            writable: true,
            configurable: true,
            enumerable: true,
        });

        // Continue to the next middleware/controller.
        next();
    };
};

module.exports = validate;