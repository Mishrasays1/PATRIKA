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

  // Refresh backend data asynchronously without blocking UI
  const refreshData = async () => {
    try {
      const fetchedStories = await api.getStories().catch(() => []);
      if (fetchedStories && fetchedStories.length > 0) {
        setStories(fetchedStories);
      }
      const fetchedReports = await api.getReports().catch(() => []);
      if (fetchedReports) setReports(fetchedReports);
    } catch (err) {
      console.error('Data sync:', err);
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
