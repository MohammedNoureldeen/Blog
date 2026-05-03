import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { postsApi } from '../api/endpoints/posts';
import { commentsApi } from '../api/endpoints/comments';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Spinner } from '../components/ui/Spinner';
import { sanitizeHtml } from '../utils/markdown';

export function PostPage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');

  const { data: post, isLoading: postLoading, isError: postError } = useQuery({
    queryKey: ['post', id],
    queryFn: async () => {
      const res = await postsApi.getPost(id);
      return res.data.data;
    },
  });

  const { data: commentsData, isLoading: commentsLoading } = useQuery({
    queryKey: ['comments', id],
    queryFn: async () => {
      const res = await commentsApi.getComments(id, { limit: 100 });
      return res.data;
    },
    enabled: !!id,
  });

  const createCommentMutation = useMutation({
    mutationFn: (content) => commentsApi.createComment(id, { content }),
    onSuccess: () => {
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: commentsApi.deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
    },
  });

  if (postLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (postError || !post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Post not found</h1>
        <p className="text-gray-600">The post you are looking for does not exist.</p>
      </div>
    );
  }

  const comments = commentsData?.data ?? [];
  const meta = commentsData?.meta;

  const handleSubmitComment = (e) => {
    e.preventDefault();
    const trimmed = commentText.trim();
    if (!trimmed) return;
    createCommentMutation.mutate(trimmed);
  };

  const canDelete = (comment) => {
    if (!user) return false;
    return user.id === comment.author.id || user.role === 'admin';
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <article>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
        <div className="flex items-center gap-3 mb-8">
          <Link
            to={`/profile/${post.author?.username}`}
            className="flex items-center gap-2 hover:opacity-80"
          >
            <Avatar
              src={post.author?.avatarUrl}
              alt={post.author?.username}
              size="sm"
            />
            <span className="text-sm font-medium text-gray-700">
              {post.author?.username}
            </span>
          </Link>
          <span className="text-sm text-gray-400">&middot;</span>
          <span className="text-sm text-gray-500">{formatDate(post.createdAt)}</span>
        </div>

        <div className="prose prose-lg max-w-none">
          <div
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
          />
        </div>
      </article>

      <div className="mt-12 border-t border-gray-200 pt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Comments {meta ? `(${meta.limit ?? comments.length})` : `(${comments.length})`}
        </h2>

        {isAuthenticated && (
          <form onSubmit={handleSubmitComment} className="mb-8">
            <div className="flex gap-3">
              <Avatar src={user?.avatarUrl} alt={user?.username} size="sm" />
              <div className="flex-1">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  rows={3}
                  maxLength={2000}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 resize-vertical"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400">
                    {commentText.length}/2000
                  </span>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!commentText.trim() || createCommentMutation.isPending}
                  >
                    {createCommentMutation.isPending ? 'Posting...' : 'Comment'}
                  </Button>
                </div>
                {createCommentMutation.isError && (
                  <p className="text-sm text-red-600 mt-1">
                    Failed to post comment. Please try again.
                  </p>
                )}
              </div>
            </div>
          </form>
        )}

        {!isAuthenticated && (
          <Card className="mb-8">
            <CardBody className="text-center py-6">
              <p className="text-gray-600 mb-3">Sign in to leave a comment.</p>
              <div className="flex items-center justify-center gap-4">
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary">Sign Up</Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        )}

        {commentsLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="md" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No comments yet. Be the first!</p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="flex gap-3 py-4 border-b border-gray-100 last:border-b-0"
              >
                <Avatar
                  src={comment.author.avatarUrl}
                  alt={comment.author.username}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      to={`/profile/${comment.author.username}`}
                      className="text-sm font-medium text-gray-900 hover:opacity-80"
                    >
                      {comment.author.username}
                    </Link>
                    <span className="text-xs text-gray-400">
                      {formatDate(comment.createdAt)}
                    </span>
                    {canDelete(comment) && (
                      <button
                        onClick={() => deleteCommentMutation.mutate(comment.id)}
                        disabled={deleteCommentMutation.isPending}
                        className="ml-auto text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
                      >
                        {deleteCommentMutation.isPending ? 'Deleting...' : 'Delete'}
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}