// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.verifyToken = async (req, res, next) => {
  try {
    console.log('verifyToken middleware - headers:', req.headers);
    
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('No authorization header found');
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('No token found in authorization header');
      return res.status(401).json({ message: 'No token provided' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded:', decoded);
      req.user = decoded;
      next();
    } catch (tokenError) {
      console.error('Token verification failed:', tokenError);
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (err) {
    console.error('Error in verifyToken:', err);
    return res.status(500).json({ error: err.message });
  }
};
