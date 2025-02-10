const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getMessages, sendMessage } = require('../controllers/chatController');

// Get chat messages between two users
router.get('/messages/:userId', auth, getMessages);

// Send a new message
router.post('/messages', auth, sendMessage);

module.exports = router; 