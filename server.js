// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('subscribeToTest', (testId) => {
    socket.join(testId);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// In your vote controller after saving a vote
io.to(testId).emit('voteUpdate', { testId, variantId, newVoteCount });