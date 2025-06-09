const jwt = require('jsonwebtoken');
const User = require('../models/User');
const rateLimit = require('express-rate-limit');

// Track invalid attempts by IP
const invalidAttempts = new Map();

// Rate limiter for authentication requests
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: { message: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Reset invalid attempts count every 30 minutes
setInterval(() => {
  invalidAttempts.clear();
}, 30 * 60 * 1000);

const auth = async (req, res, next) => {
  try {
    // Check for token in different places
    let token;
    const authHeader = req.header('Authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '');
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Check for token on blacklist (if implemented)
    // This would require a Redis implementation or similar
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'] // Only allow the specific algorithm used
    });
    
    // Check token expiration explicitly
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (decoded.exp < currentTimestamp) {
      return res.status(401).json({ message: 'Token has expired' });
    }
    
    // Get user
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Store user and token info in request for later use
    req.user = user;
    req.token = token;
    req.tokenExp = decoded.exp;
    console.log('User authenticated:', user.username, 'Role:', user.role);
    
    next();
  } catch (error) {
    // Track invalid attempts by IP for potential brute force attacks
    const ip = req.ip || req.connection.remoteAddress;
    const currentAttempts = invalidAttempts.get(ip) || 0;
    invalidAttempts.set(ip, currentAttempts + 1);
    
    // If too many invalid attempts, return a longer delay
    if (currentAttempts >= 5) {
      return res.status(429).json({ message: 'Too many invalid attempts, please try again later' });
    }
    
    // Handle different jwt errors with specific messages
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    
    res.status(401).json({ message: 'Authentication failed' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { auth, adminAuth, authRateLimiter }; 