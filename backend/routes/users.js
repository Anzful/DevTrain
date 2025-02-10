// backend/routes/users.js
const express = require('express');
const router = express.Router();
const { User } = require('../models/User');
const auth = require('../middleware/auth');
const { getUserStats, updateLastActive } = require('../controllers/userController');

// Get all users
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ name: 1 });
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      message: 'Error fetching users',
      error: error.message 
    });
  }
});

// Get user stats
router.get('/stats', auth, getUserStats);

// Update last active
router.post('/last-active', auth, updateLastActive);

module.exports = router;
