import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { usersApi } from '../api/endpoints/users';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';

export function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [postsCursor, setPostsCursor] = useState(null);

  const isOwnProfile = currentUser?.username === username;

  const { data: profile, isLoading: profileLoading, isError: profileError } = useQuery({
    queryKey: ['profile', username],
    queryFn: async () => {
      const res = await usersApi.getProfile(username);
      return res.data.data;
    },
  });

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['profilePosts', username, postsCursor],
    queryFn: async () => {
      const params = { limit: 10 };
      if (postsCursor) params.cursor = postsCursor;
      const res = await usersApi.getProfilePosts(username, params);
      return res.data;
    },
    enabled: !!username,
  });

  const followMutation = useMutation({
    mutationFn: () => usersApi.followUser(username),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', username] });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: () => usersApi.unfollowUser(username),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', username] });
    },
  });

  if (profileLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">User not found</h1>
        <p className="text-gray-600">This profile does not exist.</p>
      </div>
    );
  }

  const posts = postsData?.data ?? [];
  const postsMeta = postsData?.meta;

  const handleFollow = () => followMutation.mutate();
  const handleUnfollow = () => unfollowMutation.mutate();

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-8">
        <div className="flex items-start gap-6">
          <Avatar
            src={profile.avatarUrl}
            alt={profile.username}
            size="lg"
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">{profile.username}</h1>
            {profile.authorProfile?.bio && (
              <p className="text-gray-600 mt-2">{profile.authorProfile.bio}</p>
            )}
            {profile.authorProfile?.website && (
              <a
                href={profile.authorProfile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm mt-1 inline-block"
              >
                {profile.authorProfile.website}
              </a>
            )}
            <p className="text-xs text-gray-400 mt-2">
              Joined {formatDate(profile.createdAt)}
            </p>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
              <span><strong>{profile.stats?.postCount ?? 0}</strong> posts</span>
              <span><strong>{profile.stats?.followerCount ?? 0}</strong> followers</span>
              <span><strong>{profile.stats?.followingCount ?? 0}</strong> following</span>
            </div>
          </div>
          <div className="flex-shrink-0">
            {isOwnProfile ? (
              <Link to="/settings">
                <Button variant="secondary" size="sm">Edit Profile</Button>
              </Link>
            ) : isAuthenticated && (
              profile.isFollowing ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleUnfollow}
                  disabled={unfollowMutation.isPending}
                >
                  {unfollowMutation.isPending ? 'Unfollowing...' : 'Unfollow'}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleFollow}
                  disabled={followMutation.isPending}
                >
                  {followMutation.isPending ? 'Following...' : 'Follow'}
                </Button>
              )
            )}
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-4">Posts</h2>

      {postsLoading ? (
        <div className="flex justify-center py-8">
          <Spinner size="md" />
        </div>
      ) : posts.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No posts yet.</p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Link key={post.id} to={`/posts/${post.id}`} className="block group">
              <article className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 mb-2">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {new Date(post.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </article>
            </Link>
          ))}

          {postsMeta?.hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={() => setPostsCursor(postsMeta.cursor)}
                className="text-blue-600 hover:underline text-sm font-medium"
              >
                Load more
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}