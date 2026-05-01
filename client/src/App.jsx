import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { PageWrapper } from './components/layout/PageWrapper';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { FeedPage } from './pages/FeedPage';
import { PostPage } from './pages/PostPage';
import { PostEditorPage } from './pages/PostEditorPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

function App() {
  return (
    <PageWrapper>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/feed"
          element={
            <ProtectedRoute>
              <FeedPage />
            </ProtectedRoute>
          }
        />
        <Route path="/posts/:id" element={<PostPage />} />
        <Route
          path="/posts/new"
          element={
            <ProtectedRoute>
              <PostEditorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/posts/:id/edit"
          element={
            <ProtectedRoute>
              <PostEditorPage />
            </ProtectedRoute>
          }
        />
        <Route path="/profile/:username" element={<ProfilePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </PageWrapper>
  );
}

export default App;
