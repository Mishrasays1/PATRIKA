const API_BASE = '/api';

export const api = {
  // Stories
  async getStories(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/stories${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch stories');
    return res.json();
  },

  async getStoryById(id) {
    const res = await fetch(`${API_BASE}/stories/${id}`);
    if (!res.ok) throw new Error('Failed to fetch story details');
    return res.json();
  },

  async createStory(storyData) {
    const res = await fetch(`${API_BASE}/stories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(storyData),
    });
    if (!res.ok) throw new Error('Failed to create story');
    return res.json();
  },

  async updateStoryStatus(storyId, status, reviewerNotes = '') {
    const res = await fetch(`${API_BASE}/stories/${storyId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, reviewerNotes }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update story status');
    return data;
  },

  async decideVerification(payload) {
    const storyId = payload.storyId;
    let status = 'approved';
    if (payload.action === 'reject') status = 'rejected';
    if (payload.action === 'request_edits') status = 'edits_requested';

    return this.updateStoryStatus(storyId, status, payload.notes || '');
  },

  async deleteStory(id) {
    const res = await fetch(`${API_BASE}/stories/${id}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete story');
    return data;
  },

  async voteStory(id, userId, voteType) {
    const res = await fetch(`${API_BASE}/stories/${id}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, voteType }),
    });
    return res.json();
  },

  async upvoteStory(id) {
    const res = await fetch(`${API_BASE}/stories/${id}/upvote`, { method: 'POST' });
    return res.json();
  },

  async downvoteStory(id) {
    const res = await fetch(`${API_BASE}/stories/${id}/downvote`, { method: 'POST' });
    return res.json();
  },

  async addComment(id, commentData) {
    const res = await fetch(`${API_BASE}/stories/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commentData),
    });
    return res.json();
  },

  async updateComment(storyId, commentId, text) {
    const res = await fetch(`${API_BASE}/stories/${storyId}/comments/${commentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    return res.json();
  },

  async deleteComment(storyId, commentId) {
    const res = await fetch(`${API_BASE}/stories/${storyId}/comments/${commentId}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Misinformation Reports
  async submitReport(reportData) {
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit report');
    return data;
  },

  async updateReport(id, reportData) {
    const res = await fetch(`${API_BASE}/reports/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update report');
    return data;
  },

  async deleteReport(id) {
    const res = await fetch(`${API_BASE}/reports/${id}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete report');
    return data;
  },

  async getReports(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/reports${query ? `?${query}` : ''}`);
    return res.json();
  },

  // Users & Auth
  async getUsers() {
    const res = await fetch(`${API_BASE}/auth/users`);
    return res.json();
  },

  async registerUser(userData) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  async loginWithEmail(credentials) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  async registerAdmin(adminData) {
    const res = await fetch(`${API_BASE}/auth/admin/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Admin registration failed');
    return data;
  },

  async loginAdmin(credentials) {
    const res = await fetch(`${API_BASE}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Admin login failed');
    return data;
  },

  async approveAdminCandidate(targetUserId, developerPasskey) {
    const res = await fetch(`${API_BASE}/auth/admin/approve-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUserId, developerPasskey }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Approval failed');
    return data;
  },

  async loginWithGoogle(googlePayload) {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(googlePayload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Google OAuth 2.0 login failed');
    return data;
  },

  async updateProfile(userId, profileData) {
    const res = await fetch(`${API_BASE}/auth/profile/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Profile update failed');
    return data;
  },

  // Stats
  async getStats() {
    const res = await fetch(`${API_BASE}/stats`);
    return res.json();
  }
};
