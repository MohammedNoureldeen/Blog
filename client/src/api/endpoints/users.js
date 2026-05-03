import apiClient from '../client';

export const usersApi = {
  getProfile: (username) => apiClient.get(`/users/${username}`),
  getProfilePosts: (username, params) =>
    apiClient.get(`/users/${username}/posts`, { params }),
  getFollowers: (username, params) =>
    apiClient.get(`/users/${username}/followers`, { params }),
  getFollowing: (username, params) =>
    apiClient.get(`/users/${username}/following`, { params }),
  updateProfile: (data) => apiClient.patch('/users/me', data),
  followUser: (username) => apiClient.post(`/users/${username}/follow`),
  unfollowUser: (username) => apiClient.delete(`/users/${username}/follow`),
};