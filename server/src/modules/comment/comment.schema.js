import { z } from "zod";

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Content cannot be empty")
    .max(2000, "Content must be at most 2000 characters"),
});

export const postIdParamSchema = z.object({
  id: z.string().min(1),
});

export const commentIdParamSchema = z.object({
  commentId: z.string().min(1),
});

export const commentsQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z
    .string()
    .optional()
    .transform((v) => Math.min(parseInt(v || "20", 10), 100)),
});