import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getWallpapers, deleteWallpaper } from '../services/wallpaperService';
import { getDashboardStats, getWallpaperStats } from '../services/adminService';
import { useNavigate } from 'react-router-dom';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalDownloads, setTotalDownloads] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard statistics from backend
        const dashboardStats = await getDashboardStats();
        setTotalDownloads(dashboardStats.totalDownloads);
        setTotalUsers(dashboardStats.totalUsers);
        
        // Fetch wallpapers with their download statistics
        const wallpaperStats = await getWallpaperStats();
        setWallpapers(wallpaperStats);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, isDeleting]);

  const handleEdit = (wallpaperId) => {
    navigate(`/edit-wallpaper/${wallpaperId}`);
  };

  const handleDelete = async (wallpaperId, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        setIsDeleting(true);
        await deleteWallpaper(wallpaperId);
        // Success notification
        const successNotification = document.createElement('div');
        successNotification.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg z-50';
        successNotification.textContent = `${title} deleted successfully!`;
        document.body.appendChild(successNotification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
          if (document.body.contains(successNotification)) {
            document.body.removeChild(successNotification);
          }
        }, 3000);
      } catch (error) {
        console.error('Error deleting wallpaper:', error);
        // Error notification
        const errorNotification = document.createElement('div');
        errorNotification.className = 'fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-md shadow-lg z-50';
        errorNotification.textContent = `Failed to delete ${title}. Please try again.`;
        document.body.appendChild(errorNotification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
          if (document.body.contains(errorNotification)) {
            document.body.removeChild(errorNotification);
          }
        }, 3000);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-red-600 dark:text-red-500">Access Denied</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-dark-text-secondary">
              You do not have permission to view this page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-6 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary mb-6">Admin Dashboard</h1>
        
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded relative mb-6">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400"></div>
          </div>
        ) : (
          <>
            {/* Stats overview */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
              <div className="bg-white dark:bg-dark-card overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-dark-text-secondary truncate">Total Wallpapers</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-dark-text-primary">{wallpapers.length}</dd>
                  </dl>
                </div>
              </div>
              
              <div className="bg-white dark:bg-dark-card overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-dark-text-secondary truncate">Total Downloads</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-dark-text-primary">{totalDownloads}</dd>
                  </dl>
                </div>
              </div>
              
              <div className="bg-white dark:bg-dark-card overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-dark-text-secondary truncate">Total Users</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-dark-text-primary">{totalUsers}</dd>
                  </dl>
                </div>
              </div>
            </div>
            
            {/* Wallpapers table */}
            <div className="bg-white dark:bg-dark-card shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-dark-text-primary">Wallpaper Statistics</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-dark-text-secondary">Detailed download stats for each wallpaper.</p>
              </div>
              <div className="border-t border-gray-200 dark:border-dark-border">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
                    <thead className="bg-gray-50 dark:bg-dark-border">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">Wallpaper</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">Category</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">Downloads</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">Unique Users</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-dark-border">
                      {wallpapers.map((wallpaper) => (
                        <tr key={wallpaper._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img className="h-10 w-10 rounded-md object-cover" src={wallpaper.imageUrl} alt={wallpaper.title} />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">{wallpaper.title}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-dark-text-primary">{wallpaper.category}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-dark-text-primary">{wallpaper.downloadCount}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-dark-text-primary">{wallpaper.uniqueUsers}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(wallpaper._id)}
                                className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                                title="Edit wallpaper"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(wallpaper._id, wallpaper.title)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                title="Delete wallpaper"
                                disabled={isDeleting}
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 