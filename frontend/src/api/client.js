import axios from 'axios';

/**
 * API Base URL - uses environment variable for deployment
 * Local: /api (proxied to localhost:5000)
 * Production: Full URL from VITE_API_URL (e.g., https://hacksmith-trustshield.onrender.com)
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

console.log('🔗 API Base URL:', API_BASE_URL);

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

// Add response error logging for debugging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log detailed error information for debugging
    const errorDetails = {
      status: error.response?.status,
      message: error.response?.data?.error || error.message,
      url: error.config?.url,
      method: error.config?.method,
      timestamp: new Date().toISOString()
    };
    
    console.error('❌ API Error:', errorDetails);
    
    // If it's a network error, log that specifically
    if (!error.response) {
      console.error('❌ Network Error - Cannot reach API at:', API_BASE_URL);
    }
    
    return Promise.reject(error);
  }
);

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

  // Get my complaints history (Employee)
  getMyComplaints: () => api.get('/complaints/my/history'),

  // Update complaint status
  updateStatus: (id, nextStep, notes) =>
    api.patch(`/complaints/${id}/status`, { nextStep, notes }),

  // Add comment (now includes step parameter)
  addComment: (id, content, step) => api.post(`/complaints/${id}/comments`, { content, step }),

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
