// backend/controllers/forumController.js
const ForumPost = require('../models/ForumPost');

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await ForumPost.find({})
      .populate('user', 'name')  // Populate just the name from user
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id)
      .populate('user', 'name')
      .populate('comments.user', 'name');
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createPost = async (req, res) => {
  try {
    const post = new ForumPost({
      user: req.user.id,  // This comes from auth middleware
      title: req.body.title,
      content: req.body.content,
      upvotes: [],
      downvotes: []
    });

    await post.save();
    await post.populate('user', 'name');  // Populate user data before sending response
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    post.comments.push({ 
      user: req.user.id, 
      comment: req.body.comment,
      upvotes: [],
      downvotes: []
    });
    
    await post.save();
    
    // Populate the user info for the newly added comment
    const updatedPost = await ForumPost.findById(req.params.id)
      .populate('user', 'name')
      .populate('comments.user', 'name');
    
    res.status(201).json(updatedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.upvotePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    const userId = req.user.id;
    
    // Check if user already upvoted
    if (post.upvotes.includes(userId)) {
      // Remove upvote (toggle)
      post.upvotes = post.upvotes.filter(id => id.toString() !== userId);
    } else {
      // Add upvote and remove from downvotes if exists
      post.upvotes.push(userId);
      post.downvotes = post.downvotes.filter(id => id.toString() !== userId);
    }
    
    await post.save();
    res.json({ 
      upvotes: post.upvotes.length, 
      downvotes: post.downvotes.length,
      voteCount: post.voteCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.downvotePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    const userId = req.user.id;
    
    // Check if user already downvoted
    if (post.downvotes.includes(userId)) {
      // Remove downvote (toggle)
      post.downvotes = post.downvotes.filter(id => id.toString() !== userId);
    } else {
      // Add downvote and remove from upvotes if exists
      post.downvotes.push(userId);
      post.upvotes = post.upvotes.filter(id => id.toString() !== userId);
    }
    
    await post.save();
    res.json({ 
      upvotes: post.upvotes.length, 
      downvotes: post.downvotes.length,
      voteCount: post.voteCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.upvoteComment = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    
    const userId = req.user.id;
    
    // Check if user already upvoted
    if (comment.upvotes.includes(userId)) {
      // Remove upvote (toggle)
      comment.upvotes = comment.upvotes.filter(id => id.toString() !== userId);
    } else {
      // Add upvote and remove from downvotes if exists
      comment.upvotes.push(userId);
      comment.downvotes = comment.downvotes.filter(id => id.toString() !== userId);
    }
    
    await post.save();
    res.json({ 
      upvotes: comment.upvotes.length, 
      downvotes: comment.downvotes.length,
      voteCount: comment.upvotes.length - comment.downvotes.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.downvoteComment = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    
    const userId = req.user.id;
    
    // Check if user already downvoted
    if (comment.downvotes.includes(userId)) {
      // Remove downvote (toggle)
      comment.downvotes = comment.downvotes.filter(id => id.toString() !== userId);
    } else {
      // Add downvote and remove from upvotes if exists
      comment.downvotes.push(userId);
      comment.upvotes = comment.upvotes.filter(id => id.toString() !== userId);
    }
    
    await post.save();
    res.json({ 
      upvotes: comment.upvotes.length, 
      downvotes: comment.downvotes.length,
      voteCount: comment.upvotes.length - comment.downvotes.length
    });
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
