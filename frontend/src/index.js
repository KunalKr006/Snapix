import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import axios from 'axios';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Initialize AOS animation library
AOS.init({
  duration: 800,
  once: false,
  mirror: true,
  offset: 100,
  easing: 'ease-in-out'
});

// Configure axios to include the token in all requests
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Add response interceptor for error handling
axios.interceptors.response.use(
  response => response,
  error => {
    console.error('Axios error:', error);
    
    // Handle token expiration
    if (error.response && error.response.status === 401) {
      console.log('Authentication error, clearing token');
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      // Don't redirect to login, just clear the token
    }
    
    return Promise.reject(error);
  }
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 