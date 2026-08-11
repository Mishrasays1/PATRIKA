const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const User = require('../models/User');
const Story = require('../models/Story');
const VerificationLog = require('../models/VerificationLog');
const Report = require('../models/Report');

const seedData = async () => {
  try {
    console.log('Clearing old demo news data...');
    await Story.deleteMany({});
    await VerificationLog.deleteMany({});
    await Report.deleteMany({});
    console.log('Database clean! Ready for live citizen news submissions.');
  } catch (err) {
    console.error('Error clearing database:', err);
  }
};

if (require.main === module) {
  connectDB().then(() => {
    seedData().then(() => {
      process.exit(0);
    });
  });
}

module.exports = { seedData };
