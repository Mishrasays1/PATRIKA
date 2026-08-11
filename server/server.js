const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./config/db');
const Story = require('./models/Story');
const { seedData } = require('./seed/seedDatabase');

const authRoutes = require('./routes/authRoutes');
const storyRoutes = require('./routes/storyRoutes');
const verificationRoutes = require('./routes/verificationRoutes');
const reportRoutes = require('./routes/reportRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Rate Limiting Rules
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // Limit each IP to 150 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // Strict limit for OAuth attempts
  message: { error: 'Too many OAuth authentication attempts. Please wait 15 minutes before retrying.' }
});

const storySubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25, // Limit story submissions per 15 mins to prevent spam
  message: { error: 'Story submission rate limit reached. Please wait before submitting more reports.' }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply global rate limiting
app.use('/api', globalLimiter);

// Mount API Routes with specific rate limiters
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
    rateLimiting: 'active (150 req / 15 mins)',
    timestamp: new Date() 
  });
});

// Connect to Database & Start Server
const startServer = async () => {
  await connectDB();

  // Auto seed if database has 0 stories
  const count = await Story.countDocuments();
  if (count === 0) {
    console.log('Database empty on startup. Triggering auto-seeder...');
    await seedData();
  }

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` PATRIKA Server running on http://localhost:${PORT}`);
    console.log(` API Rate Limiting: ACTIVE`);
    console.log(` Health Check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
};

startServer();
