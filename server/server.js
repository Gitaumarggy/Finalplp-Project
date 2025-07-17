require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Custom DB connection
const connectDB = require('./config/db');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Allowed frontend origins (local + deployed Vercel)
const allowedOrigins = [
  'http://localhost:5173',
  'https://finalplp-project-nine.vercel.app',
  'https://finalplp-project-gitaumarggys-projects.vercel.app' // <-- Add your deployed Vercel frontend
];

// CORS Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or health checks)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parser
app.use(express.json());

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/recipes', require('./routes/recipes'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/collections', require('./routes/collections'));
app.use('/api/challenges', require('./routes/challenges'));

// Health Check
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Fallback Route (for unmatched API requests)
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'CORS error: Origin not allowed' });
  }
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Server error' });
});

// Connect to MongoDB and Start Server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(' MongoDB connection failed:', err.message);
  });
