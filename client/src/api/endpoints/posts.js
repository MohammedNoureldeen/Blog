import apiClient from '../client';

export const postsApi = {
  getGlobalFeed: (params) => apiClient.get('/posts', { params }),
  getPersonalFeed: (params) => apiClient.get('/posts/feed', { params }),
  getPost: (id) => apiClient.get(`/posts/${id}`),
  createPost: (data) => apiClient.post('/posts', data),
  updatePost: (id, data) => apiClient.patch(`/posts/${id}`, data),
  deletePost: (id) => apiClient.delete(`/posts/${id}`),
};
