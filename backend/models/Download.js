const mongoose = require('mongoose');

const downloadSchema = new mongoose.Schema({
  wallpaper: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallpaper',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  downloadedAt: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String
  }
}, {
  timestamps: true
});

// Create a compound index to track unique users per wallpaper
downloadSchema.index({ wallpaper: 1, user: 1 }, { unique: false });
downloadSchema.index({ wallpaper: 1, ipAddress: 1 }, { unique: false });

module.exports = mongoose.model('Download', downloadSchema); 