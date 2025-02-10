// backend/controllers/submissionController.js
const Submission = require('../models/Submission');
const Challenge = require('../models/Challenge');
const { User, BADGES } = require('../models/User');
const axios = require('axios');

exports.submitSolution = async (req, res) => {
  try {
    const { challengeId, code, language } = req.body;
    const userId = req.user.id;

    console.log('Processing submission for user:', userId);

    // Get the challenge
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    // Create initial submission
    const submission = new Submission({
      user: userId,
      challenge: challengeId,
      code,
      language,
      passed: false
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

    submission.passed = overallPass;
    submission.testResults = testResults;
    await submission.save();

    // Always update totalSubmissions
    await User.findByIdAndUpdate(userId, {
      $inc: { totalSubmissions: 1 }
    });

    // Update user stats if passed
    if (overallPass) {
      const experiencePoints = 
        challenge.difficulty === 'easy' ? 10 :
        challenge.difficulty === 'medium' ? 20 : 30;

      // Get user
      const user = await User.findById(userId);
      const oldLevel = user.level;
      
      // Update XP
      user.experiencePoints += experiencePoints;
      
      // Update level and badge
      const updates = user.updateLevelAndBadge();
      user.level = updates.level;
      user.currentBadge = updates.currentBadge;
      
      // Save updates
      await user.save();

      // Check if user leveled up
      const leveledUp = updates.level > oldLevel;
      
      console.log('Updated user stats:', {
        userId,
        newExperiencePoints: user.experiencePoints,
        newLevel: updates.level,
        newBadge: updates.currentBadge,
        leveledUp
      });

      // Include level up information in response
      res.json({
        success: true,
        submission: {
          id: submission._id,
          passed: overallPass
        },
        testResults,
        experiencePointsEarned: experiencePoints,
        levelUp: leveledUp ? {
          newLevel: updates.level,
          newBadge: updates.currentBadge
        } : null
      });
    } else {
      res.json({
        success: true,
        submission: {
          id: submission._id,
          passed: overallPass
        },
        testResults
      });
    }

  } catch (error) {
    console.error('Submission error:', error);
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
