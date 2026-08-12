import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { api } from '../services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentView, setCurrentView] = useState('feed');
  const [selectedStoryId, setSelectedStoryId] = useState(null);
  
  // Published stories state initialized from localStorage cache (if present)
  const [stories, setStories] = useState(() => {
    try {
      const saved = localStorage.getItem('patrika_stories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [];
  });

  const isUserInteractingRef = useRef(false);

  // Save stories to localStorage cache whenever updated
  useEffect(() => {
    if (stories && stories.length > 0) {
      try {
        localStorage.setItem('patrika_stories', JSON.stringify(stories));
      } catch (e) {
        console.log('LocalStorage stories cache:', e);
      }
    }
  }, [stories]);

  // Deep Link URL Parameter Handler (?story=STORY_ID or ?id=STORY_ID)
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const storyIdFromUrl = urlParams.get('story') || urlParams.get('id');
      if (storyIdFromUrl) {
        setSelectedStoryId(storyIdFromUrl);
        setCurrentView('story');
      }
    } catch (e) {}
  }, []);
  
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
            if (dbUser) {
              setCurrentUser(prev => ({
                ...prev,
                _id: dbUser._id,
                name: dbUser.name || prev?.name,
                username: dbUser.username || prev?.username,
                bio: dbUser.bio || prev?.bio,
                role: dbUser.role || prev?.role,
                isAdminVerified: dbUser.isAdminVerified || prev?.isAdminVerified
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

  // Refresh backend data safely without clobbering recent local user interactions
  const refreshData = async () => {
    if (isUserInteractingRef.current) return;

    try {
      const fetchedStories = await api.getStories().catch(() => []);
      if (Array.isArray(fetchedStories) && fetchedStories.length > 0) {
        if (!isUserInteractingRef.current) {
          setStories(fetchedStories);
        }
      }
      const fetchedReports = await api.getReports().catch(() => []);
      if (fetchedReports) setReports(fetchedReports);
    } catch (err) {
      console.error('MongoDB Atlas real-time data sync:', err);
    }
  };

  // Background polling interval (every 8 seconds)
  useEffect(() => {
    refreshData();
    const interval = setInterval(() => {
      refreshData();
    }, 8000);
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
      setSelectedCategory,
      isUserInteractingRef
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
