const express = require('express');
const mongoose = require('mongoose');
mongoose.set('debug', true);
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas with explicit options and connection event logging
const mongooseOptions = {
  serverSelectionTimeoutMS: 10000, // 10s
};

mongoose.connect(process.env.MONGO_URI, mongooseOptions)
  .then(() => console.log('🌱 Connected to MongoDB Atlas successfully!'))
  .catch((err) => console.error('❌ Database connection error:', err));

const db = mongoose.connection;
db.on('connected', () => console.log('ℹ️ Mongoose connected to MongoDB'));
db.on('error', (err) => console.error('❌ Mongoose connection error:', err));
db.on('disconnected', () => console.warn('⚠️ Mongoose disconnected'));
db.on('reconnected', () => console.log('🔁 Mongoose reconnected'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: '🚀 Post Composer API is running!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is flying on port ${PORT}`);
});