import axios from 'axios';

/**
 * API Configuration for Multi-Environment Support
 * 
 * Local Development (localhost:3000):
 *   - Uses Vite proxy at /api
 *   - Proxies to http://localhost:5000
 *   - VITE_API_URL not needed
 * 
 * Production (Vercel):
 *   - VITE_API_URL must be set to: https://hacksmith-trustshield.onrender.com
 *   - All API calls use full URL: https://hacksmith-trustshield.onrender.com/api/*
 * 
 * CRITICAL: VITE_API_URL should NOT include /api suffix
 * This code appends /api automatically
 */

const isDevelopment = import.meta.env.MODE === 'development';
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_BASE_URL = `${BACKEND_URL}/api`;

// Log configuration for debugging deployment issues
if (isDevelopment) {
  console.log('🔧 Development Mode');
  console.log('📍 VITE_API_URL:', import.meta.env.VITE_API_URL || '(using default)');
  console.log('🔗 Backend URL:', BACKEND_URL);
  console.log('🔗 API Base URL:', API_BASE_URL);
} else {
  console.log('🚀 Production Mode');
  console.log('📍 VITE_API_URL:', import.meta.env.VITE_API_URL || '(ERROR: NOT SET!)');
  console.log('🔗 Backend URL:', BACKEND_URL);
  console.log('🔗 API Base URL:', API_BASE_URL);
}

// Create axios instance with proper configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
  // Important for credentials (cookies, auth headers)
  withCredentials: false // Set to true only if backend sends cookies
});

/**
 * Request interceptor: Add JWT token to every request
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request details in development
    if (isDevelopment) {
      console.log('📤 Request:', {
        method: config.method.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        fullURL: config.baseURL + config.url
      });
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error.message);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor: Handle errors and logging
 */
api.interceptors.response.use(
  (response) => {
    if (isDevelopment) {
      console.log('📥 Response:', {
        status: response.status,
        url: response.config.url
      });
    }
    return response;
  },
  (error) => {
    const errorDetails = {
      status: error.response?.status,
      message: error.response?.data?.error || error.message,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      baseURL: error.config?.baseURL,
      fullURL: error.config?.baseURL + error.config?.url,
      timestamp: new Date().toISOString()
    };

    // Network error (CORS, timeout, no connection)
    if (!error.response) {
      console.error('❌ Network Error:', {
        message: error.message,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        hint: 'Check CORS, API URL, and if Render backend is running'
      });
      
      // Check if it looks like a CORS error
      if (error.message === 'Network Error' || !error.message) {
        console.error('🚨 Possible CORS Error! Make sure:');
        console.error('   1. Backend has correct VITE_API_URL in CORS allowlist');
        console.error('   2. Current frontend URL:', window.location.origin);
        console.error('   3. Backend URL:', API_BASE_URL);
      }
    } else {
      // API error (4xx, 5xx)
      console.error('❌ API Error:', errorDetails);
    }

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

  // Add comment (includes step for workflow tracking)
  addComment: (id, content, step) => 
    api.post(`/complaints/${id}/comments`, { content, step }),

  // Upload file
  uploadFile: (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/complaints/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

// Export the configured axios instance
export default api;
      console.error('❌ Network Error - Cannot reach API at:', API_BASE_URL);
      console.error('❌ Make sure VITE_API_URL is set correctly in environment variables');
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
