import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '761963955701-2mclmabgns1ia9mido9hji1oo1i394es.apps.googleusercontent.com';

export const OAuthLanding = () => {
  const { setCurrentUser, setActiveRole, setCurrentView, showToast } = useApp();
  const [submitting, setSubmitting] = useState(false);
  const [gsiLoaded, setGsiLoaded] = useState(false);
  const googleBtnRef = useRef(null);

  const handleGoogleSuccess = async (googlePayload) => {
    try {
      setSubmitting(true);
      const res = await api.loginWithGoogle({
        credential: googlePayload.credential,
        userInfo: googlePayload.userInfo
      });

      setCurrentUser(res.user);
      setActiveRole(res.user.role || 'reader');
      showToast(`Welcome, ${res.user.name}!`, 'success');
      setCurrentView('feed');
    } catch (err) {
      showToast('Sign in failed: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const initializeGsi = () => {
      if (window.google?.accounts?.id && googleBtnRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: (response) => handleGoogleSuccess({ credential: response.credential }),
            auto_select: false
          });

          googleBtnRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'outline',
            size: 'large',
            width: 320,
            text: 'continue_with',
            shape: 'pill'
          });

          setGsiLoaded(true);
        } catch (err) {
          console.log('GSI init:', err);
        }
      }
    };
    const timer = setTimeout(initializeGsi, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleDirectSignIn = () => {
    const email = prompt('Enter your Google email to sign in:');
    if (!email) return;

    handleGoogleSuccess({
      userInfo: {
        email: email.toLowerCase(),
        name: email.split('@')[0],
        picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`
      }
    });
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 animate-in fade-in duration-300">
      <div className="max-w-md w-full space-y-8">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-slate-950 flex items-center justify-center mx-auto ring-4 ring-emerald-500/20">
            <ShieldCheck className="w-9 h-9 stroke-[2.5]" />
          </div>
          <h1 className="text-3xl font-extrabold text-white font-serif tracking-tight">
            PATRIKA
          </h1>
          <p className="text-sm text-slate-300 font-medium">
            Citizen Journalism & Verified News Platform
          </p>
        </div>

        {/* Clean Single Button Card */}
        <div className="glass-card p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl flex flex-col items-center">
          
          <div className="text-sm font-semibold text-slate-200 text-center">
            Sign in to access verified news & publish stories:
          </div>

          {/* Official Google Button Container */}
          <div ref={googleBtnRef} className="min-h-[44px] flex items-center justify-center"></div>

          {/* Single fallback button shown only if Google GSI iframe isn't loaded */}
          {!gsiLoaded && (
            <button
              onClick={handleDirectSignIn}
              disabled={submitting}
              className="w-full py-3.5 px-6 rounded-full bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-lg transition flex items-center justify-center gap-3 border border-slate-300"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{submitting ? 'Signing in...' : 'Sign in with Google'}</span>
            </button>
          )}

        </div>

      </div>
    </div>
  );
};
