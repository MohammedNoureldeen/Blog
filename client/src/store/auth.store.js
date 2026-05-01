import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * @typedef {import('@blog/shared/types').User} User
 */

/**
 * @typedef {Object} AuthState
 * @property {User | null} user
 * @property {string | null} accessToken
 * @property {string | null} refreshToken
 * @property {(user: User, accessToken: string, refreshToken: string) => void} login
 * @property {() => void} logout
 * @property {(token: string) => void} setAccessToken
 */

/** @type {(set: import('zustand').StateCreator<AuthState>['create']) => import('zustand').StateCreator<AuthState>} */
const authStore = (set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,

  login: (user, accessToken, refreshToken) => {
    set({ user, accessToken, refreshToken });
  },

  logout: () => {
    set({ user: null, accessToken: null, refreshToken: null });
  },

  setAccessToken: (token) => {
    set({ accessToken: token });
  },
});

export const useAuthStore = create(
  persist(authStore, {
    name: 'auth-storage',
    partialize: (state) => ({
      user: state.user,
      accessToken: state.accessToken,
      refreshToken: state.refreshToken,
    }),
  })
);
