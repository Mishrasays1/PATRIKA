const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const Story = require('../models/Story');

// GET reports (optionally filtered by storyId)
router.get('/', async (req, res) => {
  try {
    const { storyId } = req.query;
    let query = {};
    if (storyId) {
      query.storyId = storyId;
    }
    const reports = await Report.find(query).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST submit a misinformation flag report (1 flag per user per story)
router.post('/', async (req, res) => {
  try {
    const { storyId, reporterId, reporterName, reason, details } = req.body;
    if (!storyId || !reporterId) {
      return res.status(400).json({ error: 'Missing storyId or reporterId' });
    }

    // Check if user already flagged this story
    const existing = await Report.findOne({ storyId, reporterId });
    if (existing) {
      return res.status(400).json({ 
        error: 'You have already flagged this story. You can edit or delete your existing flag report.',
        existingReport: existing
      });
    }

    const newReport = new Report({
      storyId,
      reporterId,
      reporterName: reporterName || 'Community Member',
      reason,
      details,
      status: 'pending'
    });

    await newReport.save();

    // Increment flags count on the story
    await Story.findByIdAndUpdate(storyId, { $inc: { flagsCount: 1 } });

    res.status(201).json(newReport);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT Edit an existing flag report
router.put('/:id', async (req, res) => {
  try {
    const { reason, details } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { 
        ...(reason && { reason }),
        ...(details && { details })
      },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a flag report
router.delete('/:id', async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (report) {
      // Decrement flags count on the story
      await Story.findByIdAndUpdate(report.storyId, { 
        $inc: { flagsCount: -1 } 
      });
    }
    res.json({ message: 'Flag report deleted successfully', reportId: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT resolve report (Admin / Moderator)
router.put('/:id/resolve', async (req, res) => {
  try {
    const { status, resolutionNotes } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status, resolutionNotes },
      { new: true }
    );
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
