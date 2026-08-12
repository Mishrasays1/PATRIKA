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
  adminApprovalStatus: { 
    type: String, 
    enum: ['none', 'pending', 'approved', 'rejected'], 
    default: 'none' 
  },
  isAdminVerified: { type: Boolean, default: false },
  adminRequestReason: { type: String, default: '' },
  location: { type: String, default: 'Ground Reporter Location' },
  avatar: { type: String, default: '' },
  bio: { type: String, default: 'Verified Citizen Journalist Profile' },
  reputationScore: { type: Number, default: 85 },
  badges: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
