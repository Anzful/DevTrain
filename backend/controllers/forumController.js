// backend/controllers/forumController.js
const ForumPost = require('../models/ForumPost');

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await ForumPost.find({}).populate('user');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createPost = async (req, res) => {
  try {
    const post = new ForumPost({
      user: req.user.id,
      title: req.body.title,
      content: req.body.content
    });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    post.comments.push({ user: req.user.id, comment: req.body.comment });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    console.log('Delete request received for post:', req.params.id);
    console.log('Request user:', req.user);
    console.log('Request headers:', req.headers);

    // First check if the ID is valid
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid post ID format' });
    }

    // Try to find the post first
    const post = await ForumPost.findById(req.params.id);
    
    if (!post) {
      console.log('Post not found with ID:', req.params.id);
      return res.status(404).json({ message: 'Post not found' });
    }

    console.log('Found post:', post);

    try {
      // Attempt to delete the post
      const result = await ForumPost.findByIdAndDelete(req.params.id);
      
      if (!result) {
        console.log('Delete operation returned null');
        return res.status(500).json({ message: 'Failed to delete post' });
      }

      console.log('Post deleted successfully:', result);
      return res.json({ 
        message: 'Post deleted successfully', 
        deletedPost: result 
      });
    } catch (deleteError) {
      console.error('Error during delete operation:', deleteError);
      return res.status(500).json({ 
        message: 'Failed to delete post',
        error: deleteError.message
      });
    }
  } catch (err) {
    console.error('Error in deletePost:', err);
    return res.status(500).json({ 
      message: 'Failed to delete post',
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};
