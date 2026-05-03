import { Router } from "express";
import authController from "./auth.controller.js";
import { validate } from "../../middleware/validate.js";
import authenticate from "../../middleware/authenticate.js";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
} from "./auth.schema.js";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", validate(refreshSchema), authController.refresh);
router.post("/logout", authenticate, validate(logoutSchema), authController.logout);

export default router;