import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string(),
});

export const refreshSchema = z.object({
  refreshToken: z.string(),
});

export const logoutSchema = z.object({
  refreshToken: z.string(),
});