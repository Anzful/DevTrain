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
const userSockets = new Map();

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


// Socket.IO for chat and direct messaging
io.on('connection', (socket) => {
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
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
