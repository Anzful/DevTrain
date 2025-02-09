// backend/routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Uses your provided User model
const userController = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');

// GET /api/users - Retrieve all users (public)
router.get('/', async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Server error while fetching users." });
  }
});

// Get user stats (protected route)
router.get('/stats', auth.verifyToken, userController.getUserStats);

// Update last active (protected route)
router.post('/last-active', auth.verifyToken, userController.updateLastActive);

module.exports = router;
