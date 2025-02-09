require('dotenv').config();
const mongoose = require('../config/db');
const User = require('../models/User');

async function setAdmin(email) {
  try {
    const user = await User.findOneAndUpdate(
      { email },
      { isAdmin: true },
      { new: true }
    );

    if (user) {
      console.log(`User ${email} is now an admin`);
    } else {
      console.log(`User ${email} not found`);
    }
  } catch (error) {
    console.error('Error setting admin:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Replace with your email
setAdmin('anzotheadmin@gmail.com'); 