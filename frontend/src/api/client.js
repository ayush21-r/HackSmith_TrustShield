import axios from 'axios';

const API_BASE_URL = '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  getCurrentUser: () => api.get('/auth/me')
};

// Complaints API
export const complaintAPI = {
  // Submit new complaint
  submitComplaint: (data) => api.post('/complaints', data),

  // Get single complaint
  getComplaint: (id) => api.get(`/complaints/${id}`),

  // Get all complaints (HR only)
  getAllComplaints: () => api.get('/complaints'),

  // Update complaint status
  updateStatus: (id, nextStep, notes) =>
    api.patch(`/complaints/${id}/status`, { nextStep, notes }),

  // Add comment
  addComment: (id, content) => api.post(`/complaints/${id}/comments`, { content }),

  // Upload file
  uploadFile: (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/complaints/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

export default api;
