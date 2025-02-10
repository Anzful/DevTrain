// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define badge levels and requirements
const BADGES = {
  NOVICE: { name: 'Novice Coder', minXP: 0, image: '🔰' },
  APPRENTICE: { name: 'Apprentice Developer', minXP: 100, image: '⭐' },
  SKILLED: { name: 'Skilled Programmer', minXP: 250, image: '🌟' },
  EXPERT: { name: 'Expert Engineer', minXP: 500, image: '💫' },
  MASTER: { name: 'Master Developer', minXP: 1000, image: '👑' },
  GURU: { name: 'Coding Guru', minXP: 2000, image: '🏆' },
  LEGEND: { name: 'Programming Legend', minXP: 5000, image: '🔮' }
};

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  experiencePoints: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  currentBadge: {
    name: {
      type: String,
      default: BADGES.NOVICE.name
    },
    image: {
      type: String,
      default: BADGES.NOVICE.image
    }
  },
  successfulSubmissions: {
    type: Number,
    default: 0
  },
  totalSubmissions: {
    type: Number,
    default: 0
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  role: { type: String, enum: ['admin', 'instructor', 'student'], default: 'student' },
  badges: [String]
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update the comparePassword method to handle both hashed and unhashed passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    // Check if the stored password is already hashed (starts with $2a$ or $2b$)
    if (this.password.startsWith('$2')) {
      return await bcrypt.compare(candidatePassword, this.password);
    } else {
      // For old users, directly compare and update to hashed password
      if (this.password === candidatePassword) {
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(candidatePassword, salt);
        await this.save();
        return true;
      }
      return false;
    }
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

// Calculate level based on XP
function calculateLevel(xp) {
  // Level formula: level = 1 + floor(sqrt(xp/100))
  return Math.floor(1 + Math.sqrt(xp/100));
}

// Calculate XP needed for next level
function xpForNextLevel(currentLevel) {
  return Math.pow((currentLevel), 2) * 100;
}

// Get current badge based on XP
function getCurrentBadge(xp) {
  return Object.values(BADGES)
    .reverse()
    .find(badge => xp >= badge.minXP);
}

// Method to update level and badge
userSchema.methods.updateLevelAndBadge = function() {
  const newLevel = calculateLevel(this.experiencePoints);
  const newBadge = getCurrentBadge(this.experiencePoints);
  
  const updates = {
    level: newLevel,
    currentBadge: {
      name: newBadge.name,
      image: newBadge.image
    }
  };

  return updates;
};

// Static method to get level progress
userSchema.statics.getLevelProgress = function(xp) {
  const currentLevel = calculateLevel(xp);
  const currentLevelXP = Math.pow((currentLevel - 1), 2) * 100;
  const nextLevelXP = xpForNextLevel(currentLevel);
  const progress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  return {
    currentLevel,
    currentLevelXP,
    nextLevelXP,
    progress: Math.min(100, Math.max(0, progress)),
    currentBadge: getCurrentBadge(xp)
  };
};

const User = mongoose.model('User', userSchema);

module.exports = { User, BADGES, calculateLevel, xpForNextLevel, getCurrentBadge };
