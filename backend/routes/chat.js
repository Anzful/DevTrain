const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const chatController = require('../controllers/chatController');

// Get chat messages between two users
router.get('/messages/:userId', auth, chatController.getMessages);

// Send a new message
router.post('/messages', auth, chatController.sendMessage);

module.exports = router; 