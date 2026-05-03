import { Router } from "express";
import userController from "./user.controller.js";
import authenticate from "../../middleware/authenticate.js";
import optionalAuth from "../../middleware/optional-auth.js";
import { validate } from "../../middleware/validate.js";
import {
  updateProfileSchema,
  usernameParamSchema,
  paginationQuerySchema,
} from "./user.schema.js";

const router = Router();

router.put("/me", authenticate, validate(updateProfileSchema), userController.updateProfile);
router.delete("/me", authenticate, userController.deleteAccount);

router.get("/:username", optionalAuth, validate(usernameParamSchema, "params"), userController.getProfile);
router.get("/:username/posts", validate(usernameParamSchema, "params"), validate(paginationQuerySchema, "query"), userController.getUserPosts);
router.get("/:username/followers", validate(usernameParamSchema, "params"), validate(paginationQuerySchema, "query"), userController.getFollowers);
router.get("/:username/following", validate(usernameParamSchema, "params"), validate(paginationQuerySchema, "query"), userController.getFollowing);

router.post("/:username/follow", authenticate, validate(usernameParamSchema, "params"), userController.followUser);
router.delete("/:username/follow", authenticate, validate(usernameParamSchema, "params"), userController.unfollowUser);

export default router;