// backend/models/Submission.js
const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true
  },
  code: {
    type: String,
    required: true
  },
  passed: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending'
  },
  executionTime: {
    type: Number
  },
  output: {
    type: String
  },
  error: {
    type: String
  },
  statusId: {
    type: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Submission', submissionSchema);
