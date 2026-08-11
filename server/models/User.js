const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { 
    type: String, 
    unique: true, 
    sparse: true, 
    trim: true, 
    lowercase: true 
  },
  email: { type: String, required: true, unique: true, lowercase: true },
  role: { 
    type: String, 
    enum: ['reporter', 'moderator', 'admin', 'reader'], 
    default: 'reporter' 
  },
  avatar: { type: String, default: '' },
  bio: { type: String, default: 'Verified Citizen Journalist Profile' },
  reputationScore: { type: Number, default: 85 },
  badges: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
