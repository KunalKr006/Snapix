import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadWallpaper } from '../services/wallpaperService';
import { motion } from 'framer-motion';

const Upload = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    image: null
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'Nature',
    'Abstract',
    'Minimal',
    'Gaming',
    'Anime',
    'Space',
    'Animals',
    'Architecture'
  ];

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
    if (!formData.image) {
      setError('Please select an image');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('image', formData.image);

      await uploadWallpaper(data);
      navigate('/gallery');
    } catch (error) {
      console.error('Error uploading wallpaper:', error);
      setError(error.response?.data?.message || 'Failed to upload wallpaper');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <motion.div 
        className="max-w-3xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="bg-white dark:bg-dark-card shadow-lg rounded-lg p-8"
          variants={itemVariants}
        >
          <motion.h2 
            className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary mb-8"
            variants={itemVariants}
          >
            Upload Wallpaper
          </motion.h2>
          
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

          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-6"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
                Title
              </label>
              <motion.input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border dark:bg-dark-card dark:text-dark-text-primary shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-all duration-200"
                whileFocus={{ scale: 1.01 }}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
                Description
              </label>
              <motion.textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border dark:bg-dark-card dark:text-dark-text-primary shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-all duration-200"
                whileFocus={{ scale: 1.01 }}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
                Category
              </label>
              <motion.select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border dark:bg-dark-card dark:text-dark-text-primary shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-all duration-200"
                whileFocus={{ scale: 1.01 }}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </motion.select>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
                Wallpaper Image
              </label>
              <motion.div 
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-dark-border border-dashed rounded-md"
                whileHover={{ borderColor: '#38bdf8', scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <div className="space-y-1 text-center">
                  {preview ? (
                    <motion.div 
                      className="relative"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.img
                        src={preview}
                        alt="Preview"
                        className="mx-auto h-64 object-cover rounded-md shadow-md"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      />
                      <motion.button
                        type="button"
                        onClick={() => {
                          setPreview(null);
                          setFormData({ ...formData, image: null });
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200 shadow-md"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </motion.button>
                    </motion.div>
                  ) : (
                    <div className="flex text-sm text-gray-600 dark:text-dark-text-secondary">
                      <label
                        htmlFor="image"
                        className="relative cursor-pointer bg-white dark:bg-dark-card rounded-md font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500 transition-colors duration-200"
                      >
                        <motion.span whileHover={{ scale: 1.05 }}>Upload a file</motion.span>
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
              </motion.div>
            </motion.div>

            <motion.div 
              className="flex justify-end"
              variants={itemVariants}
            >
              <motion.button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-6 border border-transparent shadow-md text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {loading ? (
                  <>
                    <motion.svg 
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </motion.svg>
                    Uploading...
                  </>
                ) : 'Upload Wallpaper'}
              </motion.button>
            </motion.div>
          </motion.form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Upload; 