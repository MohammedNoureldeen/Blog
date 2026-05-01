import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export function ProtectedRoute({ children }) {
  const { accessToken } = useAuthStore();

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
