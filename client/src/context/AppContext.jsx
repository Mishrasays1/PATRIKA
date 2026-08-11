import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentView, setCurrentView] = useState('feed');
  const [selectedStoryId, setSelectedStoryId] = useState(null);
  const [stories, setStories] = useState([]);
  
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
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Sync user profile with MongoDB Atlas when updated
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('patrika_user', JSON.stringify(currentUser));
      setActiveRole(currentUser.role || 'reader');
    } else {
      localStorage.removeItem('patrika_user');
    }
  }, [currentUser]);

  // Sync user document from MongoDB Atlas on initial load
  useEffect(() => {
    const syncUserFromAtlas = async () => {
      if (currentUser?.email) {
        try {
          const allUsers = await api.getUsers();
          const freshUser = allUsers.find(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
          if (freshUser) {
            setCurrentUser(freshUser);
          }
        } catch (err) {
          console.log('Error syncing user from MongoDB Atlas:', err);
        }
      }
    };
    syncUserFromAtlas();
  }, []);

  // Show temporary toast message
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Refresh backend data from MongoDB Atlas
  const refreshData = async () => {
    try {
      setLoading(true);
      const [fetchedStories, fetchedStats, fetchedReports] = await Promise.all([
        api.getStories().catch(() => []),
        api.getStats().catch(() => null),
        api.getReports().catch(() => [])
      ]);

      setStories(fetchedStories);
      setStats(fetchedStats);
      setReports(fetchedReports);
    } catch (err) {
      console.error('Error refreshing platform data from MongoDB Atlas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
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
