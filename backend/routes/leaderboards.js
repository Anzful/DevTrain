// backend/routes/leaderboards.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get leaderboards data
router.get('/', auth, async function(req, res) {
  try {
    const { timeframe } = req.query;
    let query = {};

    // Add timeframe filtering if needed
    if (timeframe === 'month') {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      query.updatedAt = { $gte: lastMonth };
    } else if (timeframe === 'week') {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      query.updatedAt = { $gte: lastWeek };
    }

    // Get users sorted by experience points
    const users = await User.find(query)
      .select('name experiencePoints successfulSubmissions')
      .sort({ experiencePoints: -1, successfulSubmissions: -1 })
      .limit(100);

    console.log('Leaderboard data:', users);

    res.json(users);

  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
