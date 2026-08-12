import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  ShieldCheck, 
  XCircle, 
  CheckCircle2, 
  FileText, 
  MapPin, 
  Clock, 
  AlertTriangle,
  UserCheck,
  UserX,
  Users,
  Shield
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export const VerificationDesk = () => {
  const { currentUser, setStories, showToast, refreshData } = useApp();

  const [activeTab, setActiveTab] = useState('stories'); // 'stories' | 'admin_requests'
  const [pendingStories, setPendingStories] = useState([]);
  const [adminRequests, setAdminRequests] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const storiesData = await api.getStories();
      const queue = storiesData.filter(s => s.status === 'pending' || s.status === 'in_review' || s.status === 'edits_requested');
      setPendingStories(queue);
      if (queue.length > 0 && !selectedStory) {
        setSelectedStory(queue[0]);
      }

      const reqsData = await api.getAdminRequests().catch(() => []);
      setAdminRequests(reqsData);
    } catch (err) {
      showToast('Error loading workbench data: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // FAIL-PROOF 0MS INSTANT STORY DECISION HANDLER
  const handleDecision = async (action) => {
    if (!selectedStory) return;

    let targetStatus = 'approved';
    let actionText = 'Approved & Published Live';
    let defaultNotes = 'Story approved by Admin.';

    if (action === 'reject') {
      targetStatus = 'rejected';
      actionText = 'Rejected';
      defaultNotes = 'Story rejected by Admin.';
    } else if (action === 'request_edits') {
      targetStatus = 'edits_requested';
      actionText = 'Edits Requested';
      defaultNotes = 'Please provide additional ground evidence or details.';
    }

    const finalNotes = reviewerNotes.trim() || defaultNotes;
    const storyId = selectedStory._id;

    // 1. Instantly update UI state for 0ms delay!
    const updatedStoryObj = {
      ...selectedStory,
      status: targetStatus,
      reviewerNotes: finalNotes
    };

    setPendingStories(prev => prev.filter(s => s._id !== storyId));
    
    if (targetStatus === 'approved') {
      setStories(prev => [updatedStoryObj, ...prev.filter(s => s._id !== storyId)]);
    } else {
      setStories(prev => prev.map(s => s._id === storyId ? updatedStoryObj : s));
    }

    showToast(`Story ${actionText}!`, action === 'approve' ? 'success' : action === 'request_edits' ? 'warning' : 'info');

    const remaining = pendingStories.filter(s => s._id !== storyId);
    setSelectedStory(remaining.length > 0 ? remaining[0] : null);
    setReviewerNotes('');

    // 2. Sync to MongoDB Atlas API in background
    try {
      setSubmitting(true);
      await api.updateStoryStatus(storyId, targetStatus, finalNotes);
      await refreshData();
    } catch (err) {
      console.log('Background decision error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // MAIN ADMIN DECISION ON PENDING ADMIN ACCESS REQUESTS
  const handleAdminRequestDecision = async (targetUserId, action) => {
    try {
      setSubmitting(true);
      // Remove from candidate list instantly (0ms UI feedback)
      setAdminRequests(prev => prev.filter(r => r._id !== targetUserId));

      const res = await api.decideAdminRequest(targetUserId, action);
      showToast(res.message || (action === 'approve' ? 'Approved as Verified Admin!' : 'Request Rejected.'), action === 'approve' ? 'success' : 'info');
      await refreshData();
      await fetchData();
    } catch (err) {
      showToast('Action failed: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>Admin Management Workbench</span>
          </div>
          <h1 className="text-2xl font-bold text-white font-serif">Platform Moderation & Verification</h1>
          <p className="text-xs text-slate-400">
            Review story submissions and manage candidate Admin access requests.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('stories')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
              activeTab === 'stories' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Story Submissions ({pendingStories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('admin_requests')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
              activeTab === 'admin_requests' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Admin Access Requests ({adminRequests.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: STORY VERIFICATION WORKBENCH */}
      {activeTab === 'stories' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Submissions List */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono px-1">
              Pending Stories
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading pending submissions...</div>
            ) : pendingStories.length === 0 ? (
              <div className="glass-card p-8 text-center rounded-2xl border border-slate-800 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <div className="text-xs font-semibold text-slate-200">No Pending Submissions</div>
                <p className="text-[11px] text-slate-400">All submitted stories have been reviewed!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                {pendingStories.map((story) => {
                  const isSelected = selectedStory?._id === story._id;
                  return (
                    <div
                      key={story._id}
                      onClick={() => setSelectedStory(story)}
                      className={`p-4 rounded-2xl border transition cursor-pointer ${
                        isSelected
                          ? 'bg-slate-800 border-amber-500/60 shadow-lg'
                          : 'glass-card border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span className="font-semibold text-amber-400">{story.category}</span>
                        <span className="font-mono">{new Date(story.createdAt).toLocaleDateString()}</span>
                      </div>

                      <h3 className="font-bold text-white text-xs sm:text-sm line-clamp-2 leading-snug">
                        {story.title}
                      </h3>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800">
                        <span className="flex items-center gap-1 text-emerald-300 font-semibold">
                          <MapPin className="w-3 h-3 text-emerald-400" />
                          {story.location || 'Ground Location'}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-amber-300 font-mono text-[10px] uppercase">
                          {story.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Story Detail & 3 Decision Buttons */}
          <div className="lg:col-span-8 space-y-6">
            {selectedStory ? (
              <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
                
                {/* Submission Header */}
                <div className="border-b border-slate-800 pb-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                      {selectedStory.category}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-amber-950 border border-amber-800 text-amber-300 text-[10px] font-mono font-bold uppercase">
                      Status: {selectedStory.status}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-white font-serif">{selectedStory.title}</h2>

                  <div className="text-xs text-slate-400 flex flex-wrap items-center gap-4">
                    <span>Reporter: <strong className="text-slate-200">{selectedStory.reporter?.name || 'Citizen Reporter'}</strong></span>
                    <span>Location: <strong className="text-emerald-300">{selectedStory.location || 'Ground Location'}</strong></span>
                    <span>Date: <strong className="text-slate-200">{new Date(selectedStory.createdAt).toLocaleString()}</strong></span>
                  </div>
                </div>

                {/* Story Content */}
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed max-h-56 overflow-y-auto font-sans whitespace-pre-line">
                    {selectedStory.content}
                  </div>

                  {/* Attached Media Photo */}
                  {selectedStory.media && selectedStory.media.length > 0 && (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="text-xs font-semibold text-slate-300">Submitted Ground Photo:</div>
                      <img
                        src={selectedStory.media[0].url}
                        alt="Submitted evidence"
                        className="w-full max-h-64 object-cover rounded-xl border border-slate-800"
                      />
                    </div>
                  )}
                </div>

                {/* ADMIN REVIEW & FEEDBACK BOX */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Reviewer Notes / Feedback to Reporter (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={reviewerNotes}
                      onChange={(e) => setReviewerNotes(e.target.value)}
                      placeholder="Enter optional feedback instructions or reason for edit request / rejection..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    ></textarea>
                  </div>

                  {/* 3 CLEAN ACTION BUTTONS: APPROVE, REQUEST EDITS, REJECT */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    
                    {/* 1. APPROVE BUTTON */}
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleDecision('approve')}
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xl shadow-emerald-950 transition flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Publish</span>
                    </button>

                    {/* 2. REQUEST EDITS BUTTON */}
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleDecision('request_edits')}
                      className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-xl shadow-amber-950 transition flex items-center justify-center gap-2"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>Request Edits</span>
                    </button>

                    {/* 3. REJECT BUTTON */}
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleDecision('reject')}
                      className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-xl shadow-rose-950 transition flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Story</span>
                    </button>

                  </div>
                </div>

              </div>
            ) : (
              <div className="glass-card p-12 text-center rounded-3xl border border-slate-800 text-slate-400 text-xs">
                Select a story from the left list to review.
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: PENDING ADMIN ACCESS REQUESTS (MAIN ADMIN APPROVAL FEATURE) */}
      {activeTab === 'admin_requests' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-lg font-bold text-white font-serif">Admin Access Candidates</h2>
              <p className="text-xs text-slate-400">Users requesting Admin Fact-Checker access. Approving grants full platform Admin powers.</p>
            </div>
            <div className="px-3 py-1 rounded-full bg-amber-950 border border-amber-800 text-amber-300 text-xs font-mono font-bold">
              {adminRequests.length} Pending Candidates
            </div>
          </div>

          {adminRequests.length === 0 ? (
            <div className="glass-card p-12 text-center rounded-3xl border border-slate-800 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="font-bold text-white text-sm">No Pending Admin Requests</h3>
              <p className="text-xs text-slate-400">All user admin access requests have been reviewed.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {adminRequests.map((cand) => (
                <div
                  key={cand._id}
                  className="glass-card p-6 rounded-3xl border border-amber-900/60 shadow-xl space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={cand.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${cand.email}`}
                      alt={cand.name}
                      className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 object-cover"
                    />
                    <div>
                      <h3 className="font-bold text-white text-sm font-serif">{cand.name}</h3>
                      <div className="text-xs text-amber-400 font-mono">@{cand.username} • {cand.email}</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                    <div className="font-semibold text-slate-400">Requested Access Reason:</div>
                    <p className="text-slate-200 italic">{cand.adminRequestReason || 'Fact-checking & story moderation access'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleAdminRequestDecision(cand._id, 'approve')}
                      className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-1.5"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Approve as Admin</span>
                    </button>

                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleAdminRequestDecision(cand._id, 'reject')}
                      className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-1.5"
                    >
                      <UserX className="w-4 h-4" />
                      <span>Reject Request</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
