// backend/models/Submission.js
const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  challenge: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' },
  code: String,
  language: String,
  status: { type: String, enum: ['pending', 'passed', 'failed'], default: 'pending' },
  feedback: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Submission', SubmissionSchema);
