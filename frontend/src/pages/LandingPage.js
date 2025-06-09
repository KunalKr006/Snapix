import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const LandingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Automatically redirect to home page after animation
    const timer = setTimeout(() => {
      navigate('/home');
    }, 2000); // Increased to 2 seconds to allow animation to complete
    
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg dark:to-dark-card p-4">
      <motion.div 
        className="text-center max-w-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Logo */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <motion.img 
            src="/SNAPIX.png" 
            alt="Snapix Logo" 
            className="mx-auto h-24 md:h-32 mb-4"
            whileHover={{ scale: 1.05 }}
          />
          <div className="h-1.5 w-48 md:w-64 bg-gradient-to-r from-primary-500 to-primary-700 dark:from-primary-400 dark:to-primary-600 mx-auto rounded-full"></div>
        </motion.div>
        
        {/* Tagline */}
        <motion.p 
          className="text-xl md:text-2xl text-gray-600 dark:text-dark-text-secondary font-light"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Discover and download beautiful wallpapers for all your devices
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LandingPage; 