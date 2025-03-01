// backend/routes/forum.js
const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController');
const { verifyToken } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

// Get all posts
router.get('/', verifyToken, forumController.getAllPosts);

// Get a single post with comments
router.get('/:id', verifyToken, forumController.getPostById);

// Create a new post
router.post('/', verifyToken, forumController.createPost);

// Add a comment to a post
router.post('/:id/comment', verifyToken, forumController.addComment);

// Upvote a post
router.post('/:id/upvote', verifyToken, forumController.upvotePost);

// Downvote a post
router.post('/:id/downvote', verifyToken, forumController.downvotePost);

// Upvote a comment
router.post('/:postId/comment/:commentId/upvote', verifyToken, forumController.upvoteComment);

// Downvote a comment
router.post('/:postId/comment/:commentId/downvote', verifyToken, forumController.downvoteComment);

// Delete a post (admin only)
router.delete('/:id', 
  (req, res, next) => {
    console.log('Delete route hit:', req.params.id);
    next();
  },
  verifyToken,
  admin,
  forumController.deletePost
);

module.exports = router;
