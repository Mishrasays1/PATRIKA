import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentView, setCurrentView] = useState('feed');
  const [selectedStoryId, setSelectedStoryId] = useState(null);
  
  // Persist published stories in state & localStorage
  const [stories, setStories] = useState(() => {
    try {
      const saved = localStorage.getItem('patrika_stories');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
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

  // Show temporary toast message
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Refresh backend data & update live Truth/False counts in real-time
  const refreshData = async () => {
    try {
      const fetchedStories = await api.getStories().catch(() => []);
      if (fetchedStories && fetchedStories.length > 0) {
        setStories(prev => {
          const map = new Map();
          // Update live story upvotes, downvotes, and votes from MongoDB Atlas
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
