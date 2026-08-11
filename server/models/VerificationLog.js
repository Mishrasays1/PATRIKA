const mongoose = require('mongoose');

const verificationLogSchema = new mongoose.Schema({
  storyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Story', required: true },
  moderatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  moderatorName: { type: String, required: true },
  action: { 
    type: String, 
    enum: ['approve', 'reject', 'request_edits', 'flag'], 
    required: true 
  },
  trustScoreAssigned: { type: Number, default: 0 },
  checksCompleted: {
    mediaAuthenticity: { type: Boolean, default: false },
    sourceCrossCheck: { type: Boolean, default: false },
    locationVerified: { type: Boolean, default: false },
    metadataIntegrity: { type: Boolean, default: false }
  },
  notes: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VerificationLog', verificationLogSchema);
