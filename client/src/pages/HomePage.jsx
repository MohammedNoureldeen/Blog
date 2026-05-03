import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { postsApi } from '../api/endpoints/posts';
import { Avatar } from '../components/ui/Avatar';
import { Spinner } from '../components/ui/Spinner';

function PostCard({ post }) {
  const dateStr = new Date(post.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const excerpt = post.content
    ? typeof post.content === 'string'
      ? post.content.slice(0, 160)
      : ''
    : '';

  return (
    <Link to={`/posts/${post.id}`} className="block group">
      <article className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
        <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 mb-2">
          {post.title}
        </h2>
        <div className="flex items-center gap-2 mb-3">
          <Avatar
            src={post.author?.avatarUrl}
            alt={post.author?.username}
            size="sm"
          />
          <span className="text-sm font-medium text-gray-700">
            {post.author?.username}
          </span>
          <span className="text-xs text-gray-400">&middot;</span>
          <span className="text-xs text-gray-500">{dateStr}</span>
        </div>
        {excerpt && (
          <p className="text-sm text-gray-600 line-clamp-3">{excerpt}</p>
        )}
      </article>
    </Link>
  );
}

export function HomePage() {
  const [cursor, setCursor] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['feed', 'global', cursor],
    queryFn: async () => {
      const params = { limit: 10 };
      if (cursor) params.cursor = cursor;
      const res = await postsApi.getGlobalFeed(params);
      return res.data;
    },
  });

  const posts = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Home</h1>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <p className="text-center text-red-600 py-12">
          Failed to load posts. Please try again later.
        </p>
      ) : posts.length === 0 ? (
        <p className="text-center text-gray-500 py-12">No posts yet.</p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}

          {meta?.hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={() => setCursor(meta.cursor)}
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