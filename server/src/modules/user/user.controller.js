import userService from "./user.service.js";
import { asyncHandler } from "../../middleware/async-handler.js";

const getProfile = async (req, res) => {
  const currentUserId = req.user?.id ?? null;
  const profile = await userService.getUserProfile(req.params.username, currentUserId);

  res.json({ success: true, data: profile });
};

const updateProfile = async (req, res) => {
  const profile = await userService.updateProfile(req.user.id, req.body);

  res.json({ success: true, data: profile });
};

const deleteAccount = async (req, res) => {
  const result = await userService.deleteAccount(req.user.id);

  res.json({ success: true, data: result });
};

const getUserPosts = async (req, res) => {
  const result = await userService.getUserPosts(req.params.username, {
    cursor: req.query.cursor,
    limit: parseInt(req.query.limit, 10),
  });

  res.json({ success: true, data: result.items, meta: result.meta });
};

const getFollowers = async (req, res) => {
  const result = await userService.getFollowers(req.params.username, {
    cursor: req.query.cursor,
    limit: parseInt(req.query.limit, 10),
  });

  res.json({ success: true, data: result.items, meta: result.meta });
};

const getFollowing = async (req, res) => {
  const result = await userService.getFollowing(req.params.username, {
    cursor: req.query.cursor,
    limit: parseInt(req.query.limit, 10),
  });

  res.json({ success: true, data: result.items, meta: result.meta });
};

const followUser = async (req, res) => {
  const result = await userService.followUser(req.user.id, req.params.username);

  res.status(201).json({ success: true, data: result });
};

const unfollowUser = async (req, res) => {
  const result = await userService.unfollowUser(req.user.id, req.params.username);

  res.json({ success: true, data: result });
};

export default {
  getProfile: asyncHandler(getProfile),
  updateProfile: asyncHandler(updateProfile),
  deleteAccount: asyncHandler(deleteAccount),
  getUserPosts: asyncHandler(getUserPosts),
  getFollowers: asyncHandler(getFollowers),
  getFollowing: asyncHandler(getFollowing),
  followUser: asyncHandler(followUser),
  unfollowUser: asyncHandler(unfollowUser),
};