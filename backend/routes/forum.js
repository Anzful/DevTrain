// backend/routes/forum.js
const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, forumController.getAllPosts);
router.post('/', verifyToken, forumController.createPost);
router.post('/:id/comment', verifyToken, forumController.addComment);

module.exports = router;
