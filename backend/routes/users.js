// backend/routes/users.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getUsers,
  getUserStats,
  updateLastActive,
  getUserProfile
} = require('../controllers/userController');

// Routes
router.get('/stats', auth, getUserStats);
router.post('/last-active', auth, updateLastActive);
router.get('/profile/:id', auth, getUserProfile);
router.get('/', auth, getUsers);

module.exports = router;
