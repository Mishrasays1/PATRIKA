const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

async function testAtlas() {
  try {
    if (!uri) {
      console.log('No MONGODB_URI found in environment variables.');
      process.exit(0);
    }
    console.log('Connecting directly to MongoDB Atlas URI from .env...');
    await mongoose.connect(uri);
    console.log('Successfully connected to host:', mongoose.connection.host);

    const db = mongoose.connection.db;
    console.log('Target Database Name:', db.databaseName);

    const collections = await db.listCollections().toArray();
    console.log('Existing Collections in patrika:', collections.map(c => c.name));

    process.exit(0);
  } catch (err) {
    console.error('Atlas Direct Test Error:', err);
    process.exit(1);
  }
}

testAtlas();
