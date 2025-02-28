// backend/controllers/challengeController.js
const Challenge = require('../models/Challenge');

exports.getChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find().lean();
    
    // Add points based on difficulty for each challenge
    const challengesWithPoints = challenges.map(challenge => {
      const difficultyPoints = {
        'easy': 10,
        'medium': 20,
        'hard': 30
      };
      
      return {
        ...challenge,
        points: difficultyPoints[challenge.difficulty] || 0
      };
    });
    
    res.json(challengesWithPoints);
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({ message: 'Error fetching challenges' });
  }
};

exports.getChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id).lean();
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    
    // Add points based on difficulty
    const difficultyPoints = {
      'easy': 10,
      'medium': 20,
      'hard': 30
    };
    
    challenge.points = difficultyPoints[challenge.difficulty] || 0;
    
    res.json(challenge);
  } catch (error) {
    console.error('Error fetching challenge:', error);
    res.status(500).json({ message: 'Error fetching challenge' });
  }
};

exports.createChallenge = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const challenge = new Challenge(req.body);
    await challenge.save();
    res.status(201).json(challenge);
  } catch (error) {
    console.error('Error creating challenge:', error);
    res.status(500).json({ message: 'Error creating challenge' });
  }
};

exports.updateChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    res.json(challenge);
  } catch (error) {
    console.error('Error updating challenge:', error);
    res.status(500).json({ message: 'Error updating challenge' });
  }
};

exports.deleteChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findByIdAndDelete(req.params.id);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    res.json({ message: 'Challenge deleted successfully' });
  } catch (error) {
    console.error('Error deleting challenge:', error);
    res.status(500).json({ message: 'Error deleting challenge' });
  }
};
