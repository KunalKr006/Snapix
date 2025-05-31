import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Email validation function
  const validateEmail = (email) => {
    const validDomains = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com'];
    const domain = email.split('@')[1];
    return validDomains.includes(domain);
  };

  // Password validation function
  const validatePassword = (password) => {
    // At least 6 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special character
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
  
  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (!validatePassword(password)) {
      return setError('Password must be at least 6 characters with 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character');
    }

    if (username.length < 3) {
      return setError('Username must be at least 3 characters long');
    }

    if (!validateEmail(email)) {
      return setError('Email domain not supported. Please use Gmail, Outlook, Hotmail, Yahoo, or iCloud.');
    }

    setLoading(true);

    try {
      const result = await register(username, email, password);
      
      if (result && result.token) {
        navigate('/');
      } else {
        setError(result?.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to create an account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-dark-bg py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <motion.div
        className="flex flex-col items-center mb-6 sm:mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.img
          src="/SNAPIX.png"
          alt="Snapix Logo"
          className="h-14 w-auto sm:h-16 md:h-20"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        />
      </motion.div>
      <motion.div 
        className="max-w-md w-full space-y-6 bg-white dark:bg-dark-card p-6 rounded-lg shadow-lg sm:p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <motion.h2 
            className="mt-2 text-center text-2xl font-extrabold text-gray-900 dark:text-dark-text-primary sm:text-3xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Create your account
          </motion.h2>
        </div>
        <motion.form 
          className="mt-8 space-y-4 sm:space-y-6" 
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {error && (
            <motion.div 
              className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded relative text-sm" 
              role="alert"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <span className="block sm:inline">{error}</span>
            </motion.div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
                Username
              </label>
              <motion.input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-dark-border placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-dark-text-primary dark:bg-dark-card rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 text-sm sm:text-base transition-all duration-200"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                minLength={3}
                whileFocus={{ scale: 1.01 }}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Must be at least 3 characters long
              </p>
            </div>
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
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-dark-border placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-dark-text-primary dark:bg-dark-card focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 text-sm sm:text-base transition-all duration-200"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                whileFocus={{ scale: 1.01 }}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Use Gmail, Outlook, Hotmail, Yahoo, or iCloud email
              </p>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
                Password
              </label>
              <motion.input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-dark-border placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-dark-text-primary dark:bg-dark-card focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 text-sm sm:text-base transition-all duration-200"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                whileFocus={{ scale: 1.01 }}
              />
              {password && (
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Min. 6 characters with uppercase, lowercase, number & special character
                  </p>
                  <p className={`text-xs font-medium ${passwordStrength.color}`}>
                    {passwordStrength.text}
                  </p>
                </div>
              )}
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
                Confirm Password
              </label>
              <motion.input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-dark-border placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-dark-text-primary dark:bg-dark-card rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 text-sm sm:text-base transition-all duration-200"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                whileFocus={{ scale: 1.01 }}
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-xs text-red-500">
                  Passwords do not match
                </p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <motion.button
              type="submit"
              disabled={loading}
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
                  Creating account...
                </>
              ) : 'Sign up'}
            </motion.button>
          </div>

          <div className="text-sm text-center mt-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
            >
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-200">
                Already have an account? Sign in
              </Link>
            </motion.div>
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default Register; 