require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const storyRoutes = require('./routes/storyRoutes');
const verificationRoutes = require('./routes/verificationRoutes');
const reportRoutes = require('./routes/reportRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Core Parsers & CORS Middleware FIRST
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 2. Ensure database connection middleware for serverless / cloud deployments
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection middleware error:', err);
    res.status(500).json({ error: 'Database connection error: ' + err.message });
  }
});

// 3. Mount API Routes directly
app.use('/api/auth', authRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/stats', statsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'online', 
    platform: 'PATRIKA Citizen Journalism Verification Engine',
    timestamp: new Date() 
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` PATRIKA Server running on http://localhost:${PORT}`);
    console.log(` Health Check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
}

module.exports = app;
