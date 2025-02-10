const { User } = require('../models/User');
const Submission = require('../models/Submission');

exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from auth middleware

    // Get user data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get submission stats
    const submissionStats = await Submission.aggregate([
      { $match: { userId: user._id } },
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
    const recentActivity = await Submission.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('challengeId', 'title difficulty');

    // Calculate level progress
    const currentLevel = Math.floor(1 + Math.sqrt(user.experiencePoints/100));
    const currentLevelXP = Math.pow((currentLevel - 1), 2) * 100;
    const nextLevelXP = Math.pow(currentLevel, 2) * 100;
    const progress = ((user.experiencePoints - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

    // Prepare stats object
    const stats = {
      userId: user._id,
      name: user.name,
      email: user.email,
      level: currentLevel,
      experiencePoints: user.experiencePoints,
      currentBadge: user.currentBadge,
      isAdmin: user.isAdmin || false,
      levelProgress: {
        currentLevel,
        currentLevelXP,
        nextLevelXP,
        progress: Math.min(100, Math.max(0, progress))
      },
      submissions: {
        total: submissionStats[0]?.totalSubmissions || 0,
        successful: submissionStats[0]?.successfulSubmissions || 0,
        averageScore: Math.round((submissionStats[0]?.averageScore || 0) * 100) / 100
      },
      recentActivity: recentActivity.map(activity => ({
        id: activity._id,
        challengeTitle: activity.challengeId?.title || 'Unknown Challenge',
        difficulty: activity.challengeId?.difficulty || 'unknown',
        status: activity.status,
        score: activity.score,
        date: activity.createdAt
      })),
      lastActive: user.lastActive || user.updatedAt
    };

    console.log('User stats:', { userId: stats.userId, isAdmin: stats.isAdmin }); // Debug log
    res.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ 
      message: 'Error fetching user stats',
      error: error.message 
    });
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
    res.status(500).json({ 
      message: 'Error updating last active timestamp',
      error: error.message 
    });
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