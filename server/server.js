require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const storyRoutes = require('./routes/storyRoutes');
const verificationRoutes = require('./routes/verificationRoutes');
const reportRoutes = require('./routes/reportRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure database connection middleware for serverless / cloud deployments
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ error: 'Database connection error: ' + err.message });
  }
});

// Rate Limiting Rules
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many OAuth authentication attempts. Please wait 15 minutes before retrying.' }
});

const storySubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  message: { error: 'Story submission rate limit reached. Please wait before submitting more reports.' }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply global rate limiting
app.use('/api', globalLimiter);

// Mount API Routes
app.use('/api/auth/google', authLimiter);
app.use('/api/auth', authRoutes);

app.post('/api/stories', storySubmissionLimiter);
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
