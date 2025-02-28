// backend/routes/challenges.js
const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const {
  getChallenges,
  getChallenge,
  createChallenge,
  updateChallenge,
  deleteChallenge
} = require('../controllers/challengeController');
const jwt = require('jsonwebtoken');
const { User } = require('../models/User');

// Create a middleware for optional authentication
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      // No token, but that's okay - continue as unauthenticated
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await User.findById(decoded.id);
      
      if (user) {
        req.user = {
          id: user._id,
          isAdmin: Boolean(user.isAdmin)
        };
      }
    } catch (error) {
      // Token verification failed, but that's okay for optional auth
      console.log('Optional auth token verification failed:', error.message);
    }
    
    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next();
  }
};

// Public routes with optional authentication
router.get('/', optionalAuth, getChallenges);
router.get('/:id', optionalAuth, getChallenge);

// Protected admin routes
router.use(auth); // Apply auth middleware to all routes below
router.use(adminAuth); // Apply admin middleware to all routes below

router.post('/', createChallenge);
router.put('/:id', updateChallenge);
router.delete('/:id', deleteChallenge);

module.exports = router;
