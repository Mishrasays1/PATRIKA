import React, { useState, useEffect } from 'react';
import { User, Shield, CheckCircle2, Award, X, AtSign, Save, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export const ProfileModal = ({ isOpen, onClose }) => {
  const { currentUser, setCurrentUser, showToast } = useApp();

  if (!isOpen || !currentUser) return null;

  const [name, setName] = useState(currentUser.name || '');
  const [username, setUsername] = useState(
    currentUser.username || currentUser.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_')
  );
  const [bio, setBio] = useState(currentUser.bio || 'Verified Citizen Journalist Profile');
  const [existingUsers, setExistingUsers] = useState([]);
  const [saving, setSaving] = useState(false);

  // Fetch registered users to validate username uniqueness live
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await api.getUsers();
        setExistingUsers(users || []);
      } catch (err) {
        console.log('Error fetching users for validation:', err);
      }
    };
    if (isOpen) fetchUsers();
  }, [isOpen]);

  const cleanHandle = username.toLowerCase().trim().replace(/^@/, '');

  // Check if username is taken by another user
  const isUsernameTaken = existingUsers.some(
    u => u._id !== currentUser._id && u.username && u.username.toLowerCase() === cleanHandle
  );

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      showToast('Username cannot be empty.', 'error');
      return;
    }

    if (isUsernameTaken) {
      showToast(`Alert: Username "@${cleanHandle}" is already taken! Please pick a unique username.`, 'error');
      return;
    }

    try {
      setSaving(true);
      const updatedUser = await api.updateProfile(currentUser._id, {
        name,
        username: cleanHandle,
        bio
      });

      setCurrentUser(updatedUser);
      showToast('Profile updated successfully!', 'success');
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-card max-w-lg w-full rounded-3xl overflow-hidden border border-slate-700 shadow-2xl space-y-6 p-6 sm:p-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <img 
              src={currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentUser.email)}`} 
              alt="Avatar" 
              className="w-12 h-12 rounded-full object-cover ring-4 ring-emerald-500/30"
            />
            <div>
              <h2 className="text-lg font-bold text-white font-serif">{currentUser.name}</h2>
              <div className="text-xs text-slate-400 font-mono">@{currentUser.username || 'username'}</div>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-xl text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Settings Form */}
        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          
          {/* 1. Unique Username Field WITH LIVE TAKEN ALERT */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
              <span>Unique Username <span className="text-rose-400">*</span></span>
              <span className="text-[10px] text-slate-500 font-mono">1 unique for 1 person</span>
            </label>
            <div className="relative">
              <AtSign className={`w-4 h-4 absolute left-3 top-3 pointer-events-none ${isUsernameTaken ? 'text-rose-400' : 'text-emerald-400'}`} />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. rahul_verma"
                className={`w-full bg-slate-950 border rounded-xl pl-9 pr-3 py-2.5 text-slate-100 font-mono text-xs focus:outline-none transition ${
                  isUsernameTaken ? 'border-rose-500 bg-rose-950/20 text-rose-200' : 'border-slate-700 focus:border-emerald-500'
                }`}
              />
            </div>

            {/* LIVE USERNAME TAKEN ALERT BANNER */}
            {isUsernameTaken && (
              <div className="mt-2 p-2.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Alert: Username <strong className="font-mono">@{cleanHandle}</strong> is already taken by another person. Please choose a different username.</span>
              </div>
            )}
          </div>

          {/* 2. Full Name */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* 3. Bio */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
            ></textarea>
          </div>

          {/* Save Button */}
          <div className="pt-2 flex justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || isUsernameTaken}
              className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg transition flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
