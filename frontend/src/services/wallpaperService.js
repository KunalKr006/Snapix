import api from './api';

export const getWallpapers = async (category = '', search = '') => {
  try {
    const response = await api.get('/wallpapers', {
      params: { category, search }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching wallpapers:', error);
    throw error;
  }
};

export const getWallpaper = async (id) => {
  try {
    const response = await api.get(`/wallpapers/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching wallpaper:', error);
    throw error;
  }
};

export const uploadWallpaper = async (formData, isUpdate = false) => {
  try {
    let response;
    if (isUpdate) {
      // Extract the ID from form data for update request
      const id = formData.get('id');
      response = await api.put(`/wallpapers/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } else {
      // Regular upload for new wallpaper
      response = await api.post('/wallpapers', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }
    return response.data;
  } catch (error) {
    console.error('Error uploading/updating wallpaper:', error);
    throw error;
  }
};

export const deleteWallpaper = async (id) => {
  try {
    await api.delete(`/wallpapers/${id}`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting wallpaper:', error);
    throw error;
  }
};

export const addToWishlist = async (wallpaperId) => {
  try {
    console.log('Adding to wishlist:', wallpaperId);
    const response = await api.post(`/wallpapers/${wallpaperId}/wishlist`);
    console.log('Add to wishlist response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error adding to wishlist:', error.response || error);
    if (error.response?.status === 400) {
      throw new Error(error.response.data.message || 'Wallpaper already in wishlist');
    }
    throw error;
  }
};

export const removeFromWishlist = async (wallpaperId) => {
  try {
    console.log('Removing from wishlist:', wallpaperId);
    const response = await api.delete(`/wallpapers/${wallpaperId}/wishlist`);
    console.log('Remove from wishlist response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error removing from wishlist:', error.response || error);
    if (error.response?.status === 400) {
      throw new Error(error.response.data.message || 'Wallpaper not in wishlist');
    }
    throw error;
  }
};