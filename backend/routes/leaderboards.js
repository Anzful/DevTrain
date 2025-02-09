// backend/routes/leaderboards.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
<<<<<<< HEAD
const auth = require('../middleware/auth');

// GET /api/leaderboards - Retrieve top users by experience points
router.get('/', auth, async (req, res) => {
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

    const users = await User.find(query)
      .select('name experiencePoints successfulSubmissions')
      .sort({ experiencePoints: -1, successfulSubmissions: -1 })
      .limit(100);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
=======

// GET /api/leaderboards - Retrieve top users by experience points
router.get('/', async (req, res) => {
  try {
    // For example, sort users by experiencePoints in descending order and limit to top 10.
    const topUsers = await User.find({})
      .sort({ experiencePoints: -1 })
      .limit(10);

    res.json(topUsers);
  } catch (error) {
    console.error("Error fetching leaderboards:", error);
    res.status(500).json({ error: "Server error while fetching leaderboards." });
>>>>>>> 2aaa4a0f32c6f5f6905215075cd8474278ab18ec
  }
});

module.exports = router;
