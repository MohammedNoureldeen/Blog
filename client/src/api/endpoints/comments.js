import apiClient from '../client';

export const commentsApi = {
  getComments: (postId, params) =>
    apiClient.get(`/posts/${postId}/comments`, { params }),
  createComment: (postId, data) =>
    apiClient.post(`/posts/${postId}/comments`, data),
  deleteComment: (commentId) =>
    apiClient.delete(`/comments/${commentId}`),
};