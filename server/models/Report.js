const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  storyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Story', required: true },
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reporterName: { type: String, required: true },
  reason: { 
    type: String, 
    enum: [
      'Misleading Headline', 
      'Fake/Manipulated Media', 
      'Unverified Rumor', 
      'Out of Context', 
      'Hate Speech / Inappropriate'
    ], 
    required: true 
  },
  details: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['pending', 'reviewed', 'dismissed', 'action_taken'], 
    default: 'pending' 
  },
  resolutionNotes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', reportSchema);
