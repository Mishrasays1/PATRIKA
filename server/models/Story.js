const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  title: { type: String, required: true },
  summary: { type: String, required: true },
  content: { type: String, required: true },
  location: { type: String, default: 'North District, Sector 4' },
  category: { 
    type: String, 
    enum: [
      'Civic Infrastructure', 
      'Environment', 
      'Local Governance', 
      'Crime & Safety', 
      'Health & Sanitation', 
      'Community Events', 
      'Breaking News'
    ], 
    required: true 
  },
  media: [{
    url: { type: String, required: true },
    type: { type: String, enum: ['image', 'video'], default: 'image' },
    caption: { type: String, default: '' }
  }],
  evidenceAttachments: [{
    title: { type: String, required: true },
    url: { type: String, default: '' },
    type: { type: String, enum: ['document', 'photo', 'link', 'eyewitness', 'video'], default: 'photo' },
    description: { type: String, default: '' }
  }],
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'approved' 
  },
  trustScore: { type: Number, default: 85 },
  trustLevel: { 
    type: String, 
    enum: ['High Confidence', 'Medium Confidence', 'Needs Edits', 'Unverified', 'Rejected'], 
    default: 'High Confidence' 
  },
  reporter: { 
    type: mongoose.Schema.Types.Mixed,
    required: false 
  },
  reviewerNotes: { type: String, default: 'Ground evidence cross-verified by community moderators.' },
  verificationChecklist: {
    mediaAuthenticity: { type: Boolean, default: true },
    sourceCrossCheck: { type: Boolean, default: true },
    locationVerified: { type: Boolean, default: true },
    metadataIntegrity: { type: Boolean, default: true }
  },
  isUrgent: { type: Boolean, default: false },
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  votes: [{
    userId: { type: String, required: true },
    voteType: { type: String, enum: ['truth', 'false'], required: true }
  }],
  views: { type: Number, default: 0 },
  comments: [{
    id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    userId: { type: String, default: '' },
    userName: { type: String, required: true },
    userAvatar: { type: String, default: '' },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  flagsCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model('Story', storySchema);
