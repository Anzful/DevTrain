// backend/routes/leaderboards.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getLeaderboards } = require('../controllers/leaderboardController');

// Get leaderboards data
router.get('/', auth, getLeaderboards);

module.exports = router;
