const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { auth, authRateLimiter } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const { generateOTP, sendPasswordResetEmail } = require('../utils/emailUtils');

// Email domain validation
const validateEmailDomain = (email) => {
  const validDomains = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com'];
  const domain = email.split('@')[1];
  if (!validDomains.includes(domain)) {
    throw new Error('Email domain not supported. Please use Gmail, Outlook, Hotmail, Yahoo, or iCloud.');
  }
  return true;
};

// Password strength validation
const validatePasswordStrength = (password) => {
  // At least 6 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&:#])[A-Za-z\d@$!%*?&:#]{6,}$/;
  if (!passwordRegex.test(password)) {
    throw new Error('Password must be at least 6 characters with 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character');
  }
  return true;
};

// Register user
router.post(
  '/register',
  authRateLimiter,
  [
    body('username', 'Username is required and must be between 3-20 characters')
      .isString()
      .trim()
      .isLength({ min: 3, max: 20 }),
    body('email', 'Please include a valid email')
      .isEmail()
      .normalizeEmail()
      .custom(validateEmailDomain),
    body('password')
      .isString()
      .custom(validatePasswordStrength),
  ],
  async (req, res) => {
    try {
      // Validate inputs
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { username, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        if (existingUser.email === email) {
          return res.status(400).json({ message: 'Email is already registered' });
        } else {
          return res.status(400).json({ message: 'Username is already taken' });
        }
      }

      // Create new user
      const user = new User({
        username,
        email,
        password,
        wishlist: [], // Initialize empty wishlist
      });

      await user.save();

      // Create JWT
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Populate wishlist
      const populatedUser = await User.findById(user._id).populate('wishlist');

      res.status(201).json({
        token,
        user: {
          id: populatedUser._id,
          username: populatedUser.username,
          email: populatedUser.email,
          role: populatedUser.role,
          wishlist: populatedUser.wishlist
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error during registration' });
    }
  }
);

// Login user
router.post('/login', 
  authRateLimiter,
  [
    body('email', 'Please include a valid email')
      .isEmail()
      .normalizeEmail(),
    body('password', 'Password is required').exists()
  ],
  async (req, res) => {
    try {
      // Validate inputs
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { email, password } = req.body;

      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Create JWT
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Populate wishlist
      const populatedUser = await User.findById(user._id).populate('wishlist');

      res.json({
        token,
        user: {
          id: populatedUser._id,
          username: populatedUser.username,
          email: populatedUser.email,
          role: populatedUser.role,
          wishlist: populatedUser.wishlist
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error during login' });
    }
  }
);

// Forgot password - request OTP
router.post('/forgot-password', 
  authRateLimiter,
  [
    body('email', 'Please include a valid email')
      .isEmail()
      .normalizeEmail()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { email } = req.body;

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(200).json({ message: 'If your email is registered, you will receive a reset link' });
      }

      // Generate OTP
      const otp = generateOTP();
      // OTP expires in 15 minutes
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      // Save OTP to user
      user.resetPasswordOTP = {
        code: otp,
        expiresAt
      };
      await user.save();

      // Send email with OTP
      await sendPasswordResetEmail(email, otp);

      res.status(200).json({ message: 'OTP sent to your email' });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ message: 'Server error during password reset request' });
    }
  }
);

// Reset password with OTP
router.post('/reset-password', 
  authRateLimiter,
  [
    body('email', 'Please include a valid email')
      .isEmail()
      .normalizeEmail(),
    body('otp', 'OTP is required').notEmpty(),
    body('newPassword')
      .custom(validatePasswordStrength),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { email, otp, newPassword } = req.body;

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }

      // Check if OTP exists and is valid
      if (!user.resetPasswordOTP || !user.resetPasswordOTP.code || !user.resetPasswordOTP.expiresAt) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }

      // Check if OTP is expired
      if (new Date() > new Date(user.resetPasswordOTP.expiresAt)) {
        return res.status(400).json({ message: 'OTP has expired' });
      }

      // Verify OTP
      if (user.resetPasswordOTP.code !== otp) {
        return res.status(400).json({ message: 'Invalid OTP' });
      }

      // Update password
      user.password = newPassword;
      // Clear OTP
      user.resetPasswordOTP = undefined;
      await user.save();

      res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ message: 'Server error during password reset' });
    }
  }
);

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      wishlist: user.wishlist
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password when logged in
router.post('/change-password', 
  auth, 
  authRateLimiter, 
  [
    body('currentPassword', 'Current password is required').exists(),
    body('newPassword')
      .custom(validatePasswordStrength),
  ], 
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { currentPassword, newPassword } = req.body;

      // Get user from auth middleware
      const user = req.user;

      // Check if the current password is correct
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      // Ensure the new password is different from the current one
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        return res.status(400).json({ message: 'New password cannot be the same as your current password' });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ message: 'Server error during password change' });
    }
  }
);

module.exports = router; 