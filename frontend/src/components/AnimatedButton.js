import React from 'react';
import { motion } from 'framer-motion';

/**
 * AnimatedButton - A reusable button component with built-in animations
 *
 * @param {Object} props - Component props
 * @param {string} [props.type='primary'] - Button type/style (primary, secondary, outline, danger)
 * @param {string} [props.size='md'] - Button size (sm, md, lg)
 * @param {boolean} [props.isLoading=false] - Whether the button is in loading state
 * @param {string} [props.loadingText='Loading...'] - Text to display when loading
 * @param {React.ReactNode} props.children - Button content
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {boolean} [props.disabled=false] - Whether the button is disabled
 */
const AnimatedButton = ({
  type = 'primary',
  size = 'md',
  isLoading = false,
  loadingText = 'Loading...',
  children,
  className = '',
  disabled = false,
  ...rest
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'primary':
        return 'bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 text-white shadow-md';
      case 'secondary':
        return 'bg-gray-100 hover:bg-gray-200 dark:bg-dark-border dark:hover:bg-dark-border/80 text-gray-800 dark:text-dark-text-primary';
      case 'outline':
        return 'bg-transparent border border-primary-600 dark:border-primary-500 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white';
      default:
        return 'bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 text-white';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-3 py-1.5';
      case 'md':
        return 'text-sm px-4 py-2';
      case 'lg':
        return 'text-base px-6 py-3';
      default:
        return 'text-sm px-4 py-2';
    }
  };

  return (
    <motion.button
      className={`
        ${getTypeStyles()}
        ${getSizeStyles()}
        rounded-md
        font-medium
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
        transition-colors duration-200
        disabled:opacity-60 disabled:cursor-not-allowed
        inline-flex items-center justify-center
        ${className}
      `}
      whileHover={!disabled && !isLoading ? { scale: 1.03 } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.97 } : {}}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading && (
        <motion.svg 
          className="animate-spin -ml-1 mr-2 h-4 w-4" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </motion.svg>
      )}
      {isLoading ? loadingText : children}
    </motion.button>
  );
};

export default AnimatedButton; 