import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { changePassword } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { token } = useAuth();

  // Password validation function
  const validatePassword = (password) => {
    // Minimum 6 characters, at least one uppercase letter, one lowercase letter, one number, and one special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&:#])[A-Za-z\d@$!%*?&:#]{6,}$/;
    return passwordRegex.test(password);
  };

  // Password strength indicators
  const getPasswordStrength = (password) => {
    if (!password) return { text: '', color: '' };
    if (password.length < 6) return { text: 'Too weak', color: 'text-red-500' };
    
    let strength = 0;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[@$!%*?&:#]/.test(password)) strength++;
    
    if (strength === 4) return { text: 'Strong', color: 'text-green-500' };
    if (strength === 3) return { text: 'Good', color: 'text-yellow-500' };
    return { text: 'Weak', color: 'text-red-500' };
  };
  
  const passwordStrength = getPasswordStrength(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    // Validate password strength
    if (!validatePassword(newPassword)) {
      setError('Password must be at least 6 characters with 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character');
      return;
    }

    // Check if new password is same as current
    if (currentPassword === newPassword) {
      setError('New password must be different from your current password');
      return;
    }

    setLoading(true);

    try {
      const response = await changePassword(currentPassword, newPassword);
      setIsSuccess(true);
      setMessage(response.message || 'Password has been changed successfully');
      
      // Clear form fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/profile');
      }, 3000);
    } catch (err) {
      setIsSuccess(false);
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  // Redirect if not logged in
  if (!token) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <motion.div 
        className="max-w-md w-full space-y-8 bg-white dark:bg-dark-card p-8 rounded-lg shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <motion.h2 
            className="mt-2 text-center text-3xl font-extrabold text-gray-900 dark:text-dark-text-primary"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Change Your Password
          </motion.h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-dark-text-secondary">
            Update your password to keep your account secure
          </p>
        </div>
        
        <motion.form 
          className="mt-8 space-y-6" 
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {error && (
            <motion.div 
              className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded relative" 
              role="alert"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <span className="block sm:inline">{error}</span>
            </motion.div>
          )}
          
          {message && (
            <motion.div 
              className={`${isSuccess ? 'bg-green-100 dark:bg-green-900/30 border-green-400 dark:border-green-700 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 border-red-400 dark:border-red-700 text-red-700 dark:text-red-400'} px-4 py-3 rounded relative border`}
              role="alert"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <span className="block sm:inline">{message}</span>
              {isSuccess && (
                <p className="text-xs mt-1">Redirecting to profile page...</p>
              )}
            </motion.div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
                Current Password
              </label>
              <motion.input
                id="current-password"
                name="currentPassword"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-dark-border placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-dark-text-primary dark:bg-dark-card rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-all duration-200"
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                whileFocus={{ scale: 1.01 }}
                disabled={loading || isSuccess}
              />
            </div>
            
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
                New Password
              </label>
              <motion.input
                id="new-password"
                name="newPassword"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-dark-border placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-dark-text-primary dark:bg-dark-card rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-all duration-200"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                whileFocus={{ scale: 1.01 }}
                disabled={loading || isSuccess}
                minLength={6}
              />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Min. 6 characters with uppercase, lowercase, number & special character
                </p>
                {newPassword && (
                  <p className={`text-xs font-medium ${passwordStrength.color}`}>
                    {passwordStrength.text}
                  </p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
                Confirm New Password
              </label>
              <motion.input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-dark-border placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-dark-text-primary dark:bg-dark-card rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-all duration-200"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                whileFocus={{ scale: 1.01 }}
                disabled={loading || isSuccess}
                minLength={6}
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="mt-1 text-xs text-red-500">
                  Passwords do not match
                </p>
              )}
            </div>
          </div>

          <div>
            <motion.button
              type="submit"
              disabled={loading || isSuccess}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-700 dark:hover:bg-primary-600 transition-colors duration-200 disabled:opacity-70"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <>
                  <motion.svg 
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </motion.svg>
                  Updating...
                </>
              ) : (
                'Change Password'
              )}
            </motion.button>
          </div>

          <div className="mt-4 text-center">
            <motion.button
              type="button"
              className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-200"
              onClick={() => navigate('/profile')}
              whileHover={{ scale: 1.05 }}
            >
              ← Back to Profile
            </motion.button>
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default ChangePassword; 