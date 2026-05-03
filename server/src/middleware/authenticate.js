import jwt from "jsonwebtoken";
import AppError from "../lib/app-error.js";
import env from "../config/env.js";

/** @typedef {import('../types/auth.types.js').AuthenticatedUser} AuthenticatedUser */

/**
 * Hard auth middleware — verifies JWT Bearer token.
 * @param {import('express').Request & { user?: AuthenticatedUser }} req
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Authentication required", "UNAUTHORIZED", 401));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    req.user = { id: decoded.sub, role: decoded.role };
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new AppError("Token expired", "INVALID_TOKEN", 401));
    }
    return next(new AppError("Invalid token", "INVALID_TOKEN", 401));
  }
};

export default authenticate;