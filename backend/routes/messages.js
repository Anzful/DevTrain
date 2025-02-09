// backend/routes/messages.js
const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
// Destructure verifyToken from your middleware file
const { verifyToken } = require('../middleware/authMiddleware');

// GET /api/messages/:userId1/:userId2 - Get messages between two users
router.get('/:userId1/:userId2', verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { from: req.params.userId1, to: req.params.userId2 },
        { from: req.params.userId2, to: req.params.userId1 }
      ]
    }).sort('timestamp');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/messages - Save a new message
router.post('/', verifyToken, async (req, res) => {
  const message = new Message({
    from: req.body.from,
    to: req.body.to,
    message: req.body.message,
    timestamp: req.body.timestamp
  });

  try {
    const newMessage = await message.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
