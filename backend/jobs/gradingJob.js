// backend/jobs/gradingJob.js
const { Queue, Worker } = require('bullmq');
const Submission = require('../models/Submission');
const { executeCode } = require('../utils/judge0');
const { getCodeFeedback } = require('../utils/openai');
const redisClient = require('../config/redis');

const connection = redisClient;

const gradingQueue = new Queue('gradingQueue', { connection });

const worker = new Worker('gradingQueue', async job => {
  if (job.name === 'gradeSubmission') {
    const { submissionId } = job.data;
    const submission = await Submission.findById(submissionId).populate('challenge');
    if (!submission) throw new Error('Submission not found');
    
    // Execute code on each test case (simplified)
    let passedAll = true;
    for (let testCase of submission.challenge.testCases) {
      const result = await executeCode(submission.code, submission.language, testCase.input);
      if (result.trim() !== testCase.expectedOutput.trim()) {
        passedAll = false;
        break;
      }
    }
    
    // Get AI feedback from OpenAI
    const feedback = await getCodeFeedback(submission.code);
    submission.status = passedAll ? 'success' : 'failed';
    submission.feedback = feedback;
    await submission.save();
  }
}, { connection });

worker.on('completed', job => console.log(`Job ${job.id} completed`));
worker.on('failed', (job, err) => console.error(`Job ${job.id} failed:`, err));

module.exports = { gradingQueue };
