// backend/routes/leaderboards.js
const express = require('express');
const router = express.Router();
const { getLeaderboard } = require('../controllers/leaderboardController');
const auth = require('../middleware/auth');

// Get leaderboard data
router.get('/', auth, getLeaderboard);

module.exports = router;
