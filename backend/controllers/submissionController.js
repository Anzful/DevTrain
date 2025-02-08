// backend/controllers/submissionController.js
const Submission = require('../models/Submission');
const { gradingQueue } = require('../jobs/gradingJob');

exports.submitCode = async (req, res) => {
  try {
    const { challengeId, code, language } = req.body;
    const submission = new Submission({
      user: req.user.id,
      challenge: challengeId,
      code,
      language
    });
    await submission.save();
    // Enqueue a job for grading
    await gradingQueue.add('gradeSubmission', { submissionId: submission._id });
    res.status(201).json({ message: 'Submission received', submission });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    res.json(submission);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
