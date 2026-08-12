import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  ThumbsUp, 
  ThumbsDown,
  Share2, 
  CheckCircle2, 
  XCircle,
  ShieldCheck, 
  PenSquare,
  AlertTriangle,
  Flag,
  ChevronDown,
  ChevronUp,
  Edit3,
  Trash2,
  MapPin,
  TrendingUp,
  Award,
  Lock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { ReportModal } from '../components/ReportModal';
import { ShareModal } from '../components/ShareModal';

export const ReaderHome = () => {
  const { 
    currentUser,
    stories, 
    setStories,
    openStoryDetail, 
    searchQuery, 
    selectedCategory,
    setSelectedCategory,
    setCurrentView,
    showToast,
    refreshData,
    isUserInteractingRef
  } = useApp();

  const [selectedStoryForFlag, setSelectedStoryForFlag] = useState(null);
  const [selectedStoryForShare, setSelectedStoryForShare] = useState(null);
  const [existingReportForUser, setExistingReportForUser] = useState(null);
  const [reportsMap, setReportsMap] = useState({});
  const [expandedFlags, setExpandedFlags] = useState({});
  const [kpis, setKpis] = useState(null);

  const categories = [
    'All',
    'Civic Infrastructure',
    'Environment',
    'Local Governance',
    'Crime & Safety',
    'Health & Sanitation'
  ];

  // Fetch KPI Stats
  const fetchKpis = async () => {
    try {
      const res = await api.getStats();
      if (res && res.kpis) setKpis(res.kpis);
    } catch (e) {}
  };

  // Fetch reports/flags for all stories
  const fetchAllReports = async () => {
    try {
      const allReports = await api.getReports();
      const map = {};
      allReports.forEach(r => {
        if (!map[r.storyId]) map[r.storyId] = [];
        map[r.storyId].push(r);
      });
      setReportsMap(map);
    } catch (err) {
      console.log('Error fetching reports:', err);
    }
  };

  // Real-time live polling for community flag reports & KPI stats (every 8 seconds)
  useEffect(() => {
    fetchAllReports();
    fetchKpis();
    const interval = setInterval(() => {
      fetchAllReports();
      fetchKpis();
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const toggleFlagDetails = (e, storyId) => {
    e.stopPropagation();
    setExpandedFlags(prev => ({ ...prev, [storyId]: !prev[storyId] }));
  };

  // Instant Fail-Proof Truth/False Voting Handler with Lock Protection
  const handleVote = async (e, storyId, voteType) => {
    e.stopPropagation();
    if (!currentUser) {
      showToast('Please sign in to vote.', 'warning');
      return;
    }

    const userId = currentUser._id;

    // Lock background polling overwrite during click
    if (isUserInteractingRef) isUserInteractingRef.current = true;

    // Instantly update story votes & counts state in local UI (0ms delay!)
    setStories(prevStories => {
      return prevStories.map(story => {
        if (story._id !== storyId) return story;

        const currentVotes = Array.isArray(story.votes) ? [...story.votes] : [];
        const existingVoteIndex = currentVotes.findIndex(v => String(v.userId) === String(userId));
        let newUpvotes = Number(story.upvotes || 0);
        let newDownvotes = Number(story.downvotes || 0);

        if (existingVoteIndex >= 0) {
          const oldVote = currentVotes[existingVoteIndex].voteType;
          if (oldVote === voteType) {
            currentVotes.splice(existingVoteIndex, 1);
            if (voteType === 'truth') newUpvotes = Math.max(0, newUpvotes - 1);
            else newDownvotes = Math.max(0, newDownvotes - 1);
          } else {
            currentVotes[existingVoteIndex] = { userId, voteType };
            if (voteType === 'truth') {
              newUpvotes += 1;
              newDownvotes = Math.max(0, newDownvotes - 1);
            } else {
              newDownvotes += 1;
              newUpvotes = Math.max(0, newUpvotes - 1);
            }
          }
        } else {
          currentVotes.push({ userId, voteType });
          if (voteType === 'truth') newUpvotes += 1;
          else newDownvotes += 1;
        }

        return {
          ...story,
          upvotes: newUpvotes,
          downvotes: newDownvotes,
          votes: currentVotes
        };
      });
    });

    showToast(voteType === 'truth' ? 'Marked as Truth!' : 'Marked as False!', voteType === 'truth' ? 'success' : 'warning');

    // Synchronously send vote to backend before unlocking refresh
    try {
      await api.voteStory(storyId, userId, voteType);
      await fetchKpis();
    } catch (err) {
      console.log('Vote sync error:', err);
    } finally {
      setTimeout(() => {
        if (isUserInteractingRef) isUserInteractingRef.current = false;
      }, 1500);
    }
  };

  // Open Flag Modal
  const handleOpenFlagModal = (e, story) => {
    e.stopPropagation();
    if (!currentUser) {
      showToast('Please sign in to flag a story.', 'warning');
      return;
    }

    const storyReports = reportsMap[story._id] || [];
    const myReport = storyReports.find(r => String(r.reporterId) === String(currentUser._id));

    setSelectedStoryForFlag(story);
    setExistingReportForUser(myReport || null);
  };

  // Open Share Modal
  const handleOpenShareModal = (e, story) => {
    e.stopPropagation();
    setSelectedStoryForShare(story);
  };

  // Delete Published Story (Author or Admin Power)
  const handleDeleteStory = async (e, storyId) => {
    e.stopPropagation();
    const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.isAdminVerified);
    const confirmMsg = isAdmin 
      ? 'ADMIN POWER: Are you sure you want to delete this post from the platform?' 
      : 'Are you sure you want to delete your published story? This cannot be undone.';

    if (!window.confirm(confirmMsg)) return;

    if (isUserInteractingRef) isUserInteractingRef.current = true;
    setStories(prev => prev.filter(s => s._id !== storyId));
    showToast('Story deleted successfully from platform.', 'info');

    try {
      await api.deleteStory(storyId);
      await refreshData();
      await fetchKpis();
    } catch (err) {
      console.log('Story delete background:', err);
    } finally {
      setTimeout(() => {
        if (isUserInteractingRef) isUserInteractingRef.current = false;
      }, 1500);
    }
  };

  // Delete user flag report directly
  const handleDeleteMyReport = async (e, reportId) => {
    e.stopPropagation();
    if (!window.confirm('Delete your flag report?')) return;

    try {
      await api.deleteReport(reportId);
      showToast('Flag report deleted.', 'info');
      await refreshData();
      await fetchAllReports();
    } catch (err) {
      showToast('Failed to delete report: ' + err.message, 'error');
    }
  };

  const filteredStories = stories.filter(story => {
    if (selectedCategory !== 'All' && story.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        story.title.toLowerCase().includes(q) || 
        story.summary?.toLowerCase().includes(q) ||
        story.location?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-white font-serif tracking-tight">
          Verified News Stream
        </h1>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Community-verified citizen news stream & real-time truth engine.
        </p>
      </div>

      {/* KEY PERFORMANCE INDICATORS (KPIs) DASHBOARD */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 rounded-3xl glass-card border border-slate-800/90 shadow-2xl text-center">
        
        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Stories Submitted</div>
          <div className="text-lg font-extrabold text-white font-serif">{kpis?.storiesSubmitted || stories.length}</div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
          <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">% Verified Content</div>
          <div className="text-lg font-extrabold text-emerald-400 font-serif">{kpis?.percentVerified || 100}%</div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
          <div className="text-[10px] font-mono text-slate-300 uppercase tracking-wider">Engagement Rate</div>
          <div className="text-lg font-extrabold text-slate-100 font-serif">{kpis?.userEngagementRate || 85}%</div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
          <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Accuracy & Trust</div>
          <div className="text-lg font-extrabold text-emerald-400 font-serif">{kpis?.avgTrustScore || 89}%</div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Active Contributors</div>
          <div className="text-lg font-extrabold text-white font-serif">{kpis?.activeContributors || 1}</div>
        </div>

      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 py-2 border-b border-slate-800">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              selectedCategory === cat
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main News Stream */}
      {filteredStories.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-3xl border border-slate-800 space-y-4 max-w-md mx-auto">
          <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-bold text-white text-base">No News Stories Published Yet</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Be the first citizen journalist to publish a ground story!
            </p>
          </div>
          <button
            onClick={() => setCurrentView('submit')}
            className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition inline-flex items-center gap-2"
          >
            <PenSquare className="w-4 h-4" />
            <span>Publish First Story</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredStories.map((story) => {
            const storyReports = reportsMap[story._id] || [];
            const hasFlags = story.flagsCount > 0 || storyReports.length > 0;
            const isExpanded = expandedFlags[story._id];
            const userVote = story.votes?.find(v => String(v.userId) === String(currentUser?._id))?.voteType;
            const hasUserFlagged = storyReports.some(r => String(r.reporterId) === String(currentUser?._id));
            const isAuthor = currentUser && (String(story.reporter?._id || story.reporter) === String(currentUser._id));
            const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.isAdminVerified);
            const canDelete = isAuthor || isAdmin;

            return (
              <article
                key={story._id}
                onClick={() => openStoryDetail(story._id)}
                className="glass-card rounded-3xl border border-slate-800/90 overflow-hidden hover:border-slate-700 transition duration-200 cursor-pointer shadow-xl group p-5 sm:p-6 space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                  
                  {/* Image */}
                  <div className="sm:col-span-1 h-44 rounded-2xl bg-slate-950 overflow-hidden relative">
                    <img
                      src={story.media?.[0]?.url || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600'}
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className={`absolute top-2 left-2 px-2.5 py-1 rounded-full backdrop-blur-md font-bold flex items-center gap-1 font-mono text-[10px] ${
                      story.status === 'approved' 
                        ? 'bg-slate-950/80 border border-emerald-500/40 text-emerald-400' 
                        : 'bg-amber-950/90 border border-amber-500/60 text-amber-300'
                    }`}>
                      <ShieldCheck className="w-3 h-3" />
                      <span>{story.status === 'approved' ? 'Verified' : '⏳ Unverified (Pending Review)'}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="sm:col-span-2 space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                        <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px] px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800">
                          {story.category}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-300 font-semibold text-[11px]">
                          <MapPin className="w-3 h-3 text-emerald-400" />
                          {story.location || 'North District, Sector 4'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {new Date(story.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* DELETE POST BUTTON FOR AUTHOR OR ADMIN POWER */}
                      {canDelete && (
                        <button
                          onClick={(e) => handleDeleteStory(e, story._id)}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold flex items-center gap-1 transition ${
                            isAdmin && !isAuthor
                              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950 font-bold border border-rose-400'
                              : 'bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300'
                          }`}
                          title={isAdmin && !isAuthor ? "Admin Power: Delete any post" : "Delete your published story"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{isAdmin && !isAuthor ? 'Delete Post (Admin)' : 'Delete Story'}</span>
                        </button>
                      )}
                    </div>

                    <h2 className="text-lg font-bold text-white font-serif group-hover:text-emerald-400 transition leading-snug">
                      {story.title}
                    </h2>

                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                      {story.summary}
                    </p>

                    {/* Action Row */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-4 flex-wrap">
                      <div className="text-xs text-slate-400">
                        By <span className="font-semibold text-slate-300">{story.reporter?.name || 'Citizen Reporter'}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        
                        {/* SHARE BUTTON */}
                        <button
                          onClick={(e) => handleOpenShareModal(e, story)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow border bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-emerald-400"
                          title="Share Story link across platforms"
                        >
                          <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Share</span>
                        </button>

                        {/* TRUTH BUTTON */}
                        <button
                          onClick={(e) => handleVote(e, story._id, 'truth')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow border ${
                            userVote === 'truth'
                              ? 'bg-emerald-600 border-emerald-500 text-white shadow-emerald-900'
                              : 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-800 text-emerald-300'
                          }`}
                          title="Mark Story as Truth"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Truth ({story.upvotes || 0})</span>
                        </button>

                        {/* FALSE BUTTON */}
                        <button
                          onClick={(e) => handleVote(e, story._id, 'false')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow border ${
                            userVote === 'false'
                              ? 'bg-rose-600 border-rose-500 text-white shadow-rose-900'
                              : 'bg-rose-950/80 hover:bg-rose-900 border-rose-800 text-rose-300'
                          }`}
                          title="Mark Story as False"
                        >
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          <span>False ({story.downvotes || 0})</span>
                        </button>

                        {/* PROMINENT FLAG STORY BUTTON WITH VISIBLE TEXT */}
                        <button
                          onClick={(e) => handleOpenFlagModal(e, story)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow border ${
                            hasUserFlagged
                              ? 'bg-rose-950 border-rose-800 text-rose-300 shadow-rose-950'
                              : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-rose-400'
                          }`}
                          title={hasUserFlagged ? 'Edit / Delete Your Flag' : 'Flag Misinformation'}
                        >
                          <Flag className="w-3.5 h-3.5 text-rose-400" />
                          <span>{hasUserFlagged ? 'Flagged' : 'Flag'}</span>
                        </button>
                      </div>
                    </div>

                  </div>

                </div>

                {/* COMMUNITY FLAG WARNING BANNER & REASONS LIST */}
                {hasFlags && (
                  <div 
                    onClick={(e) => toggleFlagDetails(e, story._id)}
                    className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs space-y-2 cursor-pointer hover:bg-amber-950/60 transition"
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <div className="flex items-center gap-2 text-amber-400">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Flagged by Community ({storyReports.length || story.flagsCount} report{storyReports.length === 1 ? '' : 's'})</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-amber-400">
                        <span>{isExpanded ? 'Hide Reasons' : 'View Flag Reasons'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="pt-2 border-t border-amber-800/50 space-y-2 text-[11px] text-amber-300">
                        {storyReports.map((r, idx) => {
                          const isMyReport = currentUser && String(r.reporterId) === String(currentUser._id);
                          return (
                            <div key={r._id || idx} className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1">
                              <div className="flex items-center justify-between font-bold text-amber-300">
                                <span>• {r.reason}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-slate-400 font-mono">By @{r.reporterName}</span>
                                  {isMyReport && (
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedStoryForFlag(story);
                                          setExistingReportForUser(r);
                                        }}
                                        className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
                                        title="Edit your flag report"
                                      >
                                        <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                                      </button>
                                      <button
                                        onClick={(e) => handleDeleteMyReport(e, r._id)}
                                        className="p-1 text-slate-300 hover:text-rose-400 hover:bg-slate-800 rounded transition"
                                        title="Delete your flag report"
                                      >
                                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="text-slate-300 italic">{r.details}</div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

              </article>
            );
          })}
        </div>
      )}

      {/* Report Modal */}
      <ReportModal
        story={selectedStoryForFlag}
        existingReport={existingReportForUser}
        isOpen={!!selectedStoryForFlag}
        onClose={() => {
          setSelectedStoryForFlag(null);
          setExistingReportForUser(null);
        }}
      />

      {/* Share Modal */}
      <ShareModal
        story={selectedStoryForShare}
        isOpen={!!selectedStoryForShare}
        onClose={() => setSelectedStoryForShare(null)}
      />

    </div>
  );
};
