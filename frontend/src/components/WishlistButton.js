import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { addToWishlist, removeFromWishlist } from '../services/wallpaperService';
import { motion } from 'framer-motion';

const WishlistButton = ({ wallpaperId }) => {
  const { user, setUser } = useAuth();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && user.wishlist) {
      // Convert both IDs to strings for comparison
      const isInList = user.wishlist.some(id => {
        const idStr = typeof id === 'object' ? id._id : id;
        return idStr && idStr.toString() === wallpaperId.toString();
      });
      setIsInWishlist(isInList);
    } else {
      setIsInWishlist(false);
    }
  }, [user, wallpaperId]);

  const handleToggleWishlist = async (e) => {
    if (e) e.preventDefault();
    
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      if (isInWishlist) {
        await removeFromWishlist(wallpaperId);
        
        // Update user state
        const updatedWishlist = user.wishlist.filter(id => {
          const idStr = typeof id === 'object' ? id._id : id;
          return idStr.toString() !== wallpaperId.toString();
        });
        
        setUser({
          ...user,
          wishlist: updatedWishlist
        });
        setIsInWishlist(false);
      } else {
        await addToWishlist(wallpaperId);
        
        // Update user state
        const newWishlistItem = typeof wallpaperId === 'object' ? wallpaperId : { _id: wallpaperId };
        const updatedWishlist = [...user.wishlist, newWishlistItem];
        
        setUser({
          ...user,
          wishlist: updatedWishlist
        });
        setIsInWishlist(true);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      setError(error.message || 'Failed to update wishlist');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      <motion.button
        onClick={handleToggleWishlist}
        disabled={loading}
        className={`p-2 rounded-full ${
          isInWishlist
            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/40'
            : 'bg-white dark:bg-dark-card text-gray-600 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-border'
        } shadow-lg transition-colors duration-200`}
        title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 1 }}
        animate={isInWishlist ? { 
          scale: [1, 1.2, 1],
          transition: { duration: 0.3 }
        } : { scale: 1 }}
      >
        {loading ? (
          <motion.div 
            className="h-5 w-5 border-2 border-red-200 dark:border-red-900/30 border-t-red-600 dark:border-t-red-400 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        ) : (
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill={isInWishlist ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={isInWishlist ? "0" : "1.5"}
            initial={{ scale: 1 }}
            animate={isInWishlist ? { 
              scale: [1, 1.2, 1],
              transition: { duration: 0.3 }
            } : { scale: 1 }}
          >
            <path
              fillRule="evenodd"
              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
              clipRule="evenodd"
            />
          </motion.svg>
        )}
      </motion.button>
      {error && (
        <motion.div 
          className="absolute top-full left-0 mt-1 text-red-500 dark:text-red-400 text-sm bg-white dark:bg-dark-card p-1 rounded shadow-md z-20"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          {error}
        </motion.div>
      )}
    </div>
  );
};

export default WishlistButton; 