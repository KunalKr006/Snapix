const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const Wallpaper = require('../models/Wallpaper');
const Download = require('../models/Download'); // Import Download model
const User = require('../models/User'); // Import User model

// Admin dashboard data
router.get('/dashboard', auth, adminAuth, async (req, res) => {
  try {
    // Simple placeholder for now
    res.json({ 
      message: 'Admin dashboard data',
      stats: {
        totalUsers: 0,
        totalWallpapers: 0,
        totalDownloads: 0
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin dashboard data (general stats)
router.get('/dashboard-stats', auth, adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalWallpapers = await Wallpaper.countDocuments();
    const totalDownloads = await Download.countDocuments();

    res.json({
      totalUsers,
      totalWallpapers,
      totalDownloads
    });
  } catch (error) {
    console.error('Admin dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get wallpaper statistics
router.get('/wallpaper-stats', auth, adminAuth, async (req, res) => {
  try {
    const wallpapers = await Wallpaper.find({});
    const wallpaperStats = [];

    for (const wallpaper of wallpapers) {
      // Count all downloads for this wallpaper
      const totalDownloadsForWallpaper = await Download.countDocuments({ wallpaper: wallpaper._id });

      // Count unique users who downloaded this wallpaper
      // Using `user` field if available, otherwise `ipAddress`
      const uniqueDownloads = await Download.aggregate([
        { $match: { wallpaper: wallpaper._id } },
        { $group: { _id: { $cond: ["$user", "$user", "$ipAddress"] } } },
        { $count: 'uniqueUsers' }
      ]);

      wallpaperStats.push({
        _id: wallpaper._id,
        title: wallpaper.title,
        category: wallpaper.category,
        imageUrl: wallpaper.imageUrl,
        downloadCount: totalDownloadsForWallpaper, // Use the aggregated count
        uniqueUsers: uniqueDownloads.length > 0 ? uniqueDownloads[0].uniqueUsers : 0,
      });
    }

    res.json(wallpaperStats);
  } catch (error) {
    console.error('Error fetching wallpaper statistics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get list of users
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const users = await User.find({}, {
      password: 0, // Exclude password from response
      resetPasswordOTP: 0 // Exclude OTP data
    }).sort({ createdAt: -1 }); // Sort by newest first

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;