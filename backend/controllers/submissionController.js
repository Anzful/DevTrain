// backend/controllers/submissionController.js
const Submission = require('../models/Submission');
const Challenge = require('../models/Challenge');
const User = require('../models/User');
const axios = require('axios');

exports.submitSolution = async (req, res) => {
  try {
    const { challengeId, code, language } = req.body;
    const userId = req.user.id;

    console.log('Received submission:', { challengeId, language, userId });

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

    // Update user stats if passed
    if (overallPass) {
      const experiencePoints = 
        challenge.difficulty === 'easy' ? 10 :
        challenge.difficulty === 'medium' ? 20 : 30;

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $inc: {
            experiencePoints: experiencePoints,
            successfulSubmissions: 1
          }
        },
        { new: true }
      );

      console.log('Updated user stats:', {
        userId,
        experiencePoints: updatedUser.experiencePoints,
        successfulSubmissions: updatedUser.successfulSubmissions
      });
    }

    // Send detailed response
    res.json({
      success: true,
      submission: {
        id: submission._id,
        language,
        passed: overallPass
      },
      testResults,
      overallPass,
      language,
      judgeResults: {
        status: testResults[0]?.status || 'Unknown',
        executionTime: testResults[0]?.executionTime || 0,
        error: testResults[0]?.error
      }
    });

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
