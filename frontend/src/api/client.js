import axios from 'axios';

/**
 * API Base URL - uses environment variable for deployment
 * Local: /api (proxied to localhost:5000)
 * Production: Full URL from VITE_API_URL
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

console.log('🔗 API Base URL:', API_BASE_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/**
 * Auth API endpoints
 */
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  signup: (name, email, password, role) => api.post('/auth/signup', { name, email, password, role }),
  getCurrentUser: () => api.get('/auth/me')
};

/**
 * Complaints API endpoints
 */
export const complaintAPI = {
  submitComplaint: (data) => api.post('/complaints', data),
  getComplaint: (id) => api.get(`/complaints/${id}`),
  getAllComplaints: () => api.get('/complaints'),
  getMyComplaints: () => api.get('/complaints/my/history'),
  updateStatus: (id, nextStep, notes) => api.patch(`/complaints/${id}/status`, { nextStep, notes }),
  addComment: (id, content, step) => api.post(`/complaints/${id}/comments`, { content, step }),
  uploadFile: (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/complaints/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

export default api;
