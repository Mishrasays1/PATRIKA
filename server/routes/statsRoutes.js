const express = require('express');
const router = express.Router();
const Story = require('../models/Story');
const User = require('../models/User');
const Report = require('../models/Report');

router.get('/', async (req, res) => {
  try {
    const totalStories = await Story.countDocuments();
    const approvedStories = await Story.countDocuments({ status: 'approved' });
    const pendingStories = await Story.countDocuments({ status: 'pending' });
    const rejectedStories = await Story.countDocuments({ status: 'rejected' });
    const editsRequestedStories = await Story.countDocuments({ status: 'edits_requested' });

    const totalUsers = await User.countDocuments();
    const reportersCount = await User.countDocuments({ role: 'reporter' });
    const moderatorsCount = await User.countDocuments({ role: 'moderator' });

    const totalReports = await Report.countDocuments();
    const resolvedReports = await Report.countDocuments({ status: 'action_taken' });

    // Category distribution
    const categoryStats = await Story.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Trust Level distribution
    const trustLevelStats = await Story.aggregate([
      { $group: { _id: '$trustLevel', count: { $sum: 1 } } }
    ]);

    // Calculate percentage verified
    const percentVerified = totalStories > 0 
      ? Math.round((approvedStories / totalStories) * 100) 
      : 0;

    // Average trust score of published content
    const trustAvgResult = await Story.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, avgTrust: { $avg: '$trustScore' } } }
    ]);
    const avgTrustScore = trustAvgResult.length > 0 ? Math.round(trustAvgResult[0].avgTrust) : 88;

    res.json({
      totalStories,
      approvedStories,
      pendingStories,
      rejectedStories,
      editsRequestedStories,
      totalUsers,
      reportersCount,
      moderatorsCount,
      totalReports,
      resolvedReports,
      percentVerified,
      avgTrustScore,
      categoryStats: categoryStats.map(c => ({ category: c._id || 'General', count: c.count })),
      trustLevelStats: trustLevelStats.map(t => ({ level: t._id || 'Unverified', count: t.count }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
