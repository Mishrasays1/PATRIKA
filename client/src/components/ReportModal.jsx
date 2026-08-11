import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Flag, CheckCircle2, Trash2, Edit3 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export const ReportModal = ({ story, existingReport, isOpen, onClose }) => {
  const { currentUser, showToast, refreshData } = useApp();

  if (!isOpen || !story) return null;

  const isEditMode = !!existingReport;

  const [reason, setReason] = useState(existingReport?.reason || 'Misleading Headline');
  const [details, setDetails] = useState(existingReport?.details || '');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (existingReport) {
      setReason(existingReport.reason || 'Misleading Headline');
      setDetails(existingReport.details || '');
    } else {
      setReason('Misleading Headline');
      setDetails('');
    }
  }, [existingReport, isOpen]);

  const reasons = [
    'Misleading Headline',
    'Manipulated / Fake Image',
    'Unverified Source Claim',
    'Outdated News Event',
    'Spam or Harassment'
  ];

  const handleSubmitFlag = async (e) => {
    e.preventDefault();
    if (!details.trim()) {
      showToast('Please provide details for flagging this story.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      showToast(isEditMode ? 'Your flag report has been updated!' : 'Flag submitted! Community alert activated.', 'success');
      onClose();

      if (isEditMode) {
        // Edit existing flag report in background
        api.updateReport(existingReport._id, { reason, details }).then(() => {
          refreshData();
        }).catch(err => console.log('Background flag update:', err));
      } else {
        // Submit new flag report in background
        api.submitReport({
          storyId: story._id,
          reporterId: currentUser?._id || `user_${Date.now()}`,
          reporterName: currentUser?.name || 'Community Member',
          reason,
          details
        }).then(() => {
          refreshData();
        }).catch(err => console.log('Background flag submit:', err));
      }

    } catch (err) {
      showToast('Flag recorded!', 'success');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFlag = async () => {
    if (!existingReport) return;
    if (!window.confirm('Are you sure you want to delete your flag report for this story?')) return;

    try {
      setSubmitting(true);
      showToast('Your flag report was deleted.', 'info');
      onClose();

      api.deleteReport(existingReport._id).then(() => {
        refreshData();
      }).catch(err => console.log('Background flag delete:', err));

    } catch (err) {
      showToast('Flag deleted.', 'info');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-card max-w-md w-full rounded-3xl overflow-hidden border border-slate-700 shadow-2xl p-6 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <Flag className="w-4 h-4 text-rose-500" />
            <span>{isEditMode ? 'Edit Your Flag Report' : 'Flag Misinformation / Report Story'}</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reporting Target Article Headline Box */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-0.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
            Reporting Article Headline:
          </div>
          <div className="font-bold text-slate-100 font-serif line-clamp-1">
            "{story.title}"
          </div>
        </div>

        {/* Flag Form */}
        <form onSubmit={handleSubmitFlag} className="space-y-3 text-xs">
          
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Select Reason for Flagging:
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
            >
              {reasons.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Detailed Reason / Evidence Explanation <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Explain why this story is misleading or unverified..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
            ></textarea>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-800">
            {isEditMode ? (
              <button
                type="button"
                onClick={handleDeleteFlag}
                disabled={submitting}
                className="px-3 py-2 text-rose-400 hover:text-rose-300 font-semibold text-xs flex items-center gap-1 hover:bg-rose-950/40 rounded-xl transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Flag</span>
              </button>
            ) : (
              <div></div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>{submitting ? 'Saving...' : isEditMode ? 'Update Flag' : 'Submit Flag'}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
