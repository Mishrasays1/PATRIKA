import React, { useState, useEffect } from 'react';
import { 
  PenSquare, 
  Clock, 
  CheckCircle2, 
  Award, 
  Eye, 
  ThumbsUp, 
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  FileText,
  PlusCircle,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TrustBadge } from '../components/TrustBadge';
import { api } from '../services/api';

export const ReporterHome = () => {
  const { currentUser, setCurrentView, openStoryDetail, showToast } = useApp();

  const [myStories, setMyStories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyStories = async () => {
    try {
      setLoading(true);
      const allStories = await api.getStories();
      if (currentUser) {
        const userStories = allStories.filter(s => s.reporter?._id === currentUser._id || s.reporter === currentUser._id);
        setMyStories(userStories.length > 0 ? userStories : allStories.slice(0, 3));
      } else {
        setMyStories(allStories.slice(0, 3));
      }
    } catch (err) {
      showToast('Error loading reporter dashboard: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyStories();
  }, [currentUser]);

  const publishedCount = myStories.filter(s => s.status === 'approved').length;
  const pendingCount = myStories.filter(s => s.status === 'pending' || s.status === 'in_review').length;
  const editsCount = myStories.filter(s => s.status === 'edits_requested').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Reporter Home Hero */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-wrap items-center justify-between gap-6 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/40 shadow-2xl">
        <div className="flex items-center gap-4">
          {currentUser?.avatar ? (
            <img src={currentUser.avatar} alt="Avatar" className="w-16 h-16 rounded-2xl object-cover ring-4 ring-emerald-500/40 shadow-xl" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-emerald-600/30 text-emerald-400 font-bold text-2xl flex items-center justify-center border border-emerald-500/30">
              {currentUser?.name ? currentUser.name.charAt(0) : 'R'}
            </div>
          )}

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/30">
                CITIZEN REPORTER DASHBOARD
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-white font-serif">{currentUser?.name || 'Citizen Reporter'}</h1>
            </div>
            <p className="text-xs text-slate-300 max-w-xl">{currentUser?.bio || 'Grassroots investigative reporter documenting civic infrastructure & environmental events.'}</p>
            <div className="text-[11px] text-slate-400 flex items-center gap-3 pt-1">
              <span className="flex items-center gap-1 text-emerald-400 font-bold"><Award className="w-3.5 h-3.5" /> {currentUser?.reputationScore || 90} Reputation Score</span>
              <span>•</span>
              <span className="text-slate-400">Google OAuth Session Active</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setCurrentView('submit')}
          className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xl shadow-emerald-950 transition flex items-center gap-2 shrink-0"
        >
          <PlusCircle className="w-4.5 h-4.5" />
          <span>Write & Submit New Story</span>
        </button>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="text-3xl font-extrabold text-white font-mono">{myStories.length}</div>
          <div className="text-xs text-slate-400 mt-1">Total Submissions</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">{publishedCount}</div>
          <div className="text-xs text-slate-400 mt-1">Verified & Published</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="text-3xl font-extrabold text-amber-400 font-mono">{pendingCount}</div>
          <div className="text-xs text-slate-400 mt-1">Awaiting Fact-Check</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="text-3xl font-extrabold text-blue-400 font-mono">{editsCount}</div>
          <div className="text-xs text-slate-400 mt-1">Edits Requested</div>
        </div>
      </div>

      {/* My Submitted Stories Stream */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <span>My Citizen Reporting Stream</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">Live MongoDB Sync</span>
        </div>

        {loading ? (
          <div className="text-center py-8 text-xs text-slate-400">Loading your submissions...</div>
        ) : myStories.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="text-slate-300 font-semibold text-sm">No stories submitted yet</div>
            <button
              onClick={() => setCurrentView('submit')}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
            >
              Write Your First Report
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {myStories.map((story) => (
              <div
                key={story._id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 hover:border-slate-700 transition"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-emerald-400 px-2.5 py-0.5 rounded bg-emerald-950 border border-emerald-800/60">
                      {story.category}
                    </span>
                    <span className="text-slate-400">• {new Date(story.createdAt).toLocaleDateString()}</span>
                  </div>
                  <TrustBadge score={story.trustScore} level={story.trustLevel} size="sm" />
                </div>

                <div className="space-y-1">
                  <h3 
                    onClick={() => openStoryDetail(story._id)}
                    className="font-bold text-white text-base hover:text-emerald-400 cursor-pointer transition"
                  >
                    {story.title}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{story.summary}</p>
                </div>

                {/* Status Timeline */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Verification Status:</span>
                    <span className={`font-bold uppercase ${
                      story.status === 'approved' ? 'text-emerald-400' :
                      story.status === 'edits_requested' ? 'text-amber-400' :
                      story.status === 'rejected' ? 'text-rose-400' : 'text-amber-300'
                    }`}>
                      {story.status.replace('_', ' ')}
                    </span>
                  </div>

                  {story.reviewerNotes && (
                    <div className="text-xs text-slate-300 italic bg-slate-900 p-2.5 rounded-lg border border-slate-800 mt-1">
                      <strong className="text-amber-400 font-sans not-italic">Fact-Checker Audit Note: </strong>
                      {story.reviewerNotes}
                    </div>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-blue-400" /> {story.views || 0} Views</span>
                    <span className="flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5 text-emerald-400" /> {story.upvotes || 0} Upvotes</span>
                  </div>

                  <button
                    onClick={() => openStoryDetail(story._id)}
                    className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>View Published Report</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
