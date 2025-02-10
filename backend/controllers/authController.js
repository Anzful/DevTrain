// backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, BADGES } = require('../models/User');

exports.register = async (req, res) => {
  try {
    console.log('Registration request received:', {
      ...req.body,
      password: req.body.password ? '[PROVIDED]' : '[MISSING]'
    });

    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Please provide all required fields',
        received: { 
          name: !!name,
          email: !!email,
          password: !!password
        }
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user (password will be hashed by pre-save middleware)
    const user = new User({
      name,
      email,
      password,
      currentBadge: {
        name: BADGES.NOVICE.name,
        image: BADGES.NOVICE.image
      }
    });

    // Save user
    const savedUser = await user.save();
    console.log('User saved successfully:', savedUser._id);

    // Create token
    const token = jwt.sign(
      { id: savedUser._id, role: 'student' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Send response
    res.status(201).json({
      success: true,
      token,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        level: savedUser.level,
        currentBadge: savedUser.currentBadge,
        experiencePoints: savedUser.experiencePoints
      }
    });

  } catch (error) {
    console.error('Registration error details:', {
      message: error.message,
      name: error.name,
      body: { ...req.body, password: '[HIDDEN]' }
    });
    
    res.status(500).json({ 
      message: 'Error in registration',
      error: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create token with admin role if user is admin
    const token = jwt.sign(
      { 
        id: user._id,
        role: user.isAdmin ? 'admin' : 'user'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    console.log('Login successful:', {
      userId: user._id,
      isAdmin: user.isAdmin,
      role: user.isAdmin ? 'admin' : 'user'
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ 
      message: 'Error getting current user',
      error: error.message 
    });
  }
};

exports.logout = (req, res) => {
  req.logout();
  res.json({ message: 'Logged out' });
};

exports.oauthCallback = (req, res) => {
  const user = req.user;
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '1d' }
  );
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?token=${token}`);
};
