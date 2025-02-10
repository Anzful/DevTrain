// backend/models/Challenge.js
const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  language: {
    type: String,
    enum: ['python', 'javascript'],
    required: true
  },
  testCases: [{
    input: String,
    expectedOutput: String
  }],
  createdAt: { type: Date, default: Date.now },
}, {
  timestamps: true
});

module.exports = mongoose.model('Challenge', challengeSchema);
