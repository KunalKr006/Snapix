import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LoginPromptModal = ({ message, onConfirm, onCancel, show }) => {
  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="surface-card max-w-sm w-full p-6 text-center"
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Login Required</h3>
            <p className="text-slate-300 mb-6">{message}</p>
            <div className="flex justify-center space-x-4">
              <motion.button
                onClick={onConfirm}
                className="rounded-xl bg-primary-600 px-5 py-2 text-white font-medium shadow-lg shadow-primary-900/20 transition-colors duration-200 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Login
              </motion.button>
              <motion.button
                onClick={onCancel}
                className="rounded-xl border border-white/20 bg-white/10 px-5 py-2 font-medium text-slate-100 transition-colors duration-200 hover:bg-white/20"
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
