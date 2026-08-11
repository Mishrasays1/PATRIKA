import React, { useState } from 'react';
import { 
  MapPin, 
  Clock, 
  MessageSquare, 
  ThumbsUp, 
  AlertCircle, 
  Filter, 
  TrendingUp, 
  Eye, 
  FileText,
  Flame,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TrustBadge } from '../components/TrustBadge';
import { api } from '../services/api';

export const NewsFeed = () => {
  const { 
    stories, 
    openStoryDetail, 
    searchQuery, 
    selectedCity, 
    setSelectedCity,
    selectedCategory,
    setSelectedCategory,
    setCurrentView,
    showToast,
    refreshData
  } = useApp();

  const [trustFilter, setTrustFilter] = useState('All');

  const categories = [
    'All',
    'Civic Infrastructure',
    'Environment',
    'Local Governance',
    'Crime & Safety',
    'Health & Sanitation',
    'Community Events'
  ];

  const cities = ['All', 'Mumbai', 'Bengaluru', 'Delhi', 'Pune', 'Chennai', 'Kolkata'];

  // Filter stories
  const filteredStories = stories.filter(story => {
    // Only published/approved stories in public feed unless user is filtering
    if (story.status !== 'approved' && trustFilter === 'All') return false;

    if (selectedCategory !== 'All' && story.category !== selectedCategory) return false;
    if (selectedCity !== 'All' && story.location?.city?.toLowerCase() !== selectedCity.toLowerCase()) return false;
    
    if (trustFilter === 'High') return story.trustScore >= 85;
    if (trustFilter === 'Medium') return story.trustScore >= 65 && story.trustScore < 85;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = story.title.toLowerCase().includes(q);
      const matchSummary = story.summary?.toLowerCase().includes(q);
      const matchCity = story.location?.city?.toLowerCase().includes(q);
      const matchCategory = story.category?.toLowerCase().includes(q);
      return matchTitle || matchSummary || matchCity || matchCategory;
    }
    return true;
  });

  const urgentStories = stories.filter(s => s.isUrgent && s.status === 'approved');

  const handleUpvote = async (e, id) => {
    e.stopPropagation();
    try {
      await api.upvoteStory(id);
      showToast('Credibility upvote recorded!', 'success');
      refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = (e, story) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Article link copied to clipboard!', 'info');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Urgent Breaking Banner */}
      {urgentStories.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/80 via-amber-950/60 to-slate-900 border border-rose-800/60 shadow-xl flex items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600/30 text-rose-400 border border-rose-500/40 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-rose-600 text-white">
                  URGENT CITIZEN ALERT
                </span>
                <span className="text-xs text-rose-300 font-mono">Verified Local Impact</span>
              </div>
              <div 
                onClick={() => openStoryDetail(urgentStories[0]._id)}
                className="font-bold text-white text-sm sm:text-base hover:underline cursor-pointer mt-0.5 line-clamp-1"
              >
                {urgentStories[0].title}
              </div>
            </div>
          </div>
          <button
            onClick={() => openStoryDetail(urgentStories[0]._id)}
            className="hidden sm:inline-flex px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shrink-0 shadow-md transition"
          >
            Read Verified Report
          </button>
        </div>
      )}

      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden glass-card p-6 sm:p-10 border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/40">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Hyperlocal Fact-Checked Journalism</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-serif tracking-tight leading-tight">
            Grassroots Local Reporting with Uncompromised Verification.
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Submit real-time stories, inspect transparent OSINT evidence trails, and access 100% verified news reported directly by local citizens.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setCurrentView('submit')}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-950 transition flex items-center gap-2"
            >
              <span>Submit a Local Story</span>
            </button>
            <button
              onClick={() => setCurrentView('literacy')}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
            >
              View Verification Standards
            </button>
          </div>
        </div>
      </div>

      {/* Filtering Bar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
            <Filter className="w-4 h-4 text-emerald-400" />
            <span>Filter News Feed</span>
          </div>

          {/* City Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" /> City:
            </span>
            {cities.map(city => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  selectedCity === city
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills & Trust Level Filter */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  selectedCategory === cat
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Trust Badge:</span>
            <select
              value={trustFilter}
              onChange={(e) => setTrustFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
            >
              <option value="All">All Confidence Levels</option>
              <option value="High">High Confidence (85%+)</option>
              <option value="Medium">Medium Confidence (65%+)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* News Feed Stream (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Verified Hyperlocal News Stream</span>
              <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700">
                {filteredStories.length} Articles
              </span>
            </h2>
          </div>

          {filteredStories.length === 0 ? (
            <div className="glass-card p-12 text-center rounded-2xl border border-slate-800 space-y-3">
              <AlertCircle className="w-10 h-10 text-slate-500 mx-auto" />
              <div className="text-slate-300 font-semibold">No stories match your filter criteria</div>
              <p className="text-xs text-slate-500">Try adjusting your city filter or search keyword.</p>
              <button
                onClick={() => { setSelectedCity('All'); setSelectedCategory('All'); setTrustFilter('All'); }}
                className="mt-2 px-4 py-2 rounded-xl bg-slate-800 text-xs text-emerald-400 hover:bg-slate-700 transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredStories.map((story) => (
                <article
                  key={story._id}
                  onClick={() => openStoryDetail(story._id)}
                  className="glass-card rounded-2xl border border-slate-800/90 overflow-hidden hover:border-slate-700 transition duration-200 cursor-pointer group shadow-xl"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Media Thumbnail */}
                    <div className="relative sm:col-span-1 min-h-[180px] bg-slate-950 overflow-hidden">
                      <img
                        src={story.media?.[0]?.url || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600'}
                        alt={story.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute top-2 left-2">
                        <TrustBadge score={story.trustScore} level={story.trustLevel} size="sm" />
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="sm:col-span-2 p-5 flex flex-col justify-between space-y-3">
                      <div>
                        {/* Meta Tags */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-2">
                          <span className="font-semibold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40">
                            {story.category}
                          </span>
                          <span className="flex items-center gap-1 text-slate-300 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-rose-400" />
                            {story.location?.city}, {story.location?.neighborhood}
                          </span>
                          <span className="text-slate-500">•</span>
                          <span className="flex items-center gap-1 text-slate-400">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(story.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Title & Summary */}
                        <h3 className="text-base sm:text-lg font-bold text-white font-serif group-hover:text-emerald-400 transition leading-snug line-clamp-2">
                          {story.title}
                        </h3>
                        <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                          {story.summary}
                        </p>
                      </div>

                      {/* Footer Actions & Reporter Info */}
                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-emerald-700/40 text-emerald-300 flex items-center justify-center font-bold text-[10px]">
                            {story.reporter?.name ? story.reporter.name.charAt(0) : 'C'}
                          </div>
                          <span className="font-medium text-slate-300">{story.reporter?.name || 'Citizen Reporter'}</span>
                        </div>

                        <div className="flex items-center gap-4">
                          <button
                            onClick={(e) => handleUpvote(e, story._id)}
                            className="flex items-center gap-1 hover:text-emerald-400 transition"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>{story.upvotes || 0}</span>
                          </button>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{story.comments?.length || 0}</span>
                          </span>
                          <button
                            onClick={(e) => handleShare(e, story)}
                            className="hover:text-slate-200 transition"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar (Right Col) */}
        <div className="space-y-6">
          {/* Fact-Checking Trust Metrics Card */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-slate-800 pb-3">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Platform Verification Metrics</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="text-2xl font-extrabold text-emerald-400 font-mono">94%</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Verified Content Score</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="text-2xl font-extrabold text-blue-400 font-mono">100%</div>
                <div className="text-[10px] text-slate-400 mt-0.5">OSINT Evidence Checked</div>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Every story published on PATRIKA undergoes mandatory EXIF media inspection, geolocation confirmation, and source cross-checking.
            </p>

            <button
              onClick={() => setCurrentView('literacy')}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 border border-slate-700 transition"
            >
              Read Verification Guidelines
            </button>
          </div>

          {/* Top Local Citizen Reporters */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="font-bold text-white text-sm">Top Citizen Reporters</div>
              <span className="text-[10px] text-emerald-400 font-mono">Reputation Badges</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100" alt="Ananya" className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/30" />
                  <div>
                    <div className="text-xs font-semibold text-slate-200">Ananya Sharma</div>
                    <div className="text-[10px] text-slate-400">Mumbai • Civic Infra</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-800">
                  94 Rep
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" alt="Karan" className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/30" />
                  <div>
                    <div className="text-xs font-semibold text-slate-200">Karan Patel</div>
                    <div className="text-[10px] text-slate-400">Bengaluru • Environment</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-800">
                  88 Rep
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
