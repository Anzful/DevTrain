// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');

// Add these imports:
const { verifyToken } = require('../middleware/authMiddleware');
const User = require('../models/User');

// Local auth endpoints (register/login)
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// ADD THIS: a new GET /profile endpoint
router.get('/profile', verifyToken, async (req, res) => {
  try {
    // req.user is set by the verifyToken middleware above
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Return the user object, excluding sensitive data if necessary
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching profile' });
  }
});

module.exports = router;
