require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import custom DB connection
const connectDB = require('./config/db');

// Import routes
const recipeRoutes = require('./routes/recipes');
const userRoutes = require('./routes/users');
const sessionRoutes = require('./routes/sessions');
const reviewRoutes = require('./routes/reviews');
const authRoutes = require('./routes/auth');
const collectionRoutes = require('./routes/collections');
const challengeRoutes = require('./routes/challenges');

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(helmet());

// Set default JWT secret if not provided (only for development)
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : 100 // Higher limit for dev
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files and static assets
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/recipes', recipeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/challenges', challengeRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Recipe App API is running',
    timestamp: new Date().toISOString()
  });
});

// Friendly root route
app.get('/', (req, res) => {
  res.send('API server is running!');
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
