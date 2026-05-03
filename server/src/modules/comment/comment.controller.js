import commentService from "./comment.service.js";
import { asyncHandler } from "../../middleware/async-handler.js";

const getComments = async (req, res) => {
  const result = await commentService.getComments(req.params.id, {
    cursor: req.query.cursor,
    limit: req.query.limit,
  });

  res.json({ success: true, data: result.items, meta: result.meta });
};

const createComment = async (req, res) => {
  const comment = await commentService.createComment(
    req.params.id,
    req.user.id,
    req.body.content
  );

  res.status(201).json({ success: true, data: comment });
};

const deleteComment = async (req, res) => {
  const result = await commentService.deleteComment(req.params.commentId);

  res.json({ success: true, data: result });
};

export default {
  getComments: asyncHandler(getComments),
  createComment: asyncHandler(createComment),
  deleteComment: asyncHandler(deleteComment),
};