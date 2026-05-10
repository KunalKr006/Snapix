import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getWallpapers, deleteWallpaper } from '../services/wallpaperService';
import { getDashboardStats, getWallpaperStats, getUsers } from '../services/adminService';
import { useNavigate } from 'react-router-dom';
import { PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wallpapers, setWallpapers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalDownloads, setTotalDownloads] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard statistics from backend
        const dashboardStats = await getDashboardStats();
        setTotalDownloads(dashboardStats.totalDownloads);
        setTotalUsers(dashboardStats.totalUsers);
        setTotalRevenue(dashboardStats.totalRevenue || 0);
        
        // Fetch wallpapers with their download statistics
        const wallpaperStats = await getWallpaperStats();
        setWallpapers(wallpaperStats);
        
        // Fetch list of users
        const usersList = await getUsers();
        setUsers(usersList);
        
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

  const UsersModal = () => {
    if (!showUsersModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="rounded-lg border border-white/20 bg-black/70 backdrop-blur-md shadow-xl shadow-black/40 w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h3 className="text-lg font-medium text-slate-100">Registered Users</h3>
            <button
              onClick={() => setShowUsersModal(false)}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="p-4 overflow-y-auto max-h-[calc(90vh-8rem)]">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-white/5">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Username</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Role</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Joined</th>
                  </tr>
                </thead>
                <tbody className="bg-transparent divide-y divide-white/10">
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-900/30 flex items-center justify-center">
                            <span className="text-lg font-medium text-primary-300">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-100">{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-100">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-purple-900/30 text-purple-300' 
                            : 'bg-green-900/30 text-green-300'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="app-shell py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-red-600 dark:text-red-500">Access Denied</h2>
            <p className="mt-4 text-lg text-slate-300">
              You do not have permission to view this page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="section-title mb-6">Admin Dashboard</h1>
        
        {error && (
          <div className="bg-red-900/25 border border-red-700/70 text-red-300 px-4 py-3 rounded relative mb-6">
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
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <div className="surface-card overflow-hidden">
                <div className="px-4 py-5 sm:p-6">
                  <dl>
                    <dt className="text-sm font-medium text-slate-400 truncate">Total Wallpapers</dt>
                    <dd className="mt-1 text-3xl font-semibold text-slate-100">{wallpapers.length}</dd>
                  </dl>
                </div>
              </div>
              
              <div className="surface-card overflow-hidden">
                <div className="px-4 py-5 sm:p-6">
                  <dl>
                    <dt className="text-sm font-medium text-slate-400 truncate">Total Downloads</dt>
                    <dd className="mt-1 text-3xl font-semibold text-slate-100">{totalDownloads}</dd>
                  </dl>
                </div>
              </div>
              
              <div className="surface-card overflow-hidden">
                <div className="px-4 py-5 sm:p-6">
                  <dl>
                    <dt className="text-sm font-medium text-slate-400 truncate">Total Revenue</dt>
                    <dd className="mt-1 text-3xl font-semibold text-slate-100">₹{totalRevenue.toFixed(2)}</dd>
                  </dl>
                </div>
              </div>
              
              <div 
                className="surface-card cursor-pointer overflow-hidden transition-colors hover:bg-white/10"
                onClick={() => setShowUsersModal(true)}
              >
                <div className="px-4 py-5 sm:p-6">
                  <dl>
                    <dt className="text-sm font-medium text-slate-400 truncate">Total Users</dt>
                    <dd className="mt-1 text-3xl font-semibold text-slate-100">{totalUsers}</dd>
                  </dl>
                </div>
              </div>
            </div>
            
            {/* Wallpapers table */}
            <div className="surface-card overflow-hidden">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-slate-100">Wallpaper Statistics</h3>
                <p className="mt-1 max-w-2xl text-sm text-slate-400">Detailed download stats for each wallpaper.</p>
              </div>
              <div className="border-t border-white/10">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-white/10">
                    <thead className="bg-white/5">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Wallpaper</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Category</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Price</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Downloads</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Revenue</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-transparent divide-y divide-white/10">
                      {wallpapers.map((wallpaper) => (
                        <tr key={wallpaper._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img className="h-10 w-10 rounded-md object-cover" src={wallpaper.imageUrl} alt={wallpaper.title} />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-slate-100">{wallpaper.title}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-100">{wallpaper.category}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-100">{wallpaper.price != null ? `₹${wallpaper.price.toFixed(2)}` : 'Free'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-100">{wallpaper.downloadCount}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-green-400">₹{wallpaper.revenue?.toFixed(2) || '0.00'}</div>
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

            {/* Users Modal */}
            <UsersModal />
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 



