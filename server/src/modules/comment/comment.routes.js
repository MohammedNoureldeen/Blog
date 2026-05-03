import { Router } from "express";
import commentController from "./comment.controller.js";
import authenticate from "../../middleware/authenticate.js";
import authorize from "../../middleware/authorize.js";
import { validate } from "../../middleware/validate.js";
import {
  createCommentSchema,
  postIdParamSchema,
  commentIdParamSchema,
  commentsQuerySchema,
} from "./comment.schema.js";

const postCommentRoutes = Router();
const commentRoutes = Router();

postCommentRoutes.get(
  "/:id/comments",
  validate(postIdParamSchema, "params"),
  validate(commentsQuerySchema, "query"),
  commentController.getComments
);

postCommentRoutes.post(
  "/:id/comments",
  authenticate,
  validate(postIdParamSchema, "params"),
  validate(createCommentSchema),
  commentController.createComment
);

commentRoutes.delete(
  "/:commentId",
  authenticate,
  validate(commentIdParamSchema, "params"),
  authorize("comment", "ownerOrAdmin"),
  commentController.deleteComment
);

export { postCommentRoutes, commentRoutes };