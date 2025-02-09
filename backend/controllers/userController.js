const User = require('../models/User');
const Submission = require('../models/Submission');

exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get recent submissions
    const recentSubmissions = await Submission.find({ user: userId })
      .populate('challenge', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate success rate
    const totalSubmissions = await Submission.countDocuments({ user: userId });
    const successfulSubmissions = await Submission.countDocuments({ 
      user: userId,
      passed: true 
    });

    const stats = {
      name: user.name,
      experiencePoints: user.experiencePoints || 0,
      successfulSubmissions: successfulSubmissions,
      totalSubmissions: totalSubmissions,
      successRate: totalSubmissions > 0 
        ? (successfulSubmissions / totalSubmissions) * 100 
        : 0,
      recentSubmissions: recentSubmissions.map(sub => ({
        challengeId: sub.challenge._id,
        challengeTitle: sub.challenge.title,
        passed: sub.passed,
        createdAt: sub.createdAt
      })),
      lastActive: user.lastActive
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Error fetching user stats' });
  }
};

// Update last active timestamp
exports.updateLastActive = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      lastActive: new Date()
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating last active:', error);
    res.status(500).json({ message: 'Error updating last active' });
  }
}; 