// backend/routes/submissions.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const { verifyToken } = require('../middleware/authMiddleware');
const Submission = require('../models/Submission');
const Challenge = require('../models/Challenge'); // to retrieve test cases

// Load environment variables
const JUDGE0_URL = process.env.JUDGE0_URL;         // e.g., "https://judge0-ce.p.rapidapi.com/submissions"
const JUDGE0_HOST = process.env.JUDGE0_HOST;           // e.g., "judge0-ce.p.rapidapi.com"
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;

// Language map for Judge0 numeric IDs (keys must be lowercase)
const languageMap = {
  javascript: 63,
  python: 71,
  cpp: 54,
  c: 50,
  // add more languages as needed
};

// Helper function to poll Judge0 for the result of a submission
const pollSubmissionResult = async (token) => {
  const POLL_INTERVAL = 1000; // 1 second
  const MAX_RETRIES = 10;
  for (let i = 0; i < MAX_RETRIES; i++) {
    const response = await axios.get(`${JUDGE0_URL}/${token}`, {
      headers: {
        'X-RapidAPI-Key': JUDGE0_API_KEY,
        'X-RapidAPI-Host': JUDGE0_HOST,
      },
    });
    // Judge0 status codes: 1 or 2 mean "in queue" or "processing"; >2 means finished.
    if (response.data.status.id > 2) {
      return response.data;
    }
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
  }
  throw new Error('Timed out waiting for Judge0 result');
};

// POST /api/submissions – Thorough checker that runs all test cases
router.post('/', verifyToken, async (req, res) => {
  try {
    const { challengeId, code, language } = req.body;
    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }

    // Normalize language string
    const normalizedLanguage = language.toLowerCase();
    const numericLangId = languageMap[normalizedLanguage];
    if (!numericLangId) {
      return res.status(400).json({ error: `Unsupported language: ${language}` });
    }

    // Retrieve the challenge document to get its test cases
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }
    if (!challenge.testCases || challenge.testCases.length === 0) {
      return res.status(400).json({ error: 'Challenge has no test cases defined' });
    }

    let testResults = [];
    // For each test case in the challenge, run the submitted code via Judge0
    for (let i = 0; i < challenge.testCases.length; i++) {
      const testCase = challenge.testCases[i];
      // Send the code along with the test case input (even if empty) to Judge0
      const judge0Response = await axios.post(
        JUDGE0_URL,
        {
          source_code: code,
          language_id: numericLangId,
          stdin: testCase.input || ""
        },
        {
          headers: {
            'X-RapidAPI-Key': JUDGE0_API_KEY,
            'X-RapidAPI-Host': JUDGE0_HOST,
            'Content-Type': 'application/json'
          }
        }
      );
      const token = judge0Response.data.token;
      let result;
      try {
        result = await pollSubmissionResult(token);
      } catch (err) {
        result = { stdout: "", stderr: "Timed out", status: { id: 0, description: "Timed out" } };
      }
      // Trim outputs to avoid whitespace differences
      const actualOutput = result.stdout ? result.stdout.trim() : "";
      const expectedOutput = testCase.expectedOutput.trim();
      const passed = (actualOutput === expectedOutput);
      testResults.push({
        index: i,
        input: testCase.input,
        expectedOutput,
        actualOutput,
        passed,
        time: result.time,
        memory: result.memory,
        compileOutput: result.compile_output || "",
        error: result.stderr ? result.stderr.trim() : ""
      });

      // Optional: Log for debugging
      console.log(`Test case ${i + 1}:`);
      console.log("Input:", testCase.input);
      console.log("Expected:", JSON.stringify(expectedOutput));
      console.log("Actual:", JSON.stringify(actualOutput));
      console.log("Passed:", passed);
    }

    // Determine overall pass/fail: All test cases must pass.
    const overallPass = testResults.every(tr => tr.passed);

    // Create a submission record and store detailed feedback (as JSON)
    const submission = await Submission.create({
      user: req.user.id,
      challenge: challengeId,
      code,
      language: normalizedLanguage,
      status: overallPass ? 'passed' : 'failed',
      feedback: JSON.stringify(testResults, null, 2)
    });

    return res.json({
      success: true,
      submission,
      testResults,
      overallPass
    });
  } catch (error) {
    console.error('Judge0 error:', error.response?.data || error.message);
    return res.status(500).json({
      error: 'Failed to submit the code. Please try again later.'
    });
  }
});

module.exports = router;
