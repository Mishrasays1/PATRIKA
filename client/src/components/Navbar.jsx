import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Newspaper, 
  PenSquare, 
  LogOut, 
  Search,
  Settings,
  Menu,
  X,
  LayoutDashboard,
  CheckSquare,
  Lock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProfileModal } from './ProfileModal';

export const Navbar = () => {
  const { 
    currentUser, 
    setCurrentUser, 
    currentView, 
    setCurrentView, 
    searchQuery, 
    setSearchQuery,
    showToast 
  } = useApp();

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = currentUser?.role === 'admin' || currentUser?.isAdminVerified;

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('feed');
    showToast('Signed out successfully.', 'info');
  };

  const navTo = (view) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
  };

  if (!currentUser) return null;

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div 
            onClick={() => navTo('feed')}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-950 group-hover:scale-105 transition">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-lg font-extrabold text-white font-serif tracking-tight">PATRIKA</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase tracking-wider text-emerald-400 font-mono">Verified News</span>
            </div>
          </div>

          {/* Search Bar (Desktop / Tablet) */}
          <div className="relative max-w-xs w-full hidden md:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search news..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 placeholder:text-slate-500"
            />
          </div>

          {/* CITIZEN REPORTER & ADMIN NAVIGATION FLOW TABS */}
          <nav className="hidden lg:flex items-center gap-1.5">
            
            <button
              onClick={() => navTo('feed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                currentView === 'feed' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>News Feed</span>
            </button>

            <button
              onClick={() => navTo('submit')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                currentView === 'submit' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <PenSquare className="w-3.5 h-3.5" />
              <span>Publish Story</span>
            </button>

            {/* Reporter Flow: Status Tracker */}
            <button
              onClick={() => navTo('dashboard')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                currentView === 'dashboard' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" />
              <span>My Tracker</span>
            </button>

            {/* Admin Verification Desk (If Verified Admin) */}
            {isAdmin ? (
              <button
                onClick={() => navTo('verification')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                  currentView === 'verification' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Workbench</span>
              </button>
            ) : (
              /* Dedicated Admin Login Link for regular users after OAuth login */
              <button
                onClick={() => navTo('admin_login')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                  currentView === 'admin_login' ? 'bg-amber-600 text-white shadow-md' : 'bg-amber-950/40 border border-amber-800/60 text-amber-300 hover:bg-amber-900/60'
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Login</span>
              </button>
            )}

          </nav>

          {/* USER PROFILE & MOBILE TOGGLE */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs transition max-w-[170px] sm:max-w-none"
            >
              <img 
                src={currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentUser.email)}`} 
                alt="Avatar" 
                className="w-6 h-6 rounded-full object-cover ring-2 ring-emerald-500/40 shrink-0" 
              />
              <div className="text-left truncate">
                <div className="font-bold text-white leading-none text-xs truncate">{currentUser.name}</div>
                <div className="text-[10px] text-emerald-400 font-mono truncate">@{currentUser.username || 'username'}</div>
              </div>
              <Settings className="w-3.5 h-3.5 text-slate-400 hidden sm:block ml-0.5 shrink-0" />
            </button>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="hidden sm:flex p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-300 hover:bg-slate-900 transition"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* MOBILE MENU DROPDOWN */}
        {mobileMenuOpen && (
          <div className="lg:hidden pt-3 pb-2 border-t border-slate-800 mt-3 space-y-2 animate-in slide-in-from-top-2 duration-150">
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => navTo('feed')}
                className={`p-2.5 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition ${
                  currentView === 'feed' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-300'
                }`}
              >
                <Newspaper className="w-4 h-4" />
                <span>News Feed</span>
              </button>

              <button
                onClick={() => navTo('submit')}
                className={`p-2.5 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition ${
                  currentView === 'submit' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-300'
                }`}
              >
                <PenSquare className="w-4 h-4" />
                <span>Publish Story</span>
              </button>

              <button
                onClick={() => navTo('dashboard')}
                className={`p-2.5 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition ${
                  currentView === 'dashboard' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-300'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                <span>My Tracker</span>
              </button>

              {isAdmin ? (
                <button
                  onClick={() => navTo('verification')}
                  className={`p-2.5 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition ${
                    currentView === 'verification' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-300'
                  }`}
                >
                  <CheckSquare className="w-4 h-4 text-amber-400" />
                  <span>Admin Review</span>
                </button>
              ) : (
                <button
                  onClick={() => navTo('admin_login')}
                  className={`p-2.5 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition ${
                    currentView === 'admin_login' ? 'bg-amber-600 text-white' : 'bg-amber-950/60 border border-amber-800 text-amber-300'
                  }`}
                >
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Admin Login</span>
                </button>
              )}
            </div>

            <div className="pt-2 flex justify-between items-center text-xs text-slate-400 border-t border-slate-900">
              <button
                onClick={() => { setShowProfileModal(true); setMobileMenuOpen(false); }}
                className="text-emerald-400 font-semibold flex items-center gap-1"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Profile Settings</span>
              </button>
              <button
                onClick={handleLogout}
                className="text-rose-400 font-semibold flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>

          </div>
        )}
      </header>

      {/* Profile Modal */}
      <ProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
      />
    </>
  );
};
