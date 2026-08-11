import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Search, 
  ShieldCheck, 
  AlertTriangle, 
  XCircle, 
  CheckCircle2, 
  FileText, 
  MapPin, 
  Clock, 
  Cpu, 
  ExternalLink,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ImageMetaModal } from '../components/ImageMetaModal';
import { TrustBadge } from '../components/TrustBadge';
import { api } from '../services/api';

export const VerificationDesk = () => {
  const { currentUser, showToast, refreshData } = useApp();

  const [pendingStories, setPendingStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [loading, setLoading] = useState(true);

  // Moderation state
  const [trustScore, setTrustScore] = useState(90);
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [checks, setChecks] = useState({
    mediaAuthenticity: true,
    sourceCrossCheck: true,
    locationVerified: true,
    metadataIntegrity: true
  });
  const [submitting, setSubmitting] = useState(false);
  const [showMetaModal, setShowMetaModal] = useState(false);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const data = await api.getStories();
      // Show pending or edits requested or under review
      const queue = data.filter(s => s.status === 'pending' || s.status === 'in_review' || s.status === 'edits_requested');
      setPendingStories(queue);
      if (queue.length > 0 && !selectedStory) {
        setSelectedStory(queue[0]);
      }
    } catch (err) {
      showToast('Error loading verification queue: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleDecision = async (action) => {
    if (!selectedStory) return;
    try {
      setSubmitting(true);
      await api.decideVerification({
        storyId: selectedStory._id,
        moderatorId: currentUser?._id,
        moderatorName: currentUser?.name || 'Fact-Checker Moderator',
        action,
        trustScoreAssigned: trustScore,
        checksCompleted: checks,
        notes: reviewerNotes || (action === 'approve' ? 'Passed standard OSINT media and geolocation verification.' : 'Action recorded by fact-checker.')
      });

      const actionText = action === 'approve' ? 'Approved & Published' : action === 'request_edits' ? 'Edits Requested' : 'Rejected';
      showToast(`Story successfully ${actionText}! Saved to MongoDB audit log.`, 'success');

      setReviewerNotes('');
      await refreshData();
      await fetchQueue();

      // Reset selected story
      const remaining = pendingStories.filter(s => s._id !== selectedStory._id);
      setSelectedStory(remaining.length > 0 ? remaining[0] : null);
    } catch (err) {
      showToast('Error executing verification decision: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <CheckSquare className="w-4 h-4" />
            <span>Fact-Checker & Moderator Workbench</span>
          </div>
          <h1 className="text-2xl font-bold text-white font-serif">Story Verification Queue</h1>
          <p className="text-xs text-slate-300">
            Inspect ground evidence, run EXIF forensics, cross-reference municipal records, and issue trust badges.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-amber-950/60 border border-amber-800 text-amber-300 text-xs font-mono font-bold">
            {pendingStories.length} Submissions Awaiting Review
          </div>
        </div>
      </div>

      {/* Main Workbench Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Queue List */}
        <div className="space-y-3 lg:col-span-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono px-1">
            Pending Review Submissions
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading queue...</div>
          ) : pendingStories.length === 0 ? (
            <div className="glass-card p-8 text-center rounded-2xl border border-slate-800 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <div className="text-xs font-semibold text-slate-200">Verification Queue Clear</div>
              <p className="text-[11px] text-slate-400">All citizen submissions have been fact-checked!</p>
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
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                      <span className="font-semibold text-amber-400">{story.category}</span>
                      <span className="font-mono">{new Date(story.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="font-bold text-white text-xs sm:text-sm line-clamp-2 leading-snug">
                      {story.title}
                    </h3>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-rose-400" />
                        {story.location?.city}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 font-mono text-[10px]">
                        {story.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Workbench Detail Panel */}
        <div className="lg:col-span-2 space-y-6">
          {selectedStory ? (
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
              
              {/* Submission Header */}
              <div className="border-b border-slate-800 pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                    {selectedStory.category}
                  </span>
                  <TrustBadge score={selectedStory.trustScore} level={selectedStory.trustLevel} size="sm" />
                </div>
                <h2 className="text-xl font-bold text-white font-serif">{selectedStory.title}</h2>
                <div className="text-xs text-slate-400 flex flex-wrap items-center gap-4">
                  <span>Reporter: <strong className="text-slate-200">{selectedStory.reporter?.name || 'Citizen'}</strong></span>
                  <span>Location: <strong className="text-slate-200">{selectedStory.location?.neighborhood}, {selectedStory.location?.city}</strong></span>
                </div>
              </div>

              {/* Story Content & Attached Media */}
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed max-h-48 overflow-y-auto font-sans whitespace-pre-line">
                  {selectedStory.content}
                </div>

                {/* Media Preview & OSINT Tool */}
                {selectedStory.media && selectedStory.media.length > 0 && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                      <span>Submitted Ground Photograph</span>
                      <button
                        onClick={() => setShowMetaModal(true)}
                        className="px-3 py-1 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-medium flex items-center gap-1.5 hover:bg-emerald-900 transition"
                      >
                        <Cpu className="w-3.5 h-3.5" />
                        <span>Run OSINT EXIF Scanner</span>
                      </button>
                    </div>
                    <img
                      src={selectedStory.media[0].url}
                      alt="Media evidence"
                      className="w-full max-h-56 object-cover rounded-xl border border-slate-800"
                    />
                  </div>
                )}

                {/* Evidence Attachments */}
                {selectedStory.evidenceAttachments && selectedStory.evidenceAttachments.length > 0 && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                    <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-400" />
                      <span>Attached Primary Documents / Evidence Proof</span>
                    </div>
                    {selectedStory.evidenceAttachments.map((att, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-200">{att.title}</div>
                          <div className="text-[11px] text-slate-400">{att.description}</div>
                        </div>
                        <a
                          href={att.url || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded bg-slate-800 text-emerald-400 text-[11px] font-medium flex items-center gap-1"
                        >
                          <span>View Attachment</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* FACT-CHECKER VERIFICATION CONTROLS */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-5">
                <div className="font-bold text-white text-sm flex items-center gap-2 border-b border-slate-800 pb-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Fact-Checker Verification Workbench</span>
                </div>

                {/* Checklist Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checks.mediaAuthenticity}
                      onChange={(e) => setChecks({ ...checks, mediaAuthenticity: e.target.checked })}
                      className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-500"
                    />
                    <span className="text-slate-200 font-medium">EXIF & Media Integrity Checked</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checks.sourceCrossCheck}
                      onChange={(e) => setChecks({ ...checks, sourceCrossCheck: e.target.checked })}
                      className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-500"
                    />
                    <span className="text-slate-200 font-medium">Source Cross-Referenced</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checks.locationVerified}
                      onChange={(e) => setChecks({ ...checks, locationVerified: e.target.checked })}
                      className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-500"
                    />
                    <span className="text-slate-200 font-medium">Geolocation Coordinates Match</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checks.metadataIntegrity}
                      onChange={(e) => setChecks({ ...checks, metadataIntegrity: e.target.checked })}
                      className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-500"
                    />
                    <span className="text-slate-200 font-medium">Public Records / RTI Verified</span>
                  </label>
                </div>

                {/* Trust Score Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                    <span>Assign Verification Confidence Score:</span>
                    <span className="font-mono text-emerald-400 font-extrabold text-sm">{trustScore}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    value={trustScore}
                    onChange={(e) => setTrustScore(Number(e.target.value))}
                    className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>30% (Low)</span>
                    <span>65% (Medium Confidence)</span>
                    <span>100% (High Confidence)</span>
                  </div>
                </div>

                {/* Reviewer Editorial Notes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Editorial Verification Audit Notes
                  </label>
                  <textarea
                    rows={2}
                    value={reviewerNotes}
                    onChange={(e) => setReviewerNotes(e.target.value)}
                    placeholder="Enter audit notes on OSINT checks, municipal bulletin cross-references, or edit request instructions..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  ></textarea>
                </div>

                {/* Decision Actions */}
                <div className="pt-2 flex flex-wrap items-center justify-end gap-3">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleDecision('reject')}
                    className="px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800 text-rose-300 font-semibold text-xs transition flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject / Flag Misleading</span>
                  </button>

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleDecision('request_edits')}
                    className="px-4 py-2 rounded-xl bg-amber-950/60 hover:bg-amber-900/60 border border-amber-800 text-amber-300 font-semibold text-xs transition flex items-center gap-1.5"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Request Edits</span>
                  </button>

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleDecision('approve')}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950 transition flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{submitting ? 'Updating MongoDB...' : 'Approve & Publish Story'}</span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="glass-card p-12 text-center rounded-3xl border border-slate-800 text-slate-400 text-xs">
              Select a story from the left queue to begin verification.
            </div>
          )}
        </div>
      </div>

      {/* OSINT Inspection Modal */}
      {showMetaModal && selectedStory && (
        <ImageMetaModal
          media={selectedStory.media?.[0]}
          location={selectedStory.location}
          onClose={() => setShowMetaModal(false)}
        />
      )}
    </div>
  );
};
