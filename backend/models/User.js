// backend/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({

  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, enum: ['admin', 'instructor', 'student'], default: 'student' },
  experiencePoints: { type: Number, default: 0 },
  badges: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
