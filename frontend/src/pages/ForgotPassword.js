import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { requestPasswordReset } from '../services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Email validation function
  const validateEmail = (email) => {
    const validDomains = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com'];
    const emailParts = email.split('@');
    if (emailParts.length !== 2) return false;
    return validDomains.includes(emailParts[1]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validate email domain
    if (!validateEmail(email)) {
      setError('Email domain not supported. Please use Gmail, Outlook, Hotmail, Yahoo, or iCloud.');
      return;
    }

    setLoading(true);

    try {
      const response = await requestPasswordReset(email);
      setIsSuccess(true);
      setMessage(response.message || 'Password reset instructions sent to your email.');
      
      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/reset-password', { state: { email } });
      }, 3000);
    } catch (err) {
      setIsSuccess(false);
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

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
            Forgot Your Password?
          </motion.h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-dark-text-secondary">
            Enter your email address and we'll send you a verification code to reset your password.
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
                <p className="text-xs mt-1">Redirecting to reset password page...</p>
              )}
            </motion.div>
          )}
          
          <div>
            <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
              Email address
            </label>
            <motion.input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-dark-border placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-dark-text-primary dark:bg-dark-card rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-all duration-200"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              whileFocus={{ scale: 1.01 }}
              disabled={loading || isSuccess}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Use Gmail, Outlook, Hotmail, Yahoo, or iCloud email
            </p>
          </div>

          <div className="text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              <span role="img" aria-label="info">ℹ️</span> A 6-digit verification code will be sent to your email
            </div>
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
                  Sending...
                </>
              ) : (
                'Send Reset Code'
              )}
            </motion.button>
          </div>

          <div className="flex items-center justify-between mt-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-sm"
            >
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-200">
                ← Back to login
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-sm"
            >
              <Link to="/reset-password" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-200">
                Already have a code?
              </Link>
            </motion.div>
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default ForgotPassword; 