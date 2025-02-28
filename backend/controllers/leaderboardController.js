const { User } = require('../models/User');
const Submission = require('../models/Submission');

exports.getLeaderboards = async (req, res) => {
  try {
    console.log('Fetching leaderboards...');

    // Get all users with non-zero experience points
    const users = await User.find(
      { experiencePoints: { $exists: true, $gt: 0 } },
      'name experiencePoints level'
    ).sort({ experiencePoints: -1 });

    console.log('Found users:', users.length);

    // If no users found with experience points, get all users
    if (!users || users.length === 0) {
      console.log('No users with experience points found, fetching all users...');
      const allUsers = await User.find({}, 'name experiencePoints level')
        .sort({ createdAt: -1 });

      console.log('Found all users:', allUsers.length);

      const defaultLeaderboards = {
        experiencePoints: allUsers.map(user => ({
          id: user._id,
          name: user.name,
          experiencePoints: user.experiencePoints || 0,
          level: user.level || 1
        })),
        performance: []
      };

      console.log('Returning default leaderboards:', defaultLeaderboards);
      return res.json(defaultLeaderboards);
    }

    // Get all successful submissions
    const submissions = await Submission.aggregate([
      { $match: { status: 'success' } },
      {
        $lookup: {
          from: 'challenges',
          localField: 'challenge',
          foreignField: '_id',
          as: 'challengeDetails'
        }
      },
      {
        $unwind: {
          path: '$challengeDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          points: {
            $switch: {
              branches: [
                { case: { $eq: ['$challengeDetails.difficulty', 'easy'] }, then: 10 },
                { case: { $eq: ['$challengeDetails.difficulty', 'medium'] }, then: 20 },
                { case: { $eq: ['$challengeDetails.difficulty', 'hard'] }, then: 30 }
              ],
              default: 0
            }
          }
        }
      },
      {
        $group: {
          _id: '$user',
          totalScore: { $sum: '$points' },
          successfulSubmissions: { $sum: 1 }
        }
      },
      { $sort: { totalScore: -1 } }
    ]);

    console.log('Found submissions:', submissions.length);
    
    // Log submission details for debugging
    if (submissions.length > 0) {
      console.log('Sample submission:', JSON.stringify(submissions[0], null, 2));
    }

    // Create user map for quick lookup
    const userMap = users.reduce((map, user) => {
      map[user._id.toString()] = user;
      return map;
    }, {});

    const leaderboards = {
      experiencePoints: users.map(user => ({
        id: user._id,
        name: user.name || 'Anonymous',
        experiencePoints: user.experiencePoints || 0,
        level: user.level || 1
      })),
      performance: submissions.map(submission => {
        // Add null check for submission._id
        const userId = submission._id ? submission._id.toString() : null;
        const user = userId ? userMap[userId] : null;
        return {
          id: submission._id || 'unknown',
          name: user ? user.name : 'Unknown User',
          score: submission.totalScore || 0,
          submissions: submission.successfulSubmissions || 0
        };
      }).filter(entry => entry.name !== 'Unknown User') // Remove unknown users
    };

    console.log('Final leaderboards data:', {
      experiencePointsCount: leaderboards.experiencePoints.length,
      performanceCount: leaderboards.performance.length
    });

    res.json(leaderboards);
  } catch (error) {
    console.error('Error fetching leaderboards:', error);
    res.status(500).json({ 
      message: 'Error fetching leaderboards',
      error: error.message 
    });
  }
}; 