import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  AlertOctagon, 
  ShieldCheck, 
  User,
  Send,
  CheckCircle2,
  XCircle,
  Flag,
  Edit3,
  Trash2,
  Check,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ReportModal } from '../components/ReportModal';
import { api } from '../services/api';

export const ArticleDetail = () => {
  const { 
    selectedStoryId, 
    setCurrentView, 
    currentUser, 
    showToast, 
    refreshData 
  } = useApp();

  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Edit comment state
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    if (!selectedStoryId) return;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        const data = await api.getStoryById(selectedStoryId);
        setStory(data);
      } catch (err) {
        showToast('Error loading story details: ' + err.message, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [selectedStoryId]);

  const handleVoteTruth = async () => {
    if (!currentUser) {
      showToast('Please sign in to vote.', 'warning');
      return;
    }
    try {
      const res = await api.voteStory(story._id, currentUser._id, 'truth');
      setStory(prev => ({ ...prev, upvotes: res.upvotes, downvotes: res.downvotes, votes: prev.votes }));
      showToast(res.action || 'Vote recorded!', 'success');
      refreshData();
    } catch (err) {
      showToast('Vote failed: ' + err.message, 'error');
    }
  };

  const handleVoteFalse = async () => {
    if (!currentUser) {
      showToast('Please sign in to vote.', 'warning');
      return;
    }
    try {
      const res = await api.voteStory(story._id, currentUser._id, 'false');
      setStory(prev => ({ ...prev, upvotes: res.upvotes, downvotes: res.downvotes, votes: prev.votes }));
      showToast(res.action || 'Vote recorded!', 'warning');
      refreshData();
    } catch (err) {
      showToast('Vote failed: ' + err.message, 'error');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      setSubmittingComment(true);
      const comments = await api.addComment(story._id, {
        userId: currentUser?._id || '',
        userName: currentUser?.name || 'Anonymous Reader',
        userAvatar: currentUser?.avatar || '',
        text: commentText
      });
      setStory(prev => ({ ...prev, comments }));
      setCommentText('');
      showToast('Comment published!', 'success');
    } catch (err) {
      showToast('Failed to add comment: ' + err.message, 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleSaveEditComment = async (commentId) => {
    if (!editText.trim()) return;
    try {
      const updatedComments = await api.updateComment(story._id, commentId, editText);
      setStory(prev => ({ ...prev, comments: updatedComments }));
      setEditingCommentId(null);
      setEditText('');
      showToast('Comment updated!', 'success');
    } catch (err) {
      showToast('Failed to update comment: ' + err.message, 'error');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      const updatedComments = await api.deleteComment(story._id, commentId);
      setStory(prev => ({ ...prev, comments: updatedComments }));
      showToast('Comment deleted.', 'info');
    } catch (err) {
      showToast('Failed to delete comment: ' + err.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <div className="text-slate-400 text-sm">Fetching story details...</div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="text-slate-300 font-bold text-lg">Story not found</div>
        <button
          onClick={() => setCurrentView('feed')}
          className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-emerald-400"
        >
          Return to News Feed
        </button>
      </div>
    );
  }

  const userVote = story.votes?.find(v => v.userId === currentUser?._id)?.voteType;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Top Nav Back button & Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentView('feed')}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to News Feed</span>
        </button>

        <button
          onClick={() => setShowReportModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs font-semibold text-rose-300 hover:bg-rose-900/40 transition"
        >
          <Flag className="w-4 h-4 text-rose-400" />
          <span>Flag Story</span>
        </button>
      </div>

      {/* Article Header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-emerald-400 px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-800/60 uppercase">
            {story.category}
          </span>
          <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Verified News
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-serif leading-tight">
          {story.title}
        </h1>

        <p className="text-sm sm:text-base text-slate-300 font-serif italic leading-relaxed border-l-2 border-emerald-500 pl-4 py-1">
          {story.summary}
        </p>

        {/* Reporter Meta */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
          <div className="flex items-center gap-3">
            {story.reporter?.avatar ? (
              <img src={story.reporter.avatar} alt="Reporter Avatar" className="w-10 h-10 rounded-xl object-cover ring-2 ring-emerald-500/30" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-bold text-base">
                {story.reporter?.name ? story.reporter.name.charAt(0) : 'C'}
              </div>
            )}
            <div>
              <div className="font-bold text-slate-100 flex items-center gap-1.5">
                <span>{story.reporter?.name || 'Citizen Reporter'}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  @{story.reporter?.username || 'reporter'}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">Citizen Journalist</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>{new Date(story.createdAt).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Main Media Showcase */}
      {story.media && story.media.length > 0 && (
        <div className="space-y-2">
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
            <img
              src={story.media[0].url}
              alt="Story Media"
              className="w-full max-h-[480px] object-cover"
            />
          </div>
          {story.media[0].caption && (
            <div className="text-xs text-slate-400 italic px-2">
              Photo: {story.media[0].caption}
            </div>
          )}
        </div>
      )}

      {/* Main Article Body */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 font-mono">
          Full Citizen Story Report
        </div>
        <div className="prose prose-invert max-w-none text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-line font-sans">
          {story.content}
        </div>
      </div>

      {/* Community Voting & Comment Section */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleVoteTruth}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition border ${
                userVote === 'truth'
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-emerald-900'
                  : 'bg-emerald-950/60 hover:bg-emerald-900/60 border-emerald-800 text-emerald-300'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Truth ({story.upvotes || 0})</span>
            </button>

            <button
              onClick={handleVoteFalse}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition border ${
                userVote === 'false'
                  ? 'bg-rose-600 border-rose-500 text-white shadow-rose-900'
                  : 'bg-rose-950/60 hover:bg-rose-900/60 border-rose-800 text-rose-300'
              }`}
            >
              <XCircle className="w-4 h-4 text-rose-400" />
              <span>False ({story.downvotes || 0})</span>
            </button>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span>{story.comments?.length || 0} Reader Comments</span>
          </div>
        </div>

        {/* Comment Input */}
        <form onSubmit={handleAddComment} className="flex gap-3">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a community observation..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
          />
          <button
            type="submit"
            disabled={submittingComment}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Post Comment</span>
          </button>
        </form>

        {/* Comment List WITH EDIT & DELETE CONTROLS FOR COMMENT AUTHOR */}
        <div className="space-y-3 pt-2">
          {story.comments && story.comments.map((c) => {
            const commentId = c._id || c.id;
            const isCommentAuthor = currentUser && (c.userId === currentUser._id || c.userName === currentUser.name);
            const isEditing = editingCommentId === commentId;

            return (
              <div key={commentId} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-300">
                  <div className="font-bold flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{c.userName}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-500">{new Date(c.createdAt).toLocaleTimeString()}</span>
                    
                    {/* EDIT & DELETE BUTTONS FOR AUTHOR */}
                    {isCommentAuthor && !isEditing && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingCommentId(commentId);
                            setEditText(c.text);
                          }}
                          className="p-1 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded transition"
                          title="Edit Comment"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteComment(commentId)}
                          className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition"
                          title="Delete Comment"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={() => handleSaveEditComment(commentId)}
                      className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition"
                      title="Save Edit"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingCommentId(null)}
                      className="p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <p className="text-slate-300 leading-relaxed">{c.text}</p>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* Report Modal */}
      {showReportModal && (
        <ReportModal
          story={story}
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
};
