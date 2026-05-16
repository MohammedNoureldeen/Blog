import { Prisma } from "@prisma/client";
import prisma from "../../config/db.js";
import AppError from "../../lib/app-error.js";

const AUTHOR_SELECT = {
  id: true,
  username: true,
  avatarUrl: true,
};

const POST_SUMMARY_SELECT = {
  id: true,
  title: true,
  coverImageUrl: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  author: { select: AUTHOR_SELECT },
  _count: { select: { likes: true, comments: true, views: true } },
};

function truncateContent(content, wordLimit = 300) {
  let count = 0;
  const blocks = [];
  for (const block of content.blocks) {
    if (block.type === "image") {
      blocks.push(block);
      continue;
    }
    const words = block.content.split(/\s+/);
    if (count + words.length <= wordLimit) {
      blocks.push(block);
      count += words.length;
    } else {
      const remaining = wordLimit - count;
      blocks.push({ ...block, content: words.slice(0, remaining).join(" ") + "..." });
      break;
    }
  }
  return { blocks };
}

const getPosts = async (userId, { cursor, limit }) => {
  const posts = await prisma.post.findMany({
    where: { status: "published" },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    select: {
      ...POST_SUMMARY_SELECT,
      likes: userId ? { where: { userId } } : false,
    },
  });

  const hasMore = posts.length > limit;
  if (hasMore) posts.pop();

  return {
    items: posts.map((post) => {
      const { _count, likes, author, ...rest } = post;
      return {
        ...rest,
        author,
        likesCount: _count.likes,
        commentsCount: _count.comments,
        viewsCount: _count.views,
        isLiked: Array.isArray(likes) ? !!likes.length : false,
      };
    }),
    meta: {
      cursor: hasMore ? posts[posts.length - 1]?.id ?? null : null,
      hasMore,
      limit,
    },
  };
};

const createPost = async (userId, data) => {
  await prisma.authorProfile.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  const post = await prisma.post.create({
    data: {
      title: data.title,
      content: data.content,
      coverImageUrl: data.coverImageUrl,
      userId,
    },
    select: {
      id: true,
      title: true,
      coverImageUrl: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      author: { select: { id: true, username: true, avatarUrl: true, profile: { select: { bio: true } } } },
      _count: { select: { likes: true, comments: true, views: true } },
    },
  });

  const { _count, author, ...rest } = post;
  return {
    ...rest,
    author: {
      id: author.id,
      username: author.username,
      avatarUrl: author.avatarUrl,
      authorProfile: author.profile,
    },
    likesCount: _count.likes,
    commentsCount: _count.comments,
    viewsCount: _count.views,
    preview: false,
    requiresAuth: false,
    isLiked: false,
  };
};

const getPost = async (postId, userId) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      title: true,
      content: true,
      coverImageUrl: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      author: { select: { ...AUTHOR_SELECT, profile: { select: { bio: true } } } },
      _count: { select: { likes: true, comments: true, views: true } },
      likes: userId ? { where: { userId } } : false,
    },
  });

  if (!post || post.status !== "published") {
    throw new AppError("Post not found", "POST_NOT_FOUND", 404);
  }

  let content = post.content;
  let preview = false;
  let requiresAuth = false;

  if (!userId) {
    content = truncateContent(content);
    preview = true;
    requiresAuth = true;
  } else {
    await prisma.postView.upsert({
      where: { postId_userId: { postId, userId } },
      update: { viewedAt: new Date() },
      create: { postId, userId },
    });
  }

  const { _count, likes, author, ...rest } = post;
  return {
    ...rest,
    content,
    author: {
      id: author.id,
      username: author.username,
      avatarUrl: author.avatarUrl,
      authorProfile: author.profile,
    },
    likesCount: _count.likes,
    commentsCount: _count.comments,
    viewsCount: _count.views,
    preview,
    requiresAuth,
    isLiked: !!likes.length,
  };
};

const updatePost = async (postId, userId, data) => {
  const existing = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, userId: true },
  });

  if (!existing || existing.status === "deleted") {
    throw new AppError("Post not found", "POST_NOT_FOUND", 404);
  }

  if (existing.userId !== userId) {
    throw new AppError("Not authorized", "NOT_AUTHORIZED", 403);
  }

  const updateData = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.content !== undefined) updateData.content = data.content;
  if (data.coverImageUrl !== undefined) updateData.coverImageUrl = data.coverImageUrl;

  const post = await prisma.post.update({
    where: { id: postId },
    data: updateData,
    select: {
      id: true,
      title: true,
      coverImageUrl: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      author: { select: { ...AUTHOR_SELECT, profile: { select: { bio: true } } } },
      _count: { select: { likes: true, comments: true, views: true } },
      likes: userId ? { where: { userId } } : false,
    },
  });

  const { _count, likes, author, ...rest } = post;
  return {
    ...rest,
    content: post.content,
    author: {
      id: author.id,
      username: author.username,
      avatarUrl: author.avatarUrl,
      authorProfile: author.profile,
    },
    likesCount: _count.likes,
    commentsCount: _count.comments,
    viewsCount: _count.views,
    preview: false,
    requiresAuth: false,
    isLiked: !!likes.length,
  };
};

const deletePost = async (postId) => {
  const existing = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, userId: true, status: true },
  });

  if (!existing || existing.status === "deleted") {
    throw new AppError("Post not found", "POST_NOT_FOUND", 404);
  }

  await prisma.post.update({
    where: { id: postId },
    data: { status: "deleted" },
  });

  return { message: "Post deleted" };
};

const getUserPosts = async (username, { cursor, limit }) => {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    throw new AppError("User not found", "POST_NOT_FOUND", 404);
  }

  const posts = await prisma.post.findMany({
    where: { userId: user.id, status: "published" },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    select: POST_SUMMARY_SELECT,
  });

  const hasMore = posts.length > limit;
  if (hasMore) posts.pop();

  return {
    items: posts.map((post) => {
      const { _count, author, ...rest } = post;
      return {
        ...rest,
        author,
        likesCount: _count.likes,
        commentsCount: _count.comments,
        viewsCount: _count.views,
        isLiked: false,
      };
    }),
    meta: {
      cursor: hasMore ? posts[posts.length - 1]?.id ?? null : null,
      hasMore,
      limit,
    },
  };
};


const getPublishPost = async(postId)=>{
  const post = await prisma.post.findUnique({
    where :{id:postId},
    select :{id:true,status:true}
  });

  if(!post|| post.status !=="published"){
    throw new AppError("Post not found ","POST_NOT_FOUND",404)
  }


}


const likePost = async(postId,userId)=>{
  await  getPublishPost(postId)

  try{
    await prisma.likes.create({
      data :{userId,postId}
    })

  }catch(error){
    if(error.code==="P2002"){
      throw new AppError("Already Liked","ALREADY_LIKED",409);
    }
    throw error;

  }
  const likesCount = await prisma.likes.count({
    where:{postId}
  })
  
}


const unlikePost  = async(postId,userId)=>{
  await  getPublishPost(postId)

  try {
    await prisma.likes.delete({
      where : {userId_postId :{userId , postId}}
    });
  } catch (error) {
    if (error.code === "P2025"){
      throw new AppError("Not Liked","NOT_LIKED",404)
    }
  }
  const likesCount = await prisma.likes.count({
    where:{postId}
  })
  return {likesCount}
}

export default {
  getPosts,
  createPost,
  getPost,
  updatePost,
  deletePost,
  getUserPosts,
  truncateContent,
  unlikePost,
  likePost
};