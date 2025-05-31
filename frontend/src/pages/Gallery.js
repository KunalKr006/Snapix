import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getWallpapers } from '../services/wallpaperService';
import WishlistButton from '../components/WishlistButton';

const Gallery = () => {
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

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
    const fetchWallpapers = async () => {
      try {
        setLoading(true);
        const data = await getWallpapers(category, search);
        setWallpapers(data);
        setError('');
      } catch (error) {
        console.error('Error fetching wallpapers:', error);
        setError('Failed to load wallpapers');
      } finally {
        setLoading(false);
      }
    };

    fetchWallpapers();
  }, [category, search]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Wallpaper Gallery</h1>
          <p className="mt-2 text-sm text-gray-600">
            Browse and download beautiful wallpapers for your devices
          </p>
        </div>

        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search wallpapers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="w-full sm:w-48">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-8" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : wallpapers.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-medium text-gray-900">No wallpapers found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter to find what you're looking for.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {wallpapers.map((wallpaper) => (
              <div
                key={wallpaper._id}
                className="bg-white overflow-hidden shadow rounded-lg relative group"
              >
                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <WishlistButton wallpaperId={wallpaper._id} />
                </div>
                <Link to={`/gallery/${wallpaper._id}`}>
                  <img
                    src={wallpaper.imageUrl}
                    alt={wallpaper.title}
                    className="w-full h-64 object-cover"
                  />
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900">{wallpaper.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{wallpaper.category}</p>
                    {wallpaper.description && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {wallpaper.description}
                      </p>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery; 