import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { addToWishlist, removeFromWishlist } from '../services/wallpaperService';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import LoginPromptModal from './LoginPromptModal';

const WishlistButton = ({ wallpaperId }) => {
  const { user, setUser } = useAuth();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const navigate = useNavigate();

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

  const handleWishlistClick = async (e) => {
    e.stopPropagation();
    
    // Check if user is logged in
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isInWishlist) {
        await removeFromWishlist(wallpaperId);
        // Update user state to reflect the change
        if (user && user.wishlist) {
          const updatedWishlist = user.wishlist.filter(id => {
            const idStr = typeof id === 'object' ? id._id : id;
            return idStr && idStr.toString() !== wallpaperId.toString();
          });
          setUser({
            ...user,
            wishlist: updatedWishlist
          });
        }
      } else {
        await addToWishlist(wallpaperId);
        // Update user state to reflect the change
        if (user) {
          setUser({
            ...user,
            wishlist: [...(user.wishlist || []), wallpaperId]
          });
        }
      }
    } catch (err) {
      console.error('Wishlist error:', err);
      setError(err.message || 'Failed to update wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmLogin = () => {
    setShowLoginPrompt(false);
    navigate('/login');
  };

  const handleCancelLogin = () => {
    setShowLoginPrompt(false);
  };

  return (
    <>
      <motion.button
        onClick={handleWishlistClick}
        disabled={loading}
        className={`p-2 rounded-full shadow-lg transition-colors duration-200 ${
          isInWishlist
            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/40'
            : 'bg-white dark:bg-dark-card text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title={user ? (isInWishlist ? 'Remove from wishlist' : 'Add to wishlist') : 'Login to add to wishlist'}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill={isInWishlist ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            fillRule="evenodd"
            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
            clipRule="evenodd"
          />
        </svg>
      </motion.button>

      <LoginPromptModal
        message="Please login to add wallpapers to your wishlist. Would you like to login now?"
        onConfirm={handleConfirmLogin}
        onCancel={handleCancelLogin}
        show={showLoginPrompt}
      />
    </>
  );
};

export default WishlistButton; 