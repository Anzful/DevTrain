const mongoose = require('mongoose');

const dbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/elearning';

// Suppress strictQuery warning (Prepare for Mongoose 7)
mongoose.set('strictQuery', false);

mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.connection.on('connected', () =>
  console.log('✅ MongoDB Connected:', dbURI)
);
mongoose.connection.on('error', (err) =>
  console.error('❌ MongoDB Connection Error:', err)
);

module.exports = mongoose;
