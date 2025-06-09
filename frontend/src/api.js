// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API error:', error);
    
    // Handle token expiration
    if (error.response && error.response.status === 401) {
      console.log('Authentication error, clearing token');
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      // Don't redirect to login, just clear the token
    }
    
    return Promise.reject(error);
  }
); 