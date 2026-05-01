import React from 'react';
import { useParams } from 'react-router-dom';

export function ProfilePage() {
  const { username } = useParams();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Profile: {username}
      </h1>
      <p className="text-gray-600">Profile page coming soon.</p>
    </div>
  );
}
