import { useState, useEffect } from 'react';
import { getWallpapers, getWallpaper, uploadWallpaper, deleteWallpaper } from '../services/wallpaperService';

export const useWallpapers = (category = '', search = '') => {
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWallpapers = async () => {
      try {
        setLoading(true);
        const data = await getWallpapers(category, search);
        setWallpapers(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWallpapers();
  }, [category, search]);

  const fetchWallpaper = async (id) => {
    try {
      setLoading(true);
      const data = await getWallpaper(id);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (formData) => {
    try {
      setLoading(true);
      const newWallpaper = await uploadWallpaper(formData);
      setWallpapers(prev => [newWallpaper, ...prev]);
      setError(null);
      return newWallpaper;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await deleteWallpaper(id);
      setWallpapers(prev => prev.filter(w => w._id !== id));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    wallpapers,
    loading,
    error,
    fetchWallpaper,
    handleUpload,
    handleDelete
  };
}; 