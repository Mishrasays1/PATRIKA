const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Read MONGODB_URI strictly from environment variables (.env)
    const mongoUri = process.env.MONGODB_URI;

    if (mongoUri) {
      console.log('Connecting to MongoDB Atlas Cluster...');
      const conn = await mongoose.connect(mongoUri);
      console.log(`Connected to MongoDB Atlas Host: ${conn.connection.host}`);
      return conn;
    }

    // Dynamic Fallback: In-Memory DB for testing if MONGODB_URI is absent
    console.log('No MONGODB_URI environment variable detected. Initializing MongoMemoryServer fallback...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongoServer = await MongoMemoryServer.create();
    const memoryUri = mongoServer.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`Connected to MongoMemoryServer at ${memoryUri}`);
    return conn;

  } catch (err) {
    console.error(`MongoDB Connection Error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
