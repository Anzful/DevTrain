// backend/routes/forum.js
const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController');
const { verifyToken } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.get('/', verifyToken, forumController.getAllPosts);
router.post('/', verifyToken, forumController.createPost);
router.post('/:id/comment', verifyToken, forumController.addComment);
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
