import { Prisma } from "@prisma/client";
import AppError from "../lib/app-error.js";
import env from "../config/env.js";

/**
 * Global error handler — 4-argument Express middleware.
 *
 * - AppError instances → use their statusCode and code
 * - Prisma P2002 (unique constraint) → 409 CONFLICT
 * - Prisma P2025 (record not found) → 404 NOT_FOUND
 * - Everything else → 500 INTERNAL_ERROR, log with pino, send generic message
 *
 * Always responds with { success: false, error: { code, message } }.
 * Never leaks stack traces or internal messages to the client in production.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let code = err.code || "INTERNAL_ERROR";
  let message = err.message || "Something went wrong";

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const fields = err.meta?.target?.join(", ") || "field";
      statusCode = 409;
      code = "CONFLICT";
      message = `Duplicate value for ${fields}`;
    } else if (err.code === "P2025") {
      statusCode = 404;
      code = "NOT_FOUND";
      message = "Resource not found";
    }
  } else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    code = "INVALID_TOKEN";
    message = "Invalid token";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    code = "INVALID_TOKEN";
    message = "Token expired";
  }

  if (statusCode === 500) {
    req.log?.error(err);
    if (env.NODE_ENV === "production") {
      message = "Something went wrong";
    }
  }

  res.status(statusCode).json({
    success: false,
    error: { code, message },
  });
};

export default errorHandler;