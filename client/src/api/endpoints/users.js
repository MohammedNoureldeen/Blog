import apiClient from '../client';

export const usersApi = {
  getProfile: (username) => apiClient.get(`/users/${username}`),
  getProfilePosts: (username, params) =>
    apiClient.get(`/users/${username}/posts`, { params }),
  updateProfile: (data) => apiClient.patch('/users/me', data),
};
