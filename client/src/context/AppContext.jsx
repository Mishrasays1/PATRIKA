import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AppContext = createContext();

// High Quality Initial Seed Stories for Instant 0ms Load on New Accounts
const DEFAULT_SEED_STORIES = [
  {
    _id: 'story_seed_1',
    title: 'Severe Water Contamination Reported in North District Sector 4',
    summary: 'Local residents report discolored tap water smelling of chemicals. Municipal testing underway after community reports.',
    content: 'Multiple households across Sector 4 reported heavy sedimentation and chemical odor in municipal tap water starting Monday morning. Independent water test kits showed elevated TDS levels exceeding 450 ppm. Ground authorities have dispatched emergency water tankers.',
    category: 'Health & Sanitation',
    media: [{ url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600', type: 'image' }],
    upvotes: 14,
    downvotes: 1,
    votes: [],
    flagsCount: 0,
    reporter: { name: 'Vikram Sharma', username: 'vikram_sharma' },
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    _id: 'story_seed_2',
    title: 'Unannounced Road Construction Blocking Emergency Ambulance Route',
    summary: 'Civic contractors started heavy excavation without warning signage near City General Hospital gate.',
    content: 'Civic excavation near the main emergency gate of City General Hospital caused a 40-minute gridlock for inbound ambulances today. Local traffic police were unnotified prior to road closure. Citizen journalists captured ground evidence.',
    category: 'Civic Infrastructure',
    media: [{ url: 'https://images.unsplash.com/photo-1517649763962-0c623266010b?w=600', type: 'image' }],
    upvotes: 28,
    downvotes: 0,
    votes: [],
    flagsCount: 0,
    reporter: { name: 'Priya Verma', username: 'priya_v' },
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  }
];

export const AppProvider = ({ children }) => {
  const [currentView, setCurrentView] = useState('feed');
  const [selectedStoryId, setSelectedStoryId] = useState(null);
  
  // Persist published stories in state & localStorage (Instant 0ms initial load)
  const [stories, setStories] = useState(() => {
    try {
      const saved = localStorage.getItem('patrika_stories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_SEED_STORIES;
  });

  // Save stories to localStorage whenever updated
  useEffect(() => {
    if (stories && stories.length > 0) {
      try {
        localStorage.setItem('patrika_stories', JSON.stringify(stories));
      } catch (e) {
        console.log('LocalStorage stories save:', e);
      }
    }
  }, [stories]);
  
  // Persist logged-in user profile in state & localStorage
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('patrika_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [activeRole, setActiveRole] = useState(currentUser?.role || 'reader');
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Sync user profile with localStorage when updated
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('patrika_user', JSON.stringify(currentUser));
      setActiveRole(currentUser.role || 'reader');
    } else {
      localStorage.removeItem('patrika_user');
    }
  }, [currentUser]);

  // Fetch actual saved username & profile from MongoDB Atlas on boot or login
  useEffect(() => {
    const fetchAtlasProfile = async () => {
      if (currentUser && currentUser.email) {
        try {
          const allUsers = await api.getUsers();
          if (Array.isArray(allUsers)) {
            const dbUser = allUsers.find(u => u && u.email && u.email.toLowerCase() === currentUser.email.toLowerCase());
            if (dbUser && dbUser.username && dbUser.username !== currentUser.username) {
              setCurrentUser(prev => ({
                ...prev,
                _id: dbUser._id,
                name: dbUser.name || prev.name,
                username: dbUser.username,
                bio: dbUser.bio || prev.bio
              }));
            }
          }
        } catch (err) {
          console.log('Atlas profile sync background:', err);
        }
      }
    };
    fetchAtlasProfile();
  }, [currentUser?.email]);

  // Show temporary toast message
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Refresh backend data & update live stories instantly
  const refreshData = async () => {
    try {
      const fetchedStories = await api.getStories().catch(() => []);
      if (fetchedStories && fetchedStories.length > 0) {
        setStories(prev => {
          const map = new Map();
          // Primary: MongoDB Atlas Stories
          fetchedStories.forEach(s => map.set(s._id || s.id, s));
          // Preserve local pending stories
          prev.forEach(s => {
            if (!map.has(s._id || s.id)) map.set(s._id || s.id, s);
          });
          return Array.from(map.values());
        });
      }
      const fetchedReports = await api.getReports().catch(() => []);
      if (fetchedReports) setReports(fetchedReports);
    } catch (err) {
      console.error('Real-time data sync:', err);
    }
  };

  // Real-time live polling interval (every 3 seconds) for all connected users
  useEffect(() => {
    refreshData();
    const interval = setInterval(() => {
      refreshData();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Open story detail view
  const openStoryDetail = (id) => {
    setSelectedStoryId(id);
    setCurrentView('story');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AppContext.Provider value={{
      currentView,
      setCurrentView,
      selectedStoryId,
      setSelectedStoryId,
      stories,
      setStories,
      currentUser,
      setCurrentUser,
      activeRole,
      setActiveRole,
      stats,
      reports,
      loading,
      toast,
      showToast,
      refreshData,
      openStoryDetail,
      searchQuery,
      setSearchQuery,
      selectedCategory,
      setSelectedCategory
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
