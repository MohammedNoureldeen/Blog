import { z } from "zod";

const blockSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("text"),
    content: z.string(),
    id: z.string(),
    order: z.number(),
  }),
  z.object({
    type: z.literal("heading"),
    content: z.string(),
    id: z.string(),
    order: z.number(),
  }),
  z.object({
    type: z.literal("image"),
    content: z.string(),
    id: z.string(),
    order: z.number(),
  }),
  z.object({
    type: z.literal("code"),
    content: z.string(),
    id: z.string(),
    order: z.number(),
  }),
  z.object({
    type: z.literal("list"),
    content: z.string(),
    id: z.string(),
    order: z.number(),
  }),
  z.object({
    type: z.literal("quote"),
    content: z.string(),
    id: z.string(),
    order: z.number(),
  }),
  z.object({
    type: z.literal("divider"),
    id: z.string(),
    order: z.number(),
    content: z.string().optional(),
  }),
]);

export const postContentSchema = z.object({
  blocks: z.array(blockSchema).min(1, "Content must have at least one block"),
});

export const createPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(300, "Title must be at most 300 characters"),
  content: postContentSchema,
  coverImageUrl: z.string().url().optional(),
});

export const updatePostSchema = z.object({
  title: z.string().min(1, "Title cannot be empty").max(300, "Title must be at most 300 characters").optional(),
  content: postContentSchema.optional(),
  coverImageUrl: z.string().url().optional(),
});

export const postIdParamSchema = z.object({
  id: z.string().min(1),
});

export const postsQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z
    .string()
    .optional()
    .transform((v) => Math.min(parseInt(v || "10", 10), 50)),
});