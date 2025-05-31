const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');

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

module.exports = router;