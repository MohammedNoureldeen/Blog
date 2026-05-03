import { Router } from "express";
import postController from "./post.controller.js";
import authenticate from "../../middleware/authenticate.js";
import authorize from "../../middleware/authorize.js";
import optionalAuth from "../../middleware/optional-auth.js";
import { validate } from "../../middleware/validate.js";
import {
  createPostSchema,
  updatePostSchema,
  postIdParamSchema,
  postsQuerySchema,
} from "./post.schema.js";

const postRoutes = Router();

postRoutes.get(
  "/",
  optionalAuth,
  validate(postsQuerySchema, "query"),
  postController.getPosts
);

postRoutes.post(
  "/",
  authenticate,
  validate(createPostSchema),
  postController.createPost
);

postRoutes.get(
  "/:id",
  optionalAuth,
  validate(postIdParamSchema, "params"),
  postController.getPost
);

postRoutes.put(
  "/:id",
  authenticate,
  validate(postIdParamSchema, "params"),
  validate(updatePostSchema),
  authorize("post", "owner"),
  postController.updatePost
);

postRoutes.delete(
  "/:id",
  authenticate,
  validate(postIdParamSchema, "params"),
  authorize("post", "ownerOrAdmin"),
  postController.deletePost
);

export default postRoutes;