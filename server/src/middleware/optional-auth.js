import jwt from "jsonwebtoken";
import env from "../config/env.js";

/** @typedef {import('../types/auth.types.js').AuthenticatedUser} AuthenticatedUser */

/**
 * Soft auth middleware — verifies JWT Bearer token if present.
 * @param {import('express').Request & { user?: AuthenticatedUser | null }} req
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    req.user = { id: decoded.sub, role: decoded.role };
  } catch {
    req.user = null;
  }

  next();
};

export default optionalAuth;