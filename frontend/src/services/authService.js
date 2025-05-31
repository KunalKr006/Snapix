import axios from 'axios';

const API_URL = 'http://localhost:5050/api';

export const register = async (username, email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, {
      username,
      email,
      password
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Registration failed';
  }
};

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Login failed';
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await axios.get(`${API_URL}/auth/me`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to get user data';
  }
};

// Request password reset OTP to be sent via email
export const requestPasswordReset = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/auth/forgot-password`, {
      email
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to request password reset';
  }
};

// Verify OTP and set new password
export const resetPassword = async (email, otp, newPassword) => {
  try {
    const response = await axios.post(`${API_URL}/auth/reset-password`, {
      email,
      otp,
      newPassword
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to reset password';
  }
};

// Change password when logged in
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await axios.post(`${API_URL}/auth/change-password`, {
      currentPassword,
      newPassword
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to change password';
  }
}; 