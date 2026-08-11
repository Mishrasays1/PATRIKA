const express = require('express');
const router = express.Router();
const Story = require('../models/Story');
const Report = require('../models/Report');

// GET all stories with optional filters
router.get('/', async (req, res) => {
  try {
    const { category, status, trustLevel, search, reporterId } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }
    if (status) {
      query.status = status;
    }
    if (trustLevel && trustLevel !== 'All') {
      query.trustLevel = trustLevel;
    }
    if (reporterId) {
      query.reporter = reporterId;
    }
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { summary: new RegExp(search, 'i') },
        { content: new RegExp(search, 'i') },
        { category: new RegExp(search, 'i') }
      ];
    }

    const stories = await Story.find(query)
      .populate('reporter', 'name username email role reputationScore avatar')
      .sort({ createdAt: -1 });

    res.json(stories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single story by ID
router.get('/:id', async (req, res) => {
  try {
    const story = await Story.findById(req.params.id)
      .populate('reporter', 'name username email role reputationScore avatar bio badges');
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    story.views += 1;
    await story.save();
    res.json(story);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create story
router.post('/', async (req, res) => {
  try {
    const {
      title,
      summary,
      content,
      category,
      media,
      evidenceAttachments,
      reporterId,
      isUrgent
    } = req.body;

    const newStory = new Story({
      title,
      summary,
      content,
      category,
      media: media || [],
      evidenceAttachments: evidenceAttachments || [],
      status: 'approved',
      trustScore: 88,
      trustLevel: 'High Confidence',
      reporter: reporterId,
      isUrgent: isUrgent || false,
      upvotes: 0,
      downvotes: 0,
      votes: []
    });

    await newStory.save();
    const populated = await Story.findById(newStory._id).populate('reporter', 'name username role reputationScore');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE Published Story
router.delete('/:id', async (req, res) => {
  try {
    const storyId = req.params.id;
    const deletedStory = await Story.findByIdAndDelete(storyId);
    if (!deletedStory) {
      return res.status(404).json({ error: 'Story not found' });
    }
    await Report.deleteMany({ storyId });
    res.json({ message: 'Story deleted successfully from MongoDB', storyId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Vote Endpoint (TRUTH or FALSE)
router.post('/:id/vote', async (req, res) => {
  try {
    const { userId, voteType } = req.body;
    if (!userId || !['truth', 'false'].includes(voteType)) {
      return res.status(400).json({ error: 'Invalid vote parameters' });
    }

    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ error: 'Story not found' });

    if (!story.votes) story.votes = [];

    const existingIndex = story.votes.findIndex(v => v.userId === userId.toString());
    let actionTaken = '';

    if (existingIndex === -1) {
      story.votes.push({ userId: userId.toString(), voteType });
      actionTaken = `Voted ${voteType.toUpperCase()}`;
    } else {
      const existingVote = story.votes[existingIndex];
      if (existingVote.voteType === voteType) {
        story.votes.splice(existingIndex, 1);
        actionTaken = 'Removed vote';
      } else {
        story.votes[existingIndex].voteType = voteType;
        actionTaken = `Switched vote to ${voteType.toUpperCase()}`;
      }
    }

    const truthCount = story.votes.filter(v => v.voteType === 'truth').length;
    const falseCount = story.votes.filter(v => v.voteType === 'false').length;

    story.upvotes = truthCount;
    story.downvotes = falseCount;

    await story.save();
    res.json({
      action: actionTaken,
      upvotes: story.upvotes,
      downvotes: story.downvotes,
      userVote: story.votes.find(v => v.userId === userId.toString())?.voteType || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add comment
router.post('/:id/comments', async (req, res) => {
  try {
    const { userId, userName, userAvatar, text } = req.body;
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ error: 'Story not found' });

    story.comments.push({
      userId: userId || '',
      userName: userName || 'Anonymous Reader',
      userAvatar: userAvatar || '',
      text,
      createdAt: new Date()
    });

    await story.save();
    res.json(story.comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT edit comment
router.put('/:id/comments/:commentId', async (req, res) => {
  try {
    const { text } = req.body;
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ error: 'Story not found' });

    const comment = story.comments.id(req.params.commentId) || story.comments.find(c => c._id?.toString() === req.params.commentId || c.id === req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    comment.text = text;
    await story.save();
    res.json(story.comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE comment
router.delete('/:id/comments/:commentId', async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ error: 'Story not found' });

    story.comments = story.comments.filter(c => (c._id ? c._id.toString() !== req.params.commentId : c.id !== req.params.commentId));
    await story.save();
    res.json(story.comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
