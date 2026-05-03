import { z } from "zod";

const socialLinksSchema = z
  .object({
    twitter: z.string().url().optional(),
    github: z.string().url().optional(),
    linkedin: z.string().url().optional(),
  })
  .optional();

export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    .optional(),
  avatarUrl: z.string().url("Invalid URL format").optional(),
  bio: z.string().max(1000, "Bio must be at most 1000 characters").optional(),
  website: z.string().url("Invalid URL format").optional(),
  socialLinks: socialLinksSchema,
});

export const usernameParamSchema = z.object({
  username: z.string().min(1),
});

export const paginationQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z
    .string()
    .optional()
    .transform((v) => Math.min(parseInt(v || "10", 10), 50)),
});