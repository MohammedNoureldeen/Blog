import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { sanitizeHtml } from '../utils/markdown';

export function PostPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [loading] = useState(false);
  const [post] = useState(null);
  const [requiresAuth] = useState(false);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Post not found</h1>
        <p className="text-gray-600">The post you are looking for does not exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <article className="relative">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
        <div className="flex items-center gap-3 mb-8">
          <span className="text-sm text-gray-500">
            By {post.author?.name} &middot;{' '}
            {new Date(post.publishedAt).toLocaleDateString()}
          </span>
        </div>

        <div
          className={`prose prose-lg max-w-none ${requiresAuth ? 'relative overflow-hidden' : ''}`}
        >
          <div
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
          />
        </div>

        {requiresAuth && (
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        )}

        {requiresAuth && (
          <div className="absolute inset-0 flex items-end justify-center pb-12">
            <Card className="w-full max-w-md mx-4 backdrop-blur-sm bg-white/90">
              <CardBody className="text-center py-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Sign up to keep reading
                </h3>
                <p className="text-gray-600 mb-6">
                  Create an account to unlock the full article and more.
                </p>
                {!isAuthenticated ? (
                  <div className="flex items-center justify-center gap-4">
                    <Link to="/login">
                      <Button variant="ghost">Login</Button>
                    </Link>
                    <Link to="/register">
                      <Button variant="primary">Sign Up</Button>
                    </Link>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    You are already signed in.
                  </p>
                )}
              </CardBody>
            </Card>
          </div>
        )}
      </article>
    </div>
  );
}
