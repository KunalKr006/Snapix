import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getWallpaper, removeFromWishlist } from '../services/wallpaperService';
import WishlistButton from '../components/WishlistButton';
import { ArrowDownTrayIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedWallpaper, setSelectedWallpaper] = useState(null);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchWishlist();
  }, [user?.wishlist]);

  const fetchWishlist = async () => {
    if (!user?.wishlist?.length) {
      setWishlist([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const wallpapers = await Promise.all(
        user.wishlist.map(id => {
          const wallpaperId = typeof id === 'object' ? id._id : id;
          return getWallpaper(wallpaperId);
        })
      );
      setWishlist(wallpapers);
      setError('');
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setError('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (wallpaperId) => {
    try {
      setLoading(true);
      await removeFromWishlist(wallpaperId);
      
      // Update user state to reflect the change
      if (user && user.wishlist) {
        const updatedWishlist = user.wishlist.filter(id => {
          const idStr = typeof id === 'object' ? id._id : id;
          return idStr.toString() !== wallpaperId.toString();
        });
        
        setUser({
          ...user,
          wishlist: updatedWishlist
        });
        
        // Update local wishlist state
        setWishlist(prev => prev.filter(item => item._id.toString() !== wallpaperId.toString()));
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      setError('Failed to remove from wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleWallpaperClick = (wallpaper) => {
    setSelectedWallpaper(wallpaper);
  };

  const closeWallpaperModal = () => {
    setSelectedWallpaper(null);
  };

  const handleDownload = async (url, title, wallpaperId, e) => {
    if (e) e.stopPropagation();
    
    try {
      // Skip download for admin users
      if (isAdmin) return;

      // Show downloading feedback
      const notification = document.createElement('div');
      notification.className = 'fixed bottom-4 right-4 bg-primary-600 text-white px-4 py-2 rounded-md shadow-lg z-50';
      notification.textContent = `Downloading ${title}...`;
      document.body.appendChild(notification);
      
      // Track download in backend
      try {
        await api.post(`/api/wallpapers/${wallpaperId}/download`);
      } catch (error) {
        console.error('Failed to track download:', error);
        // Continue with download even if tracking fails
      }
      
      // For images on different domains, fetch the image first
      fetch(url)
        .then(response => response.blob())
        .then(blob => {
          // Create a blob URL from the fetched image
          const blobUrl = window.URL.createObjectURL(blob);
          
          // Create a temporary anchor element
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = `${title.replace(/\s+/g, '-').toLowerCase()}.jpg`;
          link.style.display = 'none';
          document.body.appendChild(link);
          
          // Trigger click event to start download
          link.click();
          
          // Clean up
          setTimeout(() => {
            window.URL.revokeObjectURL(blobUrl);
            document.body.removeChild(link);
            document.body.removeChild(notification);
            
            // Show success notification
            const successNotification = document.createElement('div');
            successNotification.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg z-50';
            successNotification.textContent = `${title} downloaded successfully!`;
            document.body.appendChild(successNotification);
            
            // Remove success notification after 3 seconds
            setTimeout(() => {
              if (document.body.contains(successNotification)) {
                document.body.removeChild(successNotification);
              }
            }, 3000);
          }, 100);
        })
        .catch(error => {
          console.error('Download failed:', error);
          document.body.removeChild(notification);
          
          // Show error notification
          const errorNotification = document.createElement('div');
          errorNotification.className = 'fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-md shadow-lg z-50';
          errorNotification.textContent = `Failed to download ${title}. Please try again.`;
          document.body.appendChild(errorNotification);
          
          // Remove error notification after 3 seconds
          setTimeout(() => {
            if (document.body.contains(errorNotification)) {
              document.body.removeChild(errorNotification);
            }
          }, 3000);
        });
    } catch (error) {
      console.error('Download error:', error);
      alert(`Failed to download. Please try again later.`);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary">Please log in to view your profile</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-dark-card shadow rounded-lg p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">{user.username}</h2>
              <p className="text-gray-600 dark:text-dark-text-secondary">{user.email}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-4">My Wishlist</h3>
          
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded relative mb-8" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400"></div>
            </div>
          ) : wishlist.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-dark-card rounded-lg">
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-dark-text-primary">No wallpapers in wishlist</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-dark-text-secondary">
                Add wallpapers to your wishlist by clicking the heart icon in the gallery.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {wishlist.map((wallpaper) => (
                <motion.div
                  key={wallpaper._id}
                  className="bg-white dark:bg-dark-card overflow-hidden shadow rounded-lg relative group cursor-pointer"
                  whileHover={{ y: -5 }}
                  onClick={() => handleWallpaperClick(wallpaper)}
                >
                  <div className="absolute top-2 right-2 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFromWishlist(wallpaper._id);
                      }}
                      className="p-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/40 shadow-sm transition-colors"
                      title="Remove from wishlist"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                  <img
                    src={wallpaper.imageUrl}
                    alt={wallpaper.title}
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  
                  {/* Overlay that appears on hover */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-end justify-end p-3">
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {!isAdmin && (
                        <motion.button
                          onClick={(e) => handleDownload(wallpaper.imageUrl, wallpaper.title, wallpaper._id, e)}
                          className="p-2 rounded-full bg-white dark:bg-dark-card text-primary-600 dark:text-primary-400 hover:bg-gray-100 dark:hover:bg-dark-border shadow-lg transition-colors duration-200"
                          title={`Download ${wallpaper.title}`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <ArrowDownTrayIcon className="h-5 w-5" />
                        </motion.button>
                      )}
                    </div>
                  </div>
                  
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary">{wallpaper.title}</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-dark-text-secondary">{wallpaper.category}</p>
                    {wallpaper.description && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-dark-text-secondary line-clamp-2">
                        {wallpaper.description}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Wallpaper Modal */}
      <AnimatePresence>
        {selectedWallpaper && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeWallpaperModal}
          >
            <motion.div 
              className="relative max-w-4xl w-full bg-white dark:bg-dark-card rounded-lg overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <img 
                  src={selectedWallpaper.imageUrl} 
                  alt={selectedWallpaper.title}
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
                <button 
                  className="absolute top-4 right-4 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-colors duration-200"
                  onClick={closeWallpaperModal}
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-1">{selectedWallpaper.title}</h3>
                    <span className="inline-block px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-300 text-sm font-medium">
                      {selectedWallpaper.category}
                    </span>
                    {selectedWallpaper.description && (
                      <p className="mt-3 text-gray-600 dark:text-dark-text-secondary">{selectedWallpaper.description}</p>
                    )}
                  </div>
                  
                  {!isAdmin && (
                    <motion.button
                      onClick={(e) => handleDownload(selectedWallpaper.imageUrl, selectedWallpaper.title, selectedWallpaper._id, e)}
                      className="inline-flex items-center px-4 py-2 rounded-md bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 text-white font-medium transition-colors duration-200 shadow-md"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                      Download
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile; 