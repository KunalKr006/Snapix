import axios from 'axios';

// API URLs for different environments
const API_URLS = {
  production: 'https://snapix.onrender.com',
  development: 'http://localhost:5000'
};

// Select API URL based on environment
const API_URL = process.env.NODE_ENV === 'production' 
  ? API_URLS.production 
  : API_URLS.development;

// Create a configured axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Add request interceptor to include the token in all requests
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API request failed:', error.response || error);
    
    // Handle token expiration
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api; 
