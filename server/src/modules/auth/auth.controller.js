import authService from "./auth.service.js";
import { asyncHandler } from "../../middleware/async-handler.js";

const register = async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.registerUser(req.body);

  res.status(201).json({
    success: true,
    data: { user, accessToken, refreshToken },
  });
};

const login = async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.loginUser(req.body);

  res.status(200).json({
    success: true,
    data: { user, accessToken, refreshToken },
  });
};

const refresh = async (req, res) => {
  const { accessToken } = await authService.refreshAccessToken(req.body);

  res.status(200).json({
    success: true,
    data: { accessToken },
  });
};

const logout = async (req, res) => {
  const result = await authService.logoutUser(req.body, req.user.id);

  res.status(200).json({
    success: true,
    data: result,
  });
};

export default {
  register: asyncHandler(register),
  login: asyncHandler(login),
  refresh: asyncHandler(refresh),
  logout: asyncHandler(logout),
};