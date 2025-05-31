import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const WallpaperGrid = ({ wallpapers, onDelete }) => {
  const { user } = useAuth();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
      {wallpapers.map((wallpaper) => (
        <div
          key={wallpaper._id}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
        >
          <Link to={`/wallpaper/${wallpaper._id}`}>
            <img
              src={wallpaper.resolutions.desktop}
              alt={wallpaper.title}
              className="w-full h-48 object-cover"
            />
          </Link>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {wallpaper.title}
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {wallpaper.category}
              </span>
              {user?.role === 'admin' && (
                <button
                  onClick={() => onDelete(wallpaper._id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Delete
                </button>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {wallpaper.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WallpaperGrid; 