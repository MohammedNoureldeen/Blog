import { useAuthStore } from '../store/auth.store';

/**
 * Hook to access auth state and actions
 * @returns {{ user: import('@blog/shared/types').User | null, accessToken: string | null, isAuthenticated: boolean, login: Function, logout: Function }}
 */
export function useAuth() {
  const { user, accessToken, refreshToken, login, logout, setAccessToken } =
    useAuthStore();

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated: !!accessToken,
    login,
    logout,
    setAccessToken,
  };
}
