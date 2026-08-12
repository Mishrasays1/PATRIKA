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
  Send,
  MessageSquare
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export const VerificationDesk = () => {
  const { currentUser, setStories, showToast, refreshData } = useApp();

  const [pendingStories, setPendingStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const data = await api.getStories();
      // Show pending or under review stories
      const queue = data.filter(s => s.status === 'pending' || s.status === 'in_review' || s.status === 'edits_requested');
      setPendingStories(queue);
      if (queue.length > 0 && !selectedStory) {
        setSelectedStory(queue[0]);
      }
    } catch (err) {
      showToast('Error loading review queue: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  // FAIL-PROOF 0MS INSTANT DECISION HANDLER (APPROVE / REQUEST EDITS / REJECT)
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <CheckSquare className="w-4 h-4" />
            <span>Admin Review Desk</span>
          </div>
          <h1 className="text-2xl font-bold text-white font-serif">Story Submissions Portal</h1>
          <p className="text-xs text-slate-400">
            Review ground stories submitted by citizen journalists. Approve, request edits, or reject.
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-amber-950/60 border border-amber-800 text-amber-300 text-xs font-mono font-bold">
          {pendingStories.length} Pending Submissions
        </div>
      </div>

      {/* Main Review Workbench */}
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

    </div>
  );
};
