const test = require('node:test');
const assert = require('node:assert/strict');

// --- PURE CORE LOGIC FUNCTIONS TO TEST ---

/**
 * 1. Username Sanitizer Function
 */
function sanitizeUsername(input) {
  if (!input || typeof input !== 'string') return '';
  return input
    .toLowerCase()
    .trim()
    .replace(/^@/, '')
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * 2. Per-User Single-Vote Engine Function (Truth vs False)
 */
function calculateUserVote(existingVotes = [], userId, newVoteType) {
  const votes = [...existingVotes.map(v => ({ ...v }))];
  const existingIndex = votes.findIndex(v => v.userId === userId.toString());
  let actionTaken = '';

  if (existingIndex === -1) {
    // Initial Vote
    votes.push({ userId: userId.toString(), voteType: newVoteType });
    actionTaken = `Voted ${newVoteType.toUpperCase()}`;
  } else {
    const existingVote = votes[existingIndex];
    if (existingVote.voteType === newVoteType) {
      // Toggle Off
      votes.splice(existingIndex, 1);
      actionTaken = 'Removed vote';
    } else {
      // Switch Vote
      votes[existingIndex].voteType = newVoteType;
      actionTaken = `Switched vote to ${newVoteType.toUpperCase()}`;
    }
  }

  const upvotes = votes.filter(v => v.voteType === 'truth').length;
  const downvotes = votes.filter(v => v.voteType === 'false').length;

  return { votes, upvotes, downvotes, actionTaken };
}

/**
 * 3. Flag Report Duplicate Prevention Helper
 */
function canUserReportStory(reports = [], storyId, reporterId) {
  return !reports.some(r => r.storyId === storyId && r.reporterId === reporterId);
}

/**
 * 4. Comment Edit & Delete Helpers
 */
function editComment(comments = [], commentId, newText) {
  return comments.map(c => {
    if (c.id === commentId || c._id === commentId) {
      return { ...c, text: newText };
    }
    return c;
  });
}

function deleteComment(comments = [], commentId) {
  return comments.filter(c => c.id !== commentId && c._id !== commentId);
}

// --- UNIT TEST SUITE ---

test('1. Username Sanitizer Unit Tests', async (t) => {
  await t.test('converts uppercase and spaces to clean handles', () => {
    assert.equal(sanitizeUsername('Rahul Verma'), 'rahul_verma');
  });

  await t.test('strips leading @ sign and special characters', () => {
    assert.equal(sanitizeUsername('@Rahul!#Verma 2026'), 'rahul_verma_2026');
  });

  await t.test('handles empty or non-string input safely', () => {
    assert.equal(sanitizeUsername(null), '');
    assert.equal(sanitizeUsername(''), '');
  });
});

test('2. Single-Vote Engine Logic Unit Tests', async (t) => {
  await t.test('records initial Truth vote correctly', () => {
    const res = calculateUserVote([], 'user_1', 'truth');
    assert.equal(res.upvotes, 1);
    assert.equal(res.downvotes, 0);
    assert.equal(res.votes.length, 1);
    assert.equal(res.actionTaken, 'Voted TRUTH');
  });

  await t.test('toggles off vote if user clicks same vote twice', () => {
    const initialVotes = [{ userId: 'user_1', voteType: 'truth' }];
    const res = calculateUserVote(initialVotes, 'user_1', 'truth');
    assert.equal(res.upvotes, 0);
    assert.equal(res.downvotes, 0);
    assert.equal(res.votes.length, 0);
    assert.equal(res.actionTaken, 'Removed vote');
  });

  await t.test('switches vote from Truth to False cleanly', () => {
    const initialVotes = [{ userId: 'user_1', voteType: 'truth' }];
    const res = calculateUserVote(initialVotes, 'user_1', 'false');
    assert.equal(res.upvotes, 0);
    assert.equal(res.downvotes, 1);
    assert.equal(res.votes.length, 1);
    assert.equal(res.votes[0].voteType, 'false');
    assert.equal(res.actionTaken, 'Switched vote to FALSE');
  });

  await t.test('calculates correct counts across multiple distinct users', () => {
    let votes = [];
    votes = calculateUserVote(votes, 'user_1', 'truth').votes;
    votes = calculateUserVote(votes, 'user_2', 'truth').votes;
    const finalState = calculateUserVote(votes, 'user_3', 'false');
    
    assert.equal(finalState.upvotes, 2);
    assert.equal(finalState.downvotes, 1);
    assert.equal(finalState.votes.length, 3);
  });
});

test('3. Misinformation Report Duplicate Prevention Unit Tests', async (t) => {
  const existingReports = [
    { storyId: 'story_A', reporterId: 'user_1', reason: 'Misleading Headline' }
  ];

  await t.test('prevents duplicate report from same user on same story', () => {
    const allowed = canUserReportStory(existingReports, 'story_A', 'user_1');
    assert.equal(allowed, false);
  });

  await t.test('allows different user to report the same story', () => {
    const allowed = canUserReportStory(existingReports, 'story_A', 'user_2');
    assert.equal(allowed, true);
  });

  await t.test('allows same user to report a different story', () => {
    const allowed = canUserReportStory(existingReports, 'story_B', 'user_1');
    assert.equal(allowed, true);
  });
});

test('4. Comment Edit & Delete Unit Tests', async (t) => {
  const comments = [
    { id: 'c_1', userId: 'user_1', text: 'Original comment text' },
    { id: 'c_2', userId: 'user_2', text: 'Another observation' }
  ];

  await t.test('edits target comment text cleanly without mutating others', () => {
    const updated = editComment(comments, 'c_1', 'Edited comment text');
    assert.equal(updated[0].text, 'Edited comment text');
    assert.equal(updated[1].text, 'Another observation');
  });

  await t.test('deletes target comment cleanly', () => {
    const remaining = deleteComment(comments, 'c_1');
    assert.equal(remaining.length, 1);
    assert.equal(remaining[0].id, 'c_2');
  });
});
