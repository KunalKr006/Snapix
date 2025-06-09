import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LoginPromptModal = ({ message, onConfirm, onCancel, show }) => {
  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white dark:bg-dark-card rounded-lg shadow-xl p-6 max-w-sm w-full text-center"
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-4">Login Required</h3>
            <p className="text-gray-700 dark:text-dark-text-secondary mb-6">{message}</p>
            <div className="flex justify-center space-x-4">
              <motion.button
                onClick={onConfirm}
                className="px-5 py-2 rounded-md bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 text-white font-medium transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Login
              </motion.button>
              <motion.button
                onClick={onCancel}
                className="px-5 py-2 rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-dark-border dark:hover:bg-dark-border-hover text-gray-800 dark:text-dark-text-primary font-medium transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginPromptModal; 