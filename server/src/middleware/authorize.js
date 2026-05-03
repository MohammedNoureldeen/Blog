import AppError from "../lib/app-error.js";
import prisma from "../config/db.js";

/**
 * Authorization middleware factory.
 *
 * @param {'post' | 'comment'} resourceType - The Prisma model name to fetch
 * @param {'owner' | 'admin' | 'ownerOrAdmin'} check - The access check to perform
 * @returns {import('express').RequestHandler}
 *
 * 'owner'       — fetches resource, compares resource.userId to req.user.id
 * 'admin'       — checks req.user.role === 'admin'
 * 'ownerOrAdmin' — allows if user is the owner OR an admin
 *
 * Must run AFTER authenticate middleware.
 */
const authorize = (resourceType, check) => {
  const modelMap = {
    post: prisma.post,
    comment: prisma.comment,
  };

  return async (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Authentication required", "UNAUTHORIZED", 401));
    }

    if (check === "admin") {
      if (req.user.role === "admin") return next();
      return next(new AppError("Insufficient permissions", "FORBIDDEN", 403));
    }

    const model = modelMap[resourceType];
    if (!model) {
      return next(new AppError(`Unknown resource type: ${resourceType}`, "INTERNAL_ERROR", 500));
    }

    let resource;
    try {
      resource = await model.findUnique({ where: { id: req.params.id } });
    } catch (err) {
      return next(new AppError("Resource not found", "NOT_FOUND", 404));
    }

    if (!resource) {
      return next(new AppError("Resource not found", "NOT_FOUND", 404));
    }

    const isOwner = resource.userId === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (check === "owner" && isOwner) return next();
    if (check === "ownerOrAdmin" && (isOwner || isAdmin)) return next();

    return next(new AppError("Insufficient permissions", "FORBIDDEN", 403));
  };
};

export default authorize;