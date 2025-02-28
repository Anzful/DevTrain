// backend/controllers/challengeController.js
const Challenge = require('../models/Challenge');
const Submission = require('../models/Submission');
const mongoose = require('mongoose');

exports.getChallenges = async (req, res) => {
  try {
    // Build query based on filters
    const query = {};
    
    // Filter by category if provided
    if (req.query.category && req.query.category !== 'all') {
      query.category = req.query.category;
    }
    
    // Filter by difficulty if provided
    if (req.query.difficulty && req.query.difficulty !== 'all') {
      query.difficulty = req.query.difficulty;
    }
    
    const challenges = await Challenge.find(query).lean();
    
    // Add points based on difficulty for each challenge
    const challengesWithPoints = challenges.map(challenge => {
      const difficultyPoints = {
        'easy': 10,
        'medium': 20,
        'hard': 30
      };
      
      return {
        ...challenge,
        points: difficultyPoints[challenge.difficulty] || 0,
        completed: false // Default to not completed
      };
    });
    
    // If user is authenticated, check which challenges they've completed
    if (req.user && req.user.id) {
      // Find all successful submissions by this user
      const successfulSubmissions = await Submission.find({
        user: mongoose.Types.ObjectId(req.user.id),
        status: 'success'
      }).distinct('challenge');
      
      console.log(`Found ${successfulSubmissions.length} completed challenges for user ${req.user.id}`);
      
      // Convert ObjectIds to strings for easier comparison
      const completedChallengeIds = successfulSubmissions.map(id => id.toString());
      
      // Mark challenges as completed if the user has a successful submission
      challengesWithPoints.forEach(challenge => {
        challenge.completed = completedChallengeIds.includes(challenge._id.toString());
      });
    }
    
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
    
    // Default completion status
    challenge.completed = false;
    
    // If user is authenticated, check if they've completed this challenge
    if (req.user && req.user.id) {
      const successfulSubmission = await Submission.findOne({
        user: mongoose.Types.ObjectId(req.user.id),
        challenge: mongoose.Types.ObjectId(challenge._id),
        status: 'success'
      });
      
      challenge.completed = !!successfulSubmission;
    }
    
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

// Get all available categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Challenge.distinct('category');
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
};
