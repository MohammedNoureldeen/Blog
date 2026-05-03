import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { postsApi } from '../api/endpoints/posts';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export function PostEditorPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const createPostMutation = useMutation({
    mutationFn: (data) => postsApi.createPost(data),
    onSuccess: (res) => {
      navigate(`/posts/${res.data.data.id}`);
    },
    onError: (err) => {
      const message =
        err.response?.data?.error?.message || 'Failed to create post.';
      setError(message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      setError('Content is required.');
      return;
    }
    createPostMutation.mutate({
      title: title.trim(),
      content: {
        blocks: [
          {
            id: crypto.randomUUID(),
            type: 'text',
            content: trimmedContent,
            order: 0,
          },
        ],
      },
      status: 'published',
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Post</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your post a title"
          required
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post content (Markdown supported)..."
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 resize-vertical"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-3">
          <Button type="submit" disabled={createPostMutation.isPending}>
            {createPostMutation.isPending ? 'Publishing...' : 'Publish'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}