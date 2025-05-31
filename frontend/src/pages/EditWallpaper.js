import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getWallpaper, uploadWallpaper } from '../services/wallpaperService';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const EditWallpaper = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    image: null
  });

  // Categories list from the app
  const categories = [
    'Nature',
    'Abstract',
    'Minimal',
    'Gaming',
    'Anime',
    'Space',
    'Animals',
    'Architecture',
    'Landscape'
  ];

  useEffect(() => {
    const fetchWallpaper = async () => {
      try {
        setLoading(true);
        const wallpaper = await getWallpaper(id);
        setFormData({
          title: wallpaper.title || '',
          description: wallpaper.description || '',
          category: wallpaper.category || '',
          image: null
        });
        setPreview(wallpaper.imageUrl);
      } catch (error) {
        console.error('Error fetching wallpaper:', error);
        setError('Failed to load wallpaper data');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchWallpaper();
    }
  }, [id]);

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }

      setPreview(URL.createObjectURL(file));
      setFormData({ ...formData, image: file });
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setSubmitting(true);

      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      
      // Only append image if a new one is selected
      if (formData.image) {
        data.append('image', formData.image);
      }
      
      // Add wallpaper ID to update the correct one
      data.append('id', id);

      await uploadWallpaper(data, true); // true indicates it's an update
      
      // Show success message
      const successNotification = document.createElement('div');
      successNotification.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg z-50';
      successNotification.textContent = `Wallpaper updated successfully!`;
      document.body.appendChild(successNotification);
      
      // Remove notification after 3 seconds
      setTimeout(() => {
        if (document.body.contains(successNotification)) {
          document.body.removeChild(successNotification);
        }
        // Navigate back to dashboard after success
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error updating wallpaper:', error);
      setError(error.response?.data?.message || 'Failed to update wallpaper');
    } finally {
      setSubmitting(false);
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
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <motion.div 
        className="max-w-3xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="bg-white dark:bg-dark-card shadow-lg rounded-lg p-8"
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <motion.h2 
            className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Edit Wallpaper
          </motion.h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400"></div>
            </div>
          ) : (
            <>
              {error && (
                <motion.div 
                  className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6" 
                  role="alert"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="block sm:inline">{error}</span>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border dark:bg-dark-card dark:text-dark-text-primary shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-all duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border dark:bg-dark-card dark:text-dark-text-primary shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-all duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
                    Category
                  </label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border dark:bg-dark-card dark:text-dark-text-primary shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-all duration-200"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
                    Wallpaper Image
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-dark-border border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      {preview ? (
                        <div className="relative">
                          <img
                            src={preview}
                            alt="Preview"
                            className="mx-auto h-64 object-cover rounded-md shadow-md"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setPreview(null);
                              setFormData({ ...formData, image: null });
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200 shadow-md"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          <p className="mt-2 text-sm text-gray-500 dark:text-dark-text-secondary">
                            Current image. Click the button above to remove and select a new one.
                          </p>
                        </div>
                      ) : (
                        <div className="flex text-sm text-gray-600 dark:text-dark-text-secondary">
                          <label
                            htmlFor="image"
                            className="relative cursor-pointer bg-white dark:bg-dark-card rounded-md font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500 transition-colors duration-200"
                          >
                            <span>Upload a new image</span>
                            <input
                              id="image"
                              name="image"
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="sr-only"
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 dark:text-dark-text-secondary">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="inline-flex justify-center py-2 px-6 border border-gray-300 dark:border-dark-border shadow-md text-sm font-medium rounded-md text-gray-700 dark:text-dark-text-primary bg-white dark:bg-dark-card hover:bg-gray-50 dark:hover:bg-dark-border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex justify-center py-2 px-6 border border-transparent shadow-md text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors duration-200"
                  >
                    {submitting ? (
                      <>
                        <svg 
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                          xmlns="http://www.w3.org/2000/svg" 
                          fill="none" 
                          viewBox="0 0 24 24"
                        >
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </>
                    ) : 'Save Changes'}
                  </button>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default EditWallpaper; 