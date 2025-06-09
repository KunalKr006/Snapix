import React, { useState, useEffect } from 'react';
import { getWallpapers } from '../services/wallpaperService';
import WishlistButton from '../components/WishlistButton';
import { useAuth } from '../context/AuthContext';
import { ArrowDownTrayIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollAnimation from '../components/ScrollAnimation';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import LoginPromptModal from '../components/LoginPromptModal';

const CATEGORIES = ['All', 'Nature', 'Abstract', 'Animals', 'Architecture', 'Technology', 'Space', 'Landscape'];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.6 }
  }
};

const Home = () => {
  const { user } = useAuth();
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [error, setError] = useState('');
  const [selectedWallpaper, setSelectedWallpaper] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const wallpapersPerPage = isMobile ? 8 : 16;
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';

  // Add resize listener to update isMobile state
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchWallpapers(true);
  }, [selectedCategory, isMobile]);

  const fetchWallpapers = async (reset = false, newPageValue = null) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }
      
      setError('');
      
      // Use the new page value if provided (from handleLoadMore), otherwise use the state value
      const currentPage = reset ? 1 : (newPageValue || page);
      const category = selectedCategory === 'All' ? '' : selectedCategory;
      
      // Fetch all wallpapers matching the search criteria
      const allWallpapers = await getWallpapers(category, searchTerm);
      
      // Use an array of unique IDs to prevent duplication
      const uniqueWallpaperMap = new Map();
      
      // If not resetting, add existing wallpapers to the map first to maintain state
      if (!reset) {
        wallpapers.forEach(wallpaper => {
          uniqueWallpaperMap.set(wallpaper._id, wallpaper);
        });
      }
      
      // Calculate which wallpapers to show based on pagination
      const paginationLimit = currentPage * wallpapersPerPage;
      const wallpapersToShow = allWallpapers.slice(0, paginationLimit);
      
      // Add new wallpapers to the map (will automatically replace duplicates)
      wallpapersToShow.forEach(wallpaper => {
        uniqueWallpaperMap.set(wallpaper._id, wallpaper);
      });
      
      // Convert the map back to an array and sort by creation date (newest first)
      const uniqueWallpapers = Array.from(uniqueWallpaperMap.values())
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      // Update state with the unique wallpapers
      setWallpapers(uniqueWallpapers);
      
      // Check if there are more wallpapers to load
      setHasMore(paginationLimit < allWallpapers.length);
      
    } catch (error) {
      console.error('Error fetching wallpapers:', error);
      setError('Failed to load wallpapers. Please try again later.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    // Increment the page and then immediately use the new value in fetchWallpapers
    const newPage = page + 1;
    setPage(newPage);
    fetchWallpapers(false, newPage);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchWallpapers(true);
  };

  const handleDownload = async (url, title, wallpaperId, e) => {
    if (e) e.stopPropagation();
    
    // Check if user is logged in
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    
    try {
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

  const handleConfirmLogin = () => {
    setShowLoginPrompt(false);
    navigate('/login');
  };

  const handleCancelLogin = () => {
    setShowLoginPrompt(false);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleWallpaperClick = (wallpaper) => {
    setSelectedWallpaper(wallpaper);
  };

  const closeWallpaperModal = () => {
    setSelectedWallpaper(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-6 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        <ScrollAnimation type="zoom-in" duration={1000}>
          <motion.div 
            className="text-center mb-10"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <motion.h1 
              className="text-5xl font-extrabold text-gray-900 dark:text-dark-text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-primary-800 dark:from-primary-400 dark:to-primary-600"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Snapix Wallpapers
            </motion.h1>
            <motion.p 
              className="mt-4 text-xl text-gray-600 dark:text-dark-text-secondary max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Discover and download beautiful wallpapers for your devices
            </motion.p>
          </motion.div>
        </ScrollAnimation>

        {/* Search and Filter */}
        <ScrollAnimation type="fade-up" delay={200}>
          <motion.div 
            className="bg-white dark:bg-dark-card shadow-lg rounded-lg p-4 mb-8 sm:p-6 sm:mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="flex flex-col space-y-4 sm:space-y-6">
              <div className="flex-1">
                <form onSubmit={handleSearch} className="flex items-center">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search wallpapers..."
                    className="block w-full rounded-l-md border-gray-300 dark:border-dark-border dark:bg-dark-card dark:text-dark-text-primary shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-all duration-200 bg-transparent px-3 py-2 text-sm sm:text-base"
                  />
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 ml-2"
                  >
                    Search
                  </motion.button>
                </form>
              </div>
              
              <div className="flex overflow-x-auto pb-2 hide-scrollbar">
                <div className="flex space-x-2 min-w-max">
                  {CATEGORIES.map((category) => (
                    <motion.button
                      key={category}
                      onClick={() => handleCategorySelect(category)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-200 whitespace-nowrap ${
                        selectedCategory === category 
                          ? 'bg-primary-600 text-white dark:bg-primary-700' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-border dark:text-dark-text-secondary dark:hover:bg-dark-border/80'
                      }`}
                    >
                      {category}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </ScrollAnimation>

        {/* Error Message */}
        {error && (
          <motion.div 
            className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <span className="block sm:inline">{error}</span>
          </motion.div>
        )}

        {/* Content Area - Add min-height to ensure consistent UI */}
        <div className="min-h-[400px] relative z-0">
          {/* Loading Indicator */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <motion.div 
                className="h-16 w-16 border-4 border-primary-200 dark:border-primary-900/30 border-t-primary-600 dark:border-t-primary-400 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
          ) : wallpapers.length === 0 ? (
            <ScrollAnimation type="fade-up">
              <motion.div 
                className="text-center py-16 bg-white dark:bg-dark-card rounded-lg shadow-lg"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="mt-2 text-xl font-medium text-gray-900 dark:text-dark-text-primary">No wallpapers found</h3>
                <p className="mt-2 text-gray-500 dark:text-dark-text-secondary">Try a different search term or category.</p>
              </motion.div>
            </ScrollAnimation>
          ) : (
            <>
              <motion.div 
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {wallpapers.map((wallpaper, index) => (
                  <ScrollAnimation 
                    key={wallpaper._id}
                    type="fade-up" 
                    delay={index * 50}
                    duration={600}
                  >
                    <motion.div
                      className="aspect-[3/4] bg-white dark:bg-dark-card overflow-hidden shadow-lg rounded-lg relative group cursor-pointer transition-all duration-200 hover:shadow-xl"
                      variants={itemVariants}
                      whileHover={{ y: -5 }}
                      onClick={() => handleWallpaperClick(wallpaper)}
                    >
                      <motion.img
                        src={wallpaper.imageUrl}
                        alt={wallpaper.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      
                      {/* Wishlist Button - show for all users */}
                      <div onClick={(e) => e.stopPropagation()} className="z-10 absolute bottom-2 right-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <WishlistButton wallpaperId={wallpaper._id} />
                      </div>

                      {/* Overlay that appears on hover - removed download button */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300">
                      </div>
                    </motion.div>
                  </ScrollAnimation>
                ))}
              </motion.div>
              
              {/* Load More Button */}
              {hasMore && (
                <div className="flex justify-center mt-10">
                  <motion.button
                    onClick={handleLoadMore}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 text-white font-medium rounded-md shadow-md transition-colors duration-200 flex items-center"
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading...
                      </>
                    ) : (
                      `Load More`
                    )}
                  </motion.button>
                </div>
              )}
            </>
          )}
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

        <LoginPromptModal
          message="Please login to download wallpapers. Would you like to login now?"
          onConfirm={handleConfirmLogin}
          onCancel={handleCancelLogin}
          show={showLoginPrompt}
        />

        {/* Footer */}
        <footer className="mt-20 pt-10 border-t border-gray-200 dark:border-dark-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text-primary mb-4">Snapix</h3>
              <p className="text-gray-600 dark:text-dark-text-secondary">
                Discover and download beautiful wallpapers for your devices. High-quality backgrounds for any screen.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text-primary mb-4">Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors duration-200">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors duration-200">
                    About Us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text-primary mb-4">Connect With Us</h3>
              <div className="flex space-x-4">
                <a href="mailto:aayush.kunal21@gmail.com" className="text-gray-600 dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="https://instagram.com/frame_o_k2" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-100 dark:border-dark-border/30 text-center">
            <p className="text-gray-500 dark:text-dark-text-secondary text-sm">
              &copy; {new Date().getFullYear()} Snapix. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home; 