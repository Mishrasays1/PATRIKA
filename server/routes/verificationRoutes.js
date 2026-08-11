const express = require('express');
const router = express.Router();
const Story = require('../models/Story');
const VerificationLog = require('../models/VerificationLog');
const User = require('../models/User');

// GET verification logs for a story
router.get('/logs/:storyId', async (req, res) => {
  try {
    const logs = await VerificationLog.find({ storyId: req.params.storyId })
      .sort({ timestamp: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all verification audit logs (for Admin/Moderator view)
router.get('/logs', async (req, res) => {
  try {
    const logs = await VerificationLog.find()
      .populate('storyId', 'title category status')
      .sort({ timestamp: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST execute verification decision (Approve / Reject / Request Edits)
router.post('/decide', async (req, res) => {
  try {
    const {
      storyId,
      moderatorId,
      moderatorName,
      action, // 'approve', 'reject', 'request_edits'
      trustScoreAssigned,
      checksCompleted,
      notes
    } = req.body;

    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    let status = 'pending';
    let trustLevel = 'Unverified';
    const score = Number(trustScoreAssigned) || 0;

    if (action === 'approve') {
      status = 'approved';
      if (score >= 85) trustLevel = 'High Confidence';
      else if (score >= 65) trustLevel = 'Medium Confidence';
      else trustLevel = 'Needs Edits';
    } else if (action === 'reject') {
      status = 'rejected';
      trustLevel = 'Rejected';
    } else if (action === 'request_edits') {
      status = 'edits_requested';
      trustLevel = 'Needs Edits';
    }

    story.status = status;
    story.trustScore = score;
    story.trustLevel = trustLevel;
    story.reviewerNotes = notes || '';
    if (checksCompleted) {
      story.verificationChecklist = checksCompleted;
    }

    await story.save();

    // Create Verification Log entry
    const log = new VerificationLog({
      storyId: story._id,
      moderatorId: moderatorId || null,
      moderatorName: moderatorName || 'Verified Moderator',
      action,
      trustScoreAssigned: score,
      checksCompleted: checksCompleted || story.verificationChecklist,
      notes: notes || ''
    });
    await log.save();

    // Boost reporter reputation if story was approved with high confidence
    if (action === 'approve' && story.reporter) {
      await User.findByIdAndUpdate(story.reporter, {
        $inc: { reputationScore: 5 }
      });
    }

    res.json({ story, log });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
