import prisma from "../../config/db.js";
import AppError from "../../lib/app-error.js";

const COMMENT_SELECT = {
  id: true,
  content: true,
  createdAt: true,
  user: {
    select: { id: true, username: true, avatarUrl: true },
  },
};

const getPublishedPost = async (postId) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, status: true },
  });

  if (!post || post.status !== "published") {
    throw new AppError("Post not found", "POST_NOT_FOUND", 404);
  }

  return post;
};

const getComments = async (postId, { cursor, limit }) => {
  await getPublishedPost(postId);

  const comments = await prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: "asc" },
    take: limit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    select: COMMENT_SELECT,
  });

  const hasMore = comments.length > limit;
  if (hasMore) comments.pop();

  return {
    items: comments.map(({ user, ...rest }) => ({ ...rest, author: user })),
    meta: {
      cursor: hasMore ? comments[comments.length - 1]?.id ?? null : null,
      hasMore,
      limit,
    },
  };
};

const createComment = async (postId, userId, content) => {
  await getPublishedPost(postId);

  const comment = await prisma.comment.create({
    data: { content, postId, userId },
    select: COMMENT_SELECT,
  });

  const { user, ...rest } = comment;
  return { ...rest, author: user };
};

const deleteComment = async (commentId) => {
  await prisma.comment.delete({ where: { id: commentId } });
  return { message: "Comment deleted" };
};

export default {
  getComments,
  createComment,
  deleteComment,
};