import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from "../../config/db.js";
import AppError from "../../lib/app-error.js";
import env from "../../config/env.js";

const SALT_ROUNDS = 12;

const parseDuration = (str) => {
  const match = str.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const value = parseInt(match[1]);
  const unit = match[2];
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return value * multipliers[unit];
};

const generateAccessToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  });

const generateRefreshToken = () => crypto.randomBytes(64).toString("hex");

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const USER_SELECT = {
  id: true,
  email: true,
  username: true,
  avatarUrl: true,
  role: true,
  createdAt: true,
};

const registerUser = async ({ email, username, password }) => {
  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (existingUser) {
    if (existingUser.email === email) {
      throw new AppError("Email already taken", "EMAIL_TAKEN", 409);
    }
    throw new AppError("Username already taken", "USERNAME_TAKEN", 409);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { email, username, passwordHash },
    select: USER_SELECT,
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();
  const refreshExpiresAt = new Date(Date.now() + parseDuration(env.JWT_REFRESH_EXPIRES_IN));

  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(refreshToken),
      userId: user.id,
      expiresAt: refreshExpiresAt,
    },
  });

  return { user, accessToken, refreshToken };
};

const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AppError("Invalid credentials", "INVALID_CREDENTIALS", 401);
  }

  const userDto = await prisma.user.findUnique({
    where: { id: user.id },
    select: USER_SELECT,
  });

  const accessToken = generateAccessToken(userDto);
  const refreshToken = generateRefreshToken();
  const refreshExpiresAt = new Date(Date.now() + parseDuration(env.JWT_REFRESH_EXPIRES_IN));

  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(refreshToken),
      userId: userDto.id,
      expiresAt: refreshExpiresAt,
    },
  });

  return { user: userDto, accessToken, refreshToken };
};

const refreshAccessToken = async ({ refreshToken }) => {
  const tokenHash = hashToken(refreshToken);

  const storedToken = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!storedToken) {
    throw new AppError("Invalid refresh token", "INVALID_REFRESH_TOKEN", 401);
  }

  if (storedToken.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });
    throw new AppError("Refresh token expired", "INVALID_REFRESH_TOKEN", 401);
  }

  const accessToken = generateAccessToken(storedToken.user);

  return { accessToken };
};

const logoutUser = async ({ refreshToken }, userId) => {
  const tokenHash = hashToken(refreshToken);

  const storedToken = await prisma.refreshToken.findUnique({
    where: { tokenHash },
  });

  if (!storedToken) {
    throw new AppError("Invalid refresh token", "INVALID_REFRESH_TOKEN", 401);
  }

  if (storedToken.userId !== userId) {
    throw new AppError("Unauthorized", "UNAUTHORIZED", 401);
  }

  await prisma.refreshToken.delete({ where: { id: storedToken.id } });

  return { message: "Logged out" };
};

export default {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
};