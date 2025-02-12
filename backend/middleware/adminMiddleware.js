const mongoose = require('mongoose');

exports.admin = async (req, res, next) => {
  try {
    console.log('Admin middleware - User ID:', req.user?.id);
    
    // Get the User model directly from mongoose
    const User = mongoose.model('User');
    
    const user = await User.findById(req.user.id);
    console.log('Admin middleware - Found user:', user ? { 
      id: user._id, 
      isAdmin: user.isAdmin 
    } : null);
    
    if (!user || !user.isAdmin) {
      console.log('Admin middleware - Access denied');
      return res.status(403).json({ message: 'Access denied: Admin only' });
    }
    
    console.log('Admin middleware - Access granted');
    next();
  } catch (err) {
    console.error('Admin middleware error:', err);
    res.status(500).json({ error: err.message });
  }
}; 

