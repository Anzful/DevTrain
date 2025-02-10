require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User } = require('../models/User');

async function migratePasswords() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({
      password: { $not: /^\$2[ab]\$/ } // Find users whose passwords don't start with $2a$ or $2b$
    });

    console.log(`Found ${users.length} users to migrate`);

    for (const user of users) {
      try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        
        await User.updateOne(
          { _id: user._id },
          { $set: { password: hashedPassword } }
        );
        
        console.log(`Migrated password for user: ${user.email}`);
      } catch (error) {
        console.error(`Error migrating user ${user.email}:`, error);
      }
    }

    console.log('Password migration completed');
    process.exit(0);
  } catch (error) {
    console.error('Migration script error:', error);
    process.exit(1);
  }
}

migratePasswords(); 