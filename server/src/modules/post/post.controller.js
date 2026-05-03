import postService from "./post.service.js";
import { asyncHandler } from "../../middleware/async-handler.js";

const getPosts = async (req, res) => {
  const result = await postService.getPosts(req.user?.id, {
    cursor: req.query.cursor,
    limit: req.query.limit,
  });

  res.json({ success: true, data: result.items, meta: result.meta });
};

const createPost = async (req, res) => {
  const post = await postService.createPost(req.user.id, req.body);

  res.status(201).json({ success: true, data: post });
};

const getPost = async (req, res) => {
  const post = await postService.getPost(req.params.id, req.user?.id);

  res.json({ success: true, data: post });
};

const updatePost = async (req, res) => {
  const post = await postService.updatePost(req.params.id, req.user.id, req.body);

  res.json({ success: true, data: post });
};

const deletePost = async (req, res) => {
  const result = await postService.deletePost(req.params.id);

  res.json({ success: true, data: result });
};

export default {
  getPosts: asyncHandler(getPosts),
  createPost: asyncHandler(createPost),
  getPost: asyncHandler(getPost),
  updatePost: asyncHandler(updatePost),
  deletePost: asyncHandler(deletePost),
};