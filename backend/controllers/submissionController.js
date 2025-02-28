// backend/controllers/submissionController.js
const Submission = require('../models/Submission');
const Challenge = require('../models/Challenge');
const { User } = require('../models/User');
const axios = require('axios');

exports.submitSolution = async (req, res) => {
  try {
    const { challengeId, code, language } = req.body;
    const userId = req.user.id;

    console.log('Starting submission process:', { userId, challengeId, language });

    // Get the challenge
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      console.log('Challenge not found:', challengeId);
      return res.status(404).json({ message: 'Challenge not found' });
    }

    console.log('Found challenge:', {
      id: challenge._id,
      title: challenge.title,
      difficulty: challenge.difficulty
    });

    // Create initial submission
    const submission = new Submission({
      user: userId,
      challenge: challengeId,
      code,
      language,
      passed: false,
      status: 'pending'
    });

    // Process test cases
    const testResults = [];
    let overallPass = true;

    for (const testCase of challenge.testCases) {
      try {
        console.log('Processing test case:', testCase);
        
        const judgeResponse = await axios.post('http://localhost:2358/submissions', {
          source_code: code,
          language_id: language === 'python' ? 71 : 62,
          stdin: testCase.input,
          expected_output: testCase.output
        });

        const token = judgeResponse.data.token;
        let judgeResult;
        let attempts = 0;

        // Poll for results
        while (attempts < 10) {
          const resultResponse = await axios.get(`http://localhost:2358/submissions/${token}`);
          if (resultResponse.data.status.id !== 1 && resultResponse.data.status.id !== 2) {
            judgeResult = resultResponse.data;
            break;
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
          attempts++;
        }

        const testPassed = judgeResult.status.id === 3 && 
                          judgeResult.stdout.trim() === testCase.output.trim();
        
        if (!testPassed) overallPass = false;

        testResults.push({
          passed: testPassed,
          input: testCase.input,
          expectedOutput: testCase.output,
          actualOutput: judgeResult.stdout,
          error: judgeResult.stderr,
          status: judgeResult.status.description,
          executionTime: judgeResult.time
        });

      } catch (error) {
        console.error('Judge0 error:', error);
        overallPass = false;
        testResults.push({
          passed: false,
          error: 'Execution error'
        });
      }
    }

    console.log('All test results:', testResults);
    console.log('Overall pass status:', overallPass);

    // Update submission status
    submission.passed = overallPass;
    submission.status = overallPass ? 'success' : 'failed';
    
    console.log('Saving submission:', {
      id: submission._id,
      passed: submission.passed,
      status: submission.status
    });
    
    try {
      await submission.save();
      console.log('Submission saved successfully');
    } catch (saveError) {
      console.error('Error saving submission:', saveError);
      throw saveError;  // Re-throw to be caught by outer try-catch
    }
    
    // If tests failed, return early
    if (!overallPass) {
      console.log('Tests failed, returning without updating user stats');
      return res.json({
        success: true,
        submission: {
          id: submission._id,
          passed: false
        },
        testResults
      });
    }

    console.log('Tests passed, attempting to update user stats');

    try {
      // Get challenge difficulty and calculate XP
      const difficulty = challenge.difficulty.toLowerCase();
      const difficultyPoints = {
        'easy': 10,
        'medium': 20,
        'hard': 30
      };
      const experiencePoints = difficultyPoints[difficulty] || 0;

      console.log('Challenge details:', {
        difficulty,
        experiencePoints
      });

      // Find and update user
      console.log('Finding user with ID:', userId);
      const user = await User.findById(userId);
      
      if (!user) {
        console.error('User not found:', userId);
        throw new Error('User not found');
      }

      console.log('Current user stats:', {
        id: user._id,
        xp: user.experiencePoints,
        level: user.level,
        badge: user.currentBadge
      });

      // Update user stats
      const oldXP = user.experiencePoints || 0;
      const oldLevel = user.level || 1;

      user.experiencePoints = oldXP + experiencePoints;
      
      // Update level and badge
      const updates = user.updateLevelAndBadge();
      user.level = updates.level;
      user.currentBadge = updates.currentBadge;

      console.log('New user stats:', {
        xp: user.experiencePoints,
        level: user.level,
        badge: user.currentBadge
      });

      // Save user changes
      await user.save();
      console.log('User stats updated successfully');

      // Return success response with updates
      return res.json({
        success: true,
        submission: {
          id: submission._id,
          passed: true
        },
        testResults,
        userUpdates: {
          experiencePointsEarned: experiencePoints,
          oldXP,
          newTotalXP: user.experiencePoints,
          oldLevel,
          newLevel: user.level,
          newBadge: user.currentBadge
        }
      });

    } catch (updateError) {
      console.error('Error updating user stats:', updateError);
      console.error(updateError.stack);
      return res.json({
        success: true,
        submission: {
          id: submission._id,
          passed: true
        },
        testResults,
        error: 'Submission successful but failed to update user stats',
        errorDetails: updateError.message
      });
    }

  } catch (error) {
    console.error('Submission error:', error);
    console.error(error.stack);
    res.status(500).json({
      success: false,
      message: 'Error processing submission',
      error: error.message
    });
  }
};

// Get user's submissions
exports.getUserSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ user: req.user.id })
      .populate('challenge')
      .sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get specific submission
exports.getSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('challenge')
      .populate('user', 'name');
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
