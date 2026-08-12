const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (mongoUri) {
      console.log('Connecting to MongoDB Atlas Cluster...');
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        tls: true,
        tlsAllowInvalidCertificates: true
      });
      console.log(`Connected to MongoDB Atlas Host: ${conn.connection.host}`);
      return conn;
    }

    console.log('No MONGODB_URI environment variable detected. Attempting MongoMemoryServer fallback...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const memoryUri = mongoServer.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`Connected to MongoMemoryServer at ${memoryUri}`);
      return conn;
    } catch (memErr) {
      throw new Error('MONGODB_URI environment variable is missing and in-memory fallback is unavailable.');
    }

  } catch (err) {
    console.error(`MongoDB Connection Error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
module.exports.connectDB = connectDB;
