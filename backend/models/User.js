// backend/models/User.js
const mongoose = require('mongoose');

<<<<<<< HEAD
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  role: { type: String, enum: ['admin', 'instructor', 'student'], default: 'student' },
  experiencePoints: {
    type: Number,
    default: 0
  },
  successfulSubmissions: {
    type: Number,
    default: 0
  },
  badges: [String]
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model('User', userSchema);
=======
const UserSchema = new mongoose.Schema({

  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, enum: ['admin', 'instructor', 'student'], default: 'student' },
  experiencePoints: { type: Number, default: 0 },
  badges: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
>>>>>>> 2aaa4a0f32c6f5f6905215075cd8474278ab18ec
