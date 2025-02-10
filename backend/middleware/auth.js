const jwt = require('jsonwebtoken');
const { User } = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('Decoded token:', decoded); // Debug log

    const user = await User.findById(decoded.id);
    console.log('Found user:', user); // Debug log

    if (!user) {
      throw new Error('User not found');
    }

    req.user = {
      id: user._id,
      isAdmin: Boolean(user.isAdmin) // Ensure boolean value
    };

    console.log('Request user object:', req.user); // Debug log
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

// Admin middleware
const adminAuth = async (req, res, next) => {
  console.log('Admin check - User:', req.user); // Debug log
  
  if (!req.user.isAdmin) {
    console.log('Admin access denied - User is not admin'); // Debug log
    return res.status(403).json({ message: 'Not authorized - Admin access required' });
  }
  
  console.log('Admin access granted'); // Debug log
  next();
};

module.exports = { auth, adminAuth }; 