import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { resetPassword } from '../services/authService';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [remainingTime, setRemainingTime] = useState(900); // 15 minutes in seconds
  const [timerActive, setTimerActive] = useState(false);

  // Password validation function
  const validatePassword = (password) => {
    // Minimum 6 characters, at least one uppercase letter, one lowercase letter, one number, and one special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&:#])[A-Za-z\d@$!%*?&:#]{6,}$/;
    return passwordRegex.test(password);
  };

  // Email validation function
  const validateEmail = (email) => {
    const validDomains = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com'];
    const emailParts = email.split('@');
    if (emailParts.length !== 2) return false;
    return validDomains.includes(emailParts[1]);
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

  // Format remaining time as MM:SS
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Start the timer when component mounts if email exists
  useEffect(() => {
    if (email) {
      setTimerActive(true);
    }
  }, [email]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (timerActive && remainingTime > 0) {
      interval = setInterval(() => {
        setRemainingTime(prev => prev - 1);
      }, 1000);
    } else if (remainingTime <= 0) {
      setTimerActive(false);
      setError('Verification code has expired. Please request a new one.');
    }
    return () => clearInterval(interval);
  }, [timerActive, remainingTime]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validate email domain
    if (!validateEmail(email)) {
      setError('Email domain not supported. Please use Gmail, Outlook, Hotmail, Yahoo, or iCloud.');
      return;
    }

    // Validate password match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (!validatePassword(newPassword)) {
      setError('Password must be at least 6 characters with 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character');
      return;
    }

    // Validate OTP format
    if (!/^\d{6}$/.test(otp)) {
      setError('Please enter a valid 6-digit verification code');
      return;
    }

    // Check if timer expired
    if (remainingTime <= 0) {
      setError('Verification code has expired. Please request a new one.');
      return;
    }

    setLoading(true);

    try {
      const response = await resetPassword(email, otp, newPassword);
      setIsSuccess(true);
      setMessage(response.message || 'Password has been reset successfully');
      setTimerActive(false);

      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/login');
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
            Reset Your Password
          </motion.h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-dark-text-secondary">
            Enter the verification code sent to your email and create a new password.
          </p>
          {timerActive && (
            <p className="mt-2 text-center text-sm font-medium text-orange-500 dark:text-orange-400">
              Code expires in: {formatTime(remainingTime)}
            </p>
          )}
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
                <p className="text-xs mt-1">Redirecting to login page...</p>
              )}
            </motion.div>
          )}
          
          <div className="space-y-4">
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
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (!timerActive && validateEmail(e.target.value)) {
                    setTimerActive(true);
                    setRemainingTime(900); // Reset timer to 15 minutes
                  }
                }}
                whileFocus={{ scale: 1.01 }}
                disabled={loading || isSuccess}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Use Gmail, Outlook, Hotmail, Yahoo, or iCloud email
              </p>
            </div>
            
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
                Verification Code
              </label>
              <motion.input
                id="otp"
                name="otp"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-dark-border placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-dark-text-primary dark:bg-dark-card rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-all duration-200"
                placeholder="6-digit verification code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                whileFocus={{ scale: 1.01 }}
                maxLength={6}
                pattern="[0-9]{6}"
                disabled={loading || isSuccess}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Enter the 6-digit code sent to your email
              </p>
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
                Confirm Password
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
              disabled={loading || isSuccess || remainingTime <= 0}
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
                  Resetting...
                </>
              ) : (
                'Reset Password'
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
              <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-200">
                Request new code
              </Link>
            </motion.div>
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default ResetPassword; 