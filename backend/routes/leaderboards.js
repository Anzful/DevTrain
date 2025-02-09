// backend/routes/leaderboards.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

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
  }
});

module.exports = router;
