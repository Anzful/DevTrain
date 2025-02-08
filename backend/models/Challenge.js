// backend/models/Challenge.js
const mongoose = require('mongoose');

const ChallengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
  testCases: [{
    input: String,
    expectedOutput: String
  }],
  language: { type: String, default: 'javascript' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Challenge', ChallengeSchema);
