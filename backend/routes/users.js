// backend/routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Uses your provided User model

// GET /api/users - Retrieve all users
router.get('/', async (req, res) => {
  try {
    // Optionally, you can filter or select specific fields
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Server error while fetching users." });
  }
});

module.exports = router;
