// backend/middleware/roleMiddleware.js
exports.requireRole = (role) => {
    return (req, res, next) => {
      if (req.user.role !== role && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Insufficient rights' });
      }
      next();
    };
  };
  