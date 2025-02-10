const { User } = require('../models/User');

exports.getLeaderboard = async (req, res) => {
  try {
    const { timeframe } = req.query;
    let query = {};

    // Add timeframe filtering
    if (timeframe === 'month') {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      query.createdAt = { $gte: lastMonth };
    } else if (timeframe === 'week') {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      query.createdAt = { $gte: lastWeek };
    }

    // Fetch users and sort by experience points
    const users = await User.find(query)
      .select('name email experiencePoints level currentBadge successfulSubmissions')
      .sort({ experiencePoints: -1 })
      .limit(100)
      .lean();

    if (!users) {
      return res.status(404).json({ message: 'No users found' });
    }

    // Format the response
    const leaderboardData = users.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      experiencePoints: user.experiencePoints || 0,
      level: user.level || 1,
      currentBadge: user.currentBadge || {
        name: 'Novice Coder',
        image: '🔰'
      },
      successfulSubmissions: user.successfulSubmissions || 0
    }));

    res.json(leaderboardData);

  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({
      message: 'Error fetching leaderboard data',
      error: error.message
    });
  }
}; 