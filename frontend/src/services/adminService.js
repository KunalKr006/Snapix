import api from './api';

/**
 * Fetch admin dashboard statistics
 * @returns {Promise<Object>} Dashboard statistics including total users, downloads, and wallpapers with stats
 */
export const getDashboardStats = async () => {
  try {
    const response = await api.get('/admin/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    throw error;
  }
};

/**
 * Fetch wallpaper statistics with download counts
 * @returns {Promise<Array>} Array of wallpapers with download statistics
 */
export const getWallpaperStats = async () => {
  try {
    const response = await api.get('/admin/wallpaper-stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching wallpaper statistics:', error);
    throw error;
  }
}; 