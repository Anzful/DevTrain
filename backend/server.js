// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('./config/db');
const passport = require('passport');
require('./config/passport'); // load OAuth strategies
const session = require('express-session');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

// Global map to store userId to socketId mappings for direct messaging
<<<<<<< HEAD
const connectedUsers = new Map();
=======
const userSockets = new Map();
>>>>>>> 2aaa4a0f32c6f5f6905215075cd8474278ab18ec

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

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/challenges', require('./routes/challenges'));
app.use('/api/submissions', require('./routes/submissions'));
app.use('/api/forum', require('./routes/forum'));
app.use('/api/competitions', require('./routes/competitions'));
app.use('/api/users', require('./routes/users'));
app.use('/api/leaderboards', require('./routes/leaderboards'));
<<<<<<< HEAD
app.use('/api/messages', require('./routes/messages'));
=======
>>>>>>> 2aaa4a0f32c6f5f6905215075cd8474278ab18ec


// Socket.IO for chat and direct messaging
io.on('connection', (socket) => {
<<<<<<< HEAD
  console.log('New socket connection:', socket.id);

  socket.on('register', (userId) => {
    if (!userId) {
      console.warn('Registration attempted with null/undefined userId');
      return;
    }
    console.log('User registered:', { userId, socketId: socket.id });
    connectedUsers.set(userId, socket.id);
    
    // Log all connected users for debugging
    console.log('Currently connected users:', Array.from(connectedUsers.entries()));
  });

  socket.on('direct message', async (data) => {
    console.log('Direct message received:', data);
    const recipientSocketId = connectedUsers.get(data.to);
    
    if (recipientSocketId) {
      // Only send to recipient
      io.to(recipientSocketId).emit('direct message', data);
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        console.log(`Removing user ${userId} from connected users`);
        connectedUsers.delete(userId);
        break;
      }
=======
  console.log('New client connected', socket.id);

  // Handle registration: client emits "register" with their userId
  socket.on('register', (userId) => {
    socket.userId = userId; // attach userId to socket instance
    userSockets.set(userId, socket.id);
    console.log(`User ${userId} registered with socket id ${socket.id}`);
  });

  // Handle direct messages: expected data format: { from, to, message }
  socket.on('direct message', (data) => {
    const recipientSocketId = userSockets.get(data.to);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('direct message', data);
      console.log(`Direct message from ${data.from} to ${data.to}: ${data.message}`);
    } else {
      console.log(`User ${data.to} not connected.`);
    }
  });

  // Optionally, handle broadcast messages if needed
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
    if (socket.userId) {
      userSockets.delete(socket.userId);
      console.log(`User ${socket.userId} removed from registry`);
>>>>>>> 2aaa4a0f32c6f5f6905215075cd8474278ab18ec
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
