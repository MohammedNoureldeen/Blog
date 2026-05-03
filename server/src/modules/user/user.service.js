import prisma from "../../config/db.js";
import AppError from "../../lib/app-error.js";

const USER_PUBLIC_SELECT = {
  id: true,
  username: true,
  avatarUrl: true,
  role: true,
  createdAt: true,
};

const getUserProfile = async (username, currentUserId) => {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      ...USER_PUBLIC_SELECT,
      profile: { select: { bio: true, website: true, socialLinks: true } },
      _count: { select: { posts: { where: { status: "published" } }, following: true, followers: true } },
    },
  });

  if (!user) {
    throw new AppError("User not found", "USER_NOT_FOUND", 404);
  }

  let isFollowing = false;
  if (currentUserId) {
    const follow = await prisma.follow.findUnique({
      where: { followerId_followeeId: { followerId: currentUserId, followeeId: user.id } },
    });
    isFollowing = !!follow;
  }

  const { _count, profile, ...rest } = user;

  return {
    ...rest,
    authorProfile: profile,
    stats: {
      postCount: _count.posts,
      followerCount: _count.followers,
      followingCount: _count.following,
    },
    isFollowing,
  };
};

const updateProfile = async (userId, data) => {
  if (data.username) {
    const existing = await prisma.user.findFirst({
      where: { username: data.username, NOT: { id: userId } },
    });
    if (existing) {
      throw new AppError("Username already taken", "USERNAME_TAKEN", 409);
    }
  }

  const userData = {};
  if (data.username !== undefined) userData.username = data.username;
  if (data.avatarUrl !== undefined) userData.avatarUrl = data.avatarUrl;

  const profileData = {};
  if (data.bio !== undefined) profileData.bio = data.bio;
  if (data.website !== undefined) profileData.website = data.website;
  if (data.socialLinks !== undefined) profileData.socialLinks = data.socialLinks;

  const hasProfileUpdates = Object.keys(profileData).length > 0;

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: userId },
      data: userData,
      select: {
        ...USER_PUBLIC_SELECT,
        profile: { select: { bio: true, website: true, socialLinks: true } },
        _count: { select: { posts: { where: { status: "published" } }, following: true, followers: true } },
      },
    });

    if (hasProfileUpdates) {
      const updatedProfile = await tx.authorProfile.upsert({
        where: { userId },
        update: profileData,
        create: { userId, ...profileData },
      });

      user.profile = {
        bio: updatedProfile.bio,
        website: updatedProfile.website,
        socialLinks: updatedProfile.socialLinks,
      };
    }

    return user;
  });

  const { _count, profile, ...rest } = result;

  return {
    ...rest,
    authorProfile: profile,
    stats: {
      postCount: _count.posts,
      followerCount: _count.followers,
      followingCount: _count.following,
    },
    isFollowing: false,
  };
};

const deleteAccount = async (userId) => {
  await prisma.user.delete({ where: { id: userId } });
  return { message: "Account deleted" };
};

const getUserPosts = async (username, { cursor, limit }) => {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    throw new AppError("User not found", "USER_NOT_FOUND", 404);
  }

  const posts = await prisma.post.findMany({
    where: { userId: user.id, status: "published" },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    select: {
      id: true,
      title: true,
      coverImageUrl: true,
      createdAt: true,
      author: { select: { id: true, username: true, avatarUrl: true } },
    },
  });

  const hasMore = posts.length > limit;
  if (hasMore) posts.pop();

  return {
    items: posts,
    meta: {
      cursor: hasMore ? posts[posts.length - 1]?.id ?? null : null,
      hasMore,
      limit,
    },
  };
};

const getFollowers = async (username, { cursor, limit }) => {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    throw new AppError("User not found", "USER_NOT_FOUND", 404);
  }

  const follows = await prisma.follow.findMany({
    where: { followeeId: user.id },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor && { cursor: { followerId_followeeId: { followerId: cursor, followeeId: user.id } }, skip: 1 }),
    select: {
      follower: { select: { id: true, username: true, avatarUrl: true } },
    },
  });

  const hasMore = follows.length > limit;
  if (hasMore) follows.pop();

  const items = follows.map((f) => f.follower);

  return {
    items,
    meta: {
      cursor: hasMore ? items[items.length - 1]?.id ?? null : null,
      hasMore,
      limit,
    },
  };
};

const getFollowing = async (username, { cursor, limit }) => {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    throw new AppError("User not found", "USER_NOT_FOUND", 404);
  }

  const follows = await prisma.follow.findMany({
    where: { followerId: user.id },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor && { cursor: { followerId_followeeId: { followerId: user.id, followeeId: cursor } }, skip: 1 }),
    select: {
      followee: { select: { id: true, username: true, avatarUrl: true } },
    },
  });

  const hasMore = follows.length > limit;
  if (hasMore) follows.pop();

  const items = follows.map((f) => f.followee);

  return {
    items,
    meta: {
      cursor: hasMore ? items[items.length - 1]?.id ?? null : null,
      hasMore,
      limit,
    },
  };
};

const followUser = async (followerId, username) => {
  const targetUser = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!targetUser) {
    throw new AppError("User not found", "USER_NOT_FOUND", 404);
  }

  if (followerId === targetUser.id) {
    throw new AppError("You cannot follow yourself", "CANNOT_FOLLOW_SELF", 400);
  }

  const existing = await prisma.follow.findUnique({
    where: { followerId_followeeId: { followerId, followeeId: targetUser.id } },
  });

  if (existing) {
    throw new AppError("Already following this user", "ALREADY_FOLLOWING", 409);
  }

  await prisma.follow.create({
    data: { followerId, followeeId: targetUser.id },
  });

  return { message: "Following" };
};

const unfollowUser = async (followerId, username) => {
  const targetUser = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!targetUser) {
    throw new AppError("User not found", "USER_NOT_FOUND", 404);
  }

  const existing = await prisma.follow.findUnique({
    where: { followerId_followeeId: { followerId, followeeId: targetUser.id } },
  });

  if (!existing) {
    throw new AppError("Not following this user", "NOT_FOLLOWING", 404);
  }

  await prisma.follow.delete({
    where: { followerId_followeeId: { followerId, followeeId: targetUser.id } },
  });

  return { message: "Unfollowed" };
};

export default {
  getUserProfile,
  updateProfile,
  deleteAccount,
  getUserPosts,
  getFollowers,
  getFollowing,
  followUser,
  unfollowUser,
};