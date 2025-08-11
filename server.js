
const authRoutes = require('./routes/authRoutes'); // ✅ import your auth route
const testRoutes = require('./routes/testRoutes'); // ✅ import your test route
const dotenv= require('dotenv');
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

dotenv.config({ path: path.resolve(__dirname, './.env') });
// Initialize Express app
const app = express();
const server = http.createServer(app);

// Database connection
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));
}
// 
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3100'
  ],
  credentials: true
}));

// Initialize Socket.io
const io = require('socket.io')(server, {
  cors: {
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('subscribeToTest', (testId) => {
    socket.join(testId);
    console.log(`Client subscribed to test ${testId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

app.set('io', io);


// Basic route for health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Mount routes
// app.use('/api/auth', authRoutes);
app.use('/api/auth', authRoutes); // ✅ mount auth routes here
app.use('/api/tests', testRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Production configuration
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.join(__dirname, '../frontend/build')));
//   app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
//   });
// }

// Start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});