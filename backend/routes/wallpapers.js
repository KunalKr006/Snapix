const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { auth, adminAuth } = require('../middleware/auth');
const Wallpaper = require('../models/Wallpaper');
const User = require('../models/User');
const Download = require('../models/Download');
const Payment = require('../models/Payment');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Get all wallpapers with optional filtering
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    // Add category filter if provided (simple string match)
    if (category) {
      query.category = category;
    }

    // Add simple title search with regex
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const wallpapers = await Wallpaper.find(query).sort({ createdAt: -1 });
    res.json(wallpapers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get single wallpaper
router.get('/:id', async (req, res) => {
  try {
    const wallpaper = await Wallpaper.findById(req.params.id);
    if (!wallpaper) {
      return res.status(404).json({ message: 'Wallpaper not found' });
    }
    res.json(wallpaper);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Upload wallpaper (admin only)
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Convert buffer to base64
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: 'snapix',
      resource_type: 'auto'
    });

    const price = parseFloat(req.body.price);
    if (Number.isNaN(price) || price < 0) {
      return res.status(400).json({ message: 'Please provide a valid price' });
    }

    const wallpaper = new Wallpaper({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      price,
      imageUrl: result.secure_url,
      uploadedBy: req.user.id
    });

    await wallpaper.save();
    res.status(201).json(wallpaper);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      message: 'Error uploading wallpaper',
      error: error.message 
    });
  }
});

// Update wallpaper (admin only)
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const wallpaper = await Wallpaper.findById(req.params.id);
    if (!wallpaper) {
      return res.status(404).json({ message: 'Wallpaper not found' });
    }

    // Update basic fields
    wallpaper.title = req.body.title;
    wallpaper.description = req.body.description;
    wallpaper.category = req.body.category;

    if (req.body.price !== undefined) {
      const price = parseFloat(req.body.price);
      if (Number.isNaN(price) || price < 0) {
        return res.status(400).json({ message: 'Please provide a valid price' });
      }
      wallpaper.price = price;
    }

    // If a new image is provided, upload it to Cloudinary
    if (req.file) {
      // Convert buffer to base64
      const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

      // Upload new image to Cloudinary
      const result = await cloudinary.uploader.upload(base64Image, {
        folder: 'snapix',
        resource_type: 'auto'
      });

      // Delete old image from Cloudinary if it exists
      if (wallpaper.imageUrl) {
        const oldPublicId = wallpaper.imageUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`snapix/${oldPublicId}`);
      }

      // Update image URL
      wallpaper.imageUrl = result.secure_url;
    }

    await wallpaper.save();
    res.json(wallpaper);
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ 
      message: 'Error updating wallpaper',
      error: error.message 
    });
  }
});

// Delete wallpaper (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const wallpaper = await Wallpaper.findById(req.params.id);
    if (!wallpaper) {
      return res.status(404).json({ message: 'Wallpaper not found' });
    }

    // Delete image from Cloudinary
    const publicId = wallpaper.imageUrl.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(`snapix/${publicId}`);

    // Use findByIdAndDelete instead of remove()
    await Wallpaper.findByIdAndDelete(req.params.id);
    res.json({ message: 'Wallpaper removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Add to wishlist
router.post('/:id/wishlist', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const wallpaper = await Wallpaper.findById(req.params.id);

    if (!wallpaper) {
      return res.status(404).json({ message: 'Wallpaper not found' });
    }

    // Convert both IDs to strings for comparison
    const isInWishlist = user.wishlist.some(id => id.toString() === wallpaper._id.toString());
    if (isInWishlist) {
      return res.status(400).json({ message: 'Wallpaper already in wishlist' });
    }

    user.wishlist.push(wallpaper._id);
    await user.save();

    res.json({ message: 'Added to wishlist' });
  } catch (error) {
    console.error('Wishlist add error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Remove from wishlist
router.delete('/:id/wishlist', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const wallpaper = await Wallpaper.findById(req.params.id);

    if (!wallpaper) {
      return res.status(404).json({ message: 'Wallpaper not found' });
    }

    // Convert both IDs to strings for comparison
    const isInWishlist = user.wishlist.some(id => id.toString() === wallpaper._id.toString());
    if (!isInWishlist) {
      return res.status(400).json({ message: 'Wallpaper not in wishlist' });
    }

    user.wishlist = user.wishlist.filter(id => id.toString() !== wallpaper._id.toString());
    await user.save();

    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Wishlist remove error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Track wallpaper download
router.post('/:id/download', auth, async (req, res) => {
  try {
    const wallpaper = await Wallpaper.findById(req.params.id);
    if (!wallpaper) {
      return res.status(404).json({ message: 'Wallpaper not found' });
    }

    // Check if wallpaper requires payment
    if (wallpaper.price && wallpaper.price > 0) {
      // Check if user has paid for this wallpaper
      const payment = await Payment.findOne({
        user: req.user.id,
        wallpaper: wallpaper._id,
        status: 'completed'
      });

      if (!payment) {
        return res.status(403).json({
          message: 'Payment required to download this wallpaper',
          requiresPayment: true,
          price: wallpaper.price
        });
      }
    }

    // Create download record
    const download = new Download({
      wallpaper: wallpaper._id,
      user: req.user.id,
      ipAddress: req.ip || req.connection.remoteAddress
    });

    await download.save();

    // Increment download count on wallpaper
    wallpaper.downloadCount += 1;
    await wallpaper.save();

    res.json({
      message: 'Download recorded successfully',
      downloadUrl: wallpaper.imageUrl
    });
  } catch (error) {
    console.error('Download tracking error:', error);
    res.status(500).json({ message: 'Error recording download' });
  }
});

module.exports = router; 