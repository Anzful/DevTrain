const { User } = require('../models/User');
const Submission = require('../models/Submission');
const mongoose = require('mongoose');

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id, '-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
};

// Get user stats
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get submission stats
    const submissionStats = await Submission.aggregate([
      { $match: { user: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalSubmissions: { $sum: 1 },
          successfulSubmissions: {
            $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
          },
          averageScore: { $avg: '$score' }
        }
      }
    ]);

    // Get recent activity
    const recentActivity = await Submission.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('challenge', 'title difficulty');

    // Calculate level progress
    const currentLevel = Math.floor(1 + Math.sqrt(user.experiencePoints/100));
    const currentLevelXP = Math.pow((currentLevel - 1), 2) * 100;
    const nextLevelXP = Math.pow(currentLevel, 2) * 100;
    const progress = ((user.experiencePoints - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

    const stats = {
      userId: user._id,
      name: user.name,
      email: user.email,
      level: currentLevel,
      experiencePoints: user.experiencePoints,
      currentBadge: user.currentBadge,
      isAdmin: user.isAdmin || false,
      levelProgress: Math.min(100, Math.max(0, progress)),
      totalSubmissions: submissionStats[0]?.totalSubmissions || 0,
      successfulSubmissions: submissionStats[0]?.successfulSubmissions || 0,
      successRate: submissionStats[0]?.totalSubmissions > 0 
        ? Math.round((submissionStats[0]?.successfulSubmissions / submissionStats[0]?.totalSubmissions) * 100) 
        : 0,
      recentSubmissions: recentActivity.map(activity => ({
        id: activity._id,
        challengeTitle: activity.challenge?.title || 'Unknown Challenge',
        difficulty: activity.challenge?.difficulty || 'unknown',
        status: activity.status,
        passed: activity.status === 'success',
        points: activity.challenge?.difficulty === 'easy' ? 10 : 
                activity.challenge?.difficulty === 'medium' ? 20 : 30,
        language: activity.language,
        createdAt: activity.createdAt
      })),
      lastActive: user.lastActive || user.updatedAt
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
    const userId = req.user.id;
    await User.findByIdAndUpdate(userId, {
      lastActive: new Date()
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating last active:', error);
    res.status(500).json({ message: 'Error updating last active timestamp' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ name: 1 });

    res.json(users); // Returns an array of users
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      message: 'Error fetching users',
      error: error.message 
    });
  }
}; 