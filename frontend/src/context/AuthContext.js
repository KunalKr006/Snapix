import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, []);

  // Function to fetch user data
  const fetchUserData = async () => {
    try {
      const res = await api.get('/api/auth/me');
      console.log('Fetched user data:', res.data);
      setUser(res.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await api.post('/api/auth/login', { email, password });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      setUser(user);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (username, email, password) => {
    try {
      console.log('Attempting registration with:', { username, email });
      const res = await api.post('api/auth/register', { username, email, password });
      console.log('Registration response:', res.data);
      
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      setUser(user);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error.response || error);
      if (error.response?.data?.message) {
        return {
          success: false,
          error: error.response.data.message
        };
      } else if (error.message) {
        return {
          success: false,
          error: error.message
        };
      } else {
        return {
          success: false,
          error: 'Registration failed. Please try again.'
        };
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUserWishlist = (wishlist) => {
    if (user) {
      setUser({
        ...user,
        wishlist
      });
    }
  };

  const value = {
    user,
    setUser,
    loading,
    login,
    register,
    logout,
    updateUserWishlist,
    refreshUser: fetchUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 