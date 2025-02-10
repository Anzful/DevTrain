// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
require('./config/passport'); // load OAuth strategies
const session = require('express-session');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Global map to store userId to socketId mappings for direct messaging
const connectedUsers = new Map();

// Set Mongoose strictQuery option
mongoose.set('strictQuery', false);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Socket.io middleware
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// MongoDB Connection with error handling
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB Connected Successfully');
  })
  .catch((err) => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    query: req.query,
    body: req.method === 'POST' ? req.body : undefined,
    headers: {
      authorization: req.headers.authorization ? 'Bearer [TOKEN]' : undefined
    }
  });
  next();
});

// Import routes
const authRoutes = require('./routes/auth');
const challengeRoutes = require('./routes/challenges');
const submissionRoutes = require('./routes/submissions');
const userRoutes = require('./routes/users');
const chatRoutes = require('./routes/chat');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);  // Add chat routes
app.use('/api/forum', require('./routes/forum'));
app.use('/api/competitions', require('./routes/competitions'));
app.use('/api/leaderboards', require('./routes/leaderboards'));
app.use('/api/messages', require('./routes/messages'));

// Socket.IO for chat and direct messaging
io.on('connection', (socket) => {
  const userId = socket.userId;
  connectedUsers.set(userId, socket.id);

  console.log(`User connected: ${userId}`);

  socket.on('message', async (data) => {
    try {
      const { to, content } = data;
      const from = userId;

      // Save message to database
      const Message = require('./models/Message');
      const message = new Message({
        from,
        to,
        content
      });
      await message.save();

      // Send to recipient if online
      const recipientSocketId = connectedUsers.get(to);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('message', {
          ...data,
          _id: message._id,
          createdAt: message.createdAt
        });
      }
    } catch (error) {
      console.error('Message handling error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('disconnect', () => {
    connectedUsers.delete(userId);
    console.log(`User disconnected: ${userId}`);
  });
});

// Add socket.io to request object
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});

// Export both app and server
module.exports = { app, server };
