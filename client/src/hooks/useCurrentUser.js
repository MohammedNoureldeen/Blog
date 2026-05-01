import { useAuthStore } from '../store/auth.store';

/**
 * Hook to get the current authenticated user
 * @returns {import('@blog/shared/types').User | null}
 */
export function useCurrentUser() {
  return useAuthStore((state) => state.user);
}
