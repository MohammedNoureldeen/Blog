import AppError from "../lib/app-error.js";

/**
 * Zod validation middleware factory.
 *
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @param {'body' | 'query' | 'params'} [source='body'] - Where to find the data on the request
 * @returns {import('express').RequestHandler}
 *
 * On success: replaces req[source] with the parsed output and calls next().
 * On failure: throws AppError with VALIDATION_ERROR (422) and Zod error details.
 */
const validate = (schema, source = "body") => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const firstError = Object.values(errors).flat()[0] || "Validation failed";
    return next(new AppError(firstError, "VALIDATION_ERROR", 422));
  }
  if (source !== "query") {
    req[source] = result.data;
  } else {
    Object.assign(req.query, result.data);
  }
  next();
};

export { validate };