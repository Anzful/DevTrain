require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('../models/User');

async function setAdmin() {
  try {
    // Set strictQuery to false to handle deprecation warning
    mongoose.set('strictQuery', false);

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get email from command line arguments
    const email = process.argv[2];
    if (!email) {
      console.error('Please provide an email address');
      process.exit(1);
    }

    // Find and update user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.error('User not found');
      process.exit(1);
    }

    user.isAdmin = true;
    await user.save();

    console.log(`Successfully set ${email} as admin`);
    
    // Close the connection
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

setAdmin(); 