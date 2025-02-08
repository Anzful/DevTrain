// backend/models/Competition.js
const mongoose = require('mongoose');

const CompetitionSchema = new mongoose.Schema({
  title: String,
  startTime: Date,
  endTime: Date,
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  challenges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' }],
  leaderboard: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    score: Number,
    time: Number
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Competition', CompetitionSchema);
