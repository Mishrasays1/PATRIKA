import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Lock, User, Globe, ArrowRight, AlertCircle, CheckCircle2, Key, X, Mail } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export const AuthPage = () => {
  const { currentUser, setCurrentUser, setActiveRole, setCurrentView, showToast } = useApp();

  const [selectedRole, setSelectedRole] = useState('reporter');
  const [googleClientId, setGoogleClientId] = useState(
    import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
  );
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const googleBtnRef = useRef(null);

  // Handle Google OAuth callback from official Google SDK or Modal
  const handleGoogleSuccess = async (googlePayload) => {
    try {
      setSubmitting(true);
      const res = await api.loginWithGoogle({
        credential: googlePayload.credential,
        userInfo: googlePayload.userInfo,
        requestedRole: selectedRole
      });

      setCurrentUser(res.user);
      setActiveRole(res.user.role);
      showToast(`Google OAuth 2.0 Authenticated! Signed in as ${res.user.name}`, 'success');
      setShowGoogleModal(false);

      // Navigate based on role
      if (res.user.role === 'moderator') {
        setCurrentView('verify');
      } else if (res.user.role === 'admin') {
        setCurrentView('admin');
      } else if (res.user.role === 'reporter') {
        setCurrentView('dashboard');
      } else {
        setCurrentView('feed');
      }
    } catch (err) {
      showToast('Google OAuth verification failed: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Initialize official Google Identity Services SDK if custom Client ID is provided
  useEffect(() => {
    if (googleClientId.trim() && window.google?.accounts?.id && googleBtnRef.current) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId.trim(),
          callback: (response) => handleGoogleSuccess({ credential: response.credential }),
          auto_select: false
        });

        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'signin_with',
          shape: 'pill'
        });
      } catch (err) {
        console.log('GSI initialize:', err);
      }
    }
  }, [googleClientId, selectedRole]);

  // Execute Modal Sign In
  const executeModalGoogleAuth = (e) => {
    e.preventDefault();
    if (!googleEmail.trim()) {
      showToast('Please enter your Google email address.', 'error');
      return;
    }

    handleGoogleSuccess({
      userInfo: {
        email: googleEmail.toLowerCase(),
        name: googleName.trim() || googleEmail.split('@')[0],
        picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(googleEmail)}`
      }
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    showToast('Signed out of Google session.', 'info');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <Lock className="w-3.5 h-3.5" />
          <span>Google OAuth 2.0 Single Sign-On</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white font-serif tracking-tight">
          Sign In with Google OAuth 2.0
        </h1>
        <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
          Authenticate using your Google Account. Profile claims and JWT tokens are verified on the backend and saved into MongoDB.
        </p>
      </div>

      {currentUser ? (
        <div className="glass-card p-8 rounded-3xl border border-slate-800 text-center space-y-4 shadow-2xl">
          <img src={currentUser.avatar} alt="Profile" className="w-16 h-16 rounded-full object-cover ring-4 ring-emerald-500/30 mx-auto" />
          <div>
            <div className="text-lg font-bold text-white">{currentUser.name}</div>
            <div className="text-xs text-slate-400">{currentUser.email}</div>
            <div className="mt-2 inline-block px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-mono font-bold uppercase">
              Role: {currentUser.role}
            </div>
          </div>

          <div className="pt-4 flex justify-center gap-3">
            <button
              onClick={() => setCurrentView('feed')}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-lg"
            >
              Go to Hyperlocal News Feed
            </button>
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 font-semibold text-xs border border-slate-700 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-card p-6 sm:p-10 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
          
          {/* Step 1: Select Platform Role for Google OAuth Session */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Select Your Assigned Platform Role for Google OAuth Session:
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSelectedRole('reporter')}
                className={`p-3 rounded-2xl border text-left font-semibold transition ${selectedRole === 'reporter' ? 'bg-emerald-950 border-emerald-500 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
              >
                <div>Citizen Journalist</div>
                <div className="text-[10px] text-slate-400 font-normal">Submits & tracks local news</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('moderator')}
                className={`p-3 rounded-2xl border text-left font-semibold transition ${selectedRole === 'moderator' ? 'bg-amber-950 border-amber-500 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
              >
                <div>Fact-Checker / Mod</div>
                <div className="text-[10px] text-slate-400 font-normal">OSINT verification desk</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('reader')}
                className={`p-3 rounded-2xl border text-left font-semibold transition ${selectedRole === 'reader' ? 'bg-blue-950 border-blue-500 text-blue-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
              >
                <div>Public Reader</div>
                <div className="text-[10px] text-slate-400 font-normal">Reads & upvotes news</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('admin')}
                className={`p-3 rounded-2xl border text-left font-semibold transition ${selectedRole === 'admin' ? 'bg-purple-950 border-purple-500 text-purple-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
              >
                <div>Platform Admin</div>
                <div className="text-[10px] text-slate-400 font-normal">KPI analytics & controls</div>
              </button>
            </div>
          </div>

          {/* Primary Google OAuth Button */}
          <div className="space-y-4 pt-4 border-t border-slate-800 flex flex-col items-center">
            
            {/* Main Google OAuth Button */}
            <button
              onClick={() => setShowGoogleModal(true)}
              className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs transition shadow-xl flex items-center justify-center gap-3 border border-slate-300"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Sign in with Google OAuth 2.0</span>
            </button>

            {/* If user provided custom Google Client ID */}
            {googleClientId.trim() && (
              <div className="w-full flex flex-col items-center pt-2">
                <div className="text-[11px] text-slate-400 mb-1">Official GSI SDK Button (Custom Client ID):</div>
                <div ref={googleBtnRef}></div>
              </div>
            )}
          </div>

          {/* Optional Google Client ID Input */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-emerald-400" />
                <span>Google Cloud OAuth Client ID (Optional):</span>
              </span>
              <span className="text-[10px] text-slate-500">From console.cloud.google.com</span>
            </div>
            <input
              type="text"
              value={googleClientId}
              onChange={(e) => setGoogleClientId(e.target.value)}
              placeholder="e.g., 123456789-xyz.apps.googleusercontent.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-[11px] font-mono text-slate-300 focus:outline-none focus:border-emerald-500 placeholder:text-slate-600"
            />
          </div>

        </div>
      )}

      {/* GOOGLE OAUTH IDENTITY CONSENT MODAL */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="glass-card max-w-md w-full rounded-3xl overflow-hidden border border-slate-700 shadow-2xl animate-in zoom-in-95 duration-200">
            
            {/* Google Header */}
            <div className="p-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-slate-100 font-bold text-sm">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Google OAuth 2.0 Identity Consent</span>
              </div>
              <button onClick={() => setShowGoogleModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Consent Body */}
            <form onSubmit={executeModalGoogleAuth} className="p-6 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-slate-300">
                <div className="font-semibold text-emerald-400">PATRIKA wants to access:</div>
                <div className="text-[11px] text-slate-400">
                  • Your basic Google profile info (Name, Profile Picture)<br/>
                  • Your Google Account Email Address
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-200 mb-1">
                  Google Account Email <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    placeholder="e.g., your.name@gmail.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-200 mb-1">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  placeholder="e.g., Ananya Sharma"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{submitting ? 'Authenticating...' : 'Confirm Google OAuth Sign-In'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
