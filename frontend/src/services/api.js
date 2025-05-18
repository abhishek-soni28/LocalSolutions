import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add health check function with 5-minute interval
let lastHealthCheck = 0;
const HEALTH_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

export const checkBackendHealth = async () => {
  const now = Date.now();
  if (now - lastHealthCheck < HEALTH_CHECK_INTERVAL) {
    return true; // Return cached result if within interval
  }

  try {
    const response = await api.get('/api/actuator/health', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    lastHealthCheck = now;
    return response.status === 200;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
};

// Add a request interceptor to add the JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Don't redirect here, let the components handle it
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

// Auth API
export const auth = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  logout: () => {
    localStorage.removeItem('token');
    return api.post('/api/auth/logout');
  },
  checkUsername: (username) => api.get(`/api/auth/check-username?username=${username}`),
  checkEmail: (email) => api.get(`/api/auth/check-email?email=${email}`),
  checkMobile: (mobileNumber) => api.get(`/api/auth/check-mobile?mobileNumber=${mobileNumber}`),
};

// Posts API
export const posts = {
  getAll: (params) => api.get('/api/posts', { params }),
  getPublicPosts: (params) => api.get('/api/posts', { params }),
  getById: (id) => api.get(`/api/posts/${id}`),
  create: (postData) => api.post('/api/posts', postData),
  update: (id, postData) => api.put(`/api/posts/${id}`, postData),
  delete: (id) => api.delete(`/api/posts/${id}`),
  like: (id) => api.post(`/api/posts/${id}/likes`),
  unlike: (id) => api.delete(`/api/posts/${id}/likes`),
  getUserPosts: (username, params) => api.get(`/api/posts/user/${username}`, { params }),
  getByTypeAndStatus: (type, status, pageable) =>
    api.get(`/api/posts/type/${type}/status/${status}`, { params: pageable }),
  getByCategoryAndPincode: (category, pincode, pageable) =>
    api.get(`/api/posts/category/${category}/pincode/${pincode}`, { params: pageable }),
  getByStatusAndPincode: (status, pincode) =>
    api.get(`/api/posts/status/${status}/pincode/${pincode}`),
  getRelevant: (type, status, userId, pageable) =>
    api.get('/api/posts/relevant', { params: { type, status, userId, ...pageable } }),
  getLocalCategory: (category, pincode, type, status, pageable) =>
    api.get(`/api/posts/local/${category}/${pincode}`, { params: { type, status, ...pageable } }),
  updateStatus: (id, status) => api.put(`/api/posts/${id}/status`, null, { params: { status } }),
  isLiked: (id, userId) => api.get(`/api/posts/${id}/liked`, { params: { userId } }),
};

// Comments API
export const comments = {
  getByPostId: (postId) => api.get(`/api/posts/${postId}/comments`),
  create: (postId, commentData) => api.post(`/api/posts/${postId}/comments`, commentData),
  update: (postId, commentId, commentData) => api.put(`/api/posts/${postId}/comments/${commentId}`, commentData),
  delete: (postId, commentId) => api.delete(`/api/posts/${postId}/comments/${commentId}`),
  getByUserId: (userId, pageable) =>
    api.get(`/api/comments/user/${userId}`, { params: pageable }),
};

// Users API
export const users = {
  getProfile: (username) => api.get(`/api/users/${username}`),
  updateProfile: (profileData) => api.put('/api/users/profile', profileData),
  updateBusinessProfile: (businessData) => api.put('/api/users/business-profile', businessData),
  getFollowers: (username) => api.get(`/api/users/${username}/followers`),
  getFollowing: (username) => api.get(`/api/users/${username}/following`),
  follow: (username) => api.post(`/api/users/${username}/follow`),
  unfollow: (username) => api.post(`/api/users/${username}/unfollow`),
  getAll: (pageable) => api.get('/api/users', { params: pageable }),
  getById: (id) => api.get(`/api/users/${id}`),
  delete: (id) => api.delete(`/api/users/${id}`),
  getByRole: (role) => api.get(`/api/users/role/${role}`),
  getByPincode: (pincode) => api.get(`/api/users/pincode/${pincode}`),
  getBusinessOwners: (category, pincode) => api.get(`/api/users/business/${category}/${pincode}`),
  getCurrentUser: () => api.get('/api/users/me'),
  updateUserProfile: (userData) => api.put('/api/users/me', userData),
  updateUserSettings: (settings) => api.put('/api/users/me/settings'),
  deleteAccount: () => api.delete('/api/users/me'),
};

// Upload API
export const upload = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/uploads/post-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  uploadProfileImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/uploads/profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteFile: (fileName) => api.delete(`/api/uploads/${fileName}`),
};

// Search API
export const search = {
  searchPosts: (params) => api.get('/api/posts/search', { params }),
};

// Analytics API
export const analytics = {
  getBusinessAnalytics: () => api.get('/api/business/analytics'),
  getPostAnalytics: (postId) => api.get(`/api/analytics/posts/${postId}`),
};

export default api;