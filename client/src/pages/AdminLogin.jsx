import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, User, ArrowRight, Key, AlertTriangle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export const AdminLogin = ({ onBackToUserAuth }) => {
  const { setCurrentUser, setActiveRole, setCurrentView, showToast, refreshData } = useApp();

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'request'
  const [submitting, setSubmitting] = useState(false);
  const [pendingMessage, setPendingMessage] = useState('');

  // Form Fields
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [reasonInput, setReasonInput] = useState('');
  const [devKeyInput, setDevKeyInput] = useState('');

  const handleAdminAuth = async (e) => {
    e.preventDefault();
    setPendingMessage('');

    if (!emailInput.trim()) {
      showToast('Please enter your email address.', 'error');
      return;
    }

    const email = emailInput.trim().toLowerCase();

    try {
      setSubmitting(true);

      if (activeTab === 'request') {
        const res = await api.registerAdmin({
          name: nameInput.trim() || `Admin ${email.split('@')[0]}`,
          email,
          reason: reasonInput,
          developerPasskey: devKeyInput.trim()
        });

        if (res.pending) {
          setPendingMessage(res.message);
          showToast('Admin request submitted! Pending developer approval.', 'warning');
        } else if (res.user) {
          setCurrentUser(res.user);
          setActiveRole('admin');
          await refreshData();
          showToast(`Welcome Lead Admin, ${res.user.name}!`, 'success');
          setCurrentView('verification');
        }
      } else {
        // Admin Login
        const res = await api.loginAdmin({
          email,
          password: passwordInput,
          developerPasskey: devKeyInput.trim()
        });

        if (res.user) {
          setCurrentUser(res.user);
          setActiveRole('admin');
          await refreshData();
          showToast(`Welcome back, Admin ${res.user.name}!`, 'success');
          setCurrentView('verification');
        }
      }
    } catch (err) {
      showToast('Admin Authentication Failed: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100 font-sans">
      
      {/* Main Container */}
      <section className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="max-w-xl w-full space-y-6">

          {/* Top Back Navigation */}
          {onBackToUserAuth && (
            <button
              onClick={onBackToUserAuth}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-2 transition"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-400" />
              <span>Back to Citizen User Sign In</span>
            </button>
          )}

          {/* Admin Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold mx-auto shadow-2xl shadow-amber-950">
              <Lock className="w-7 h-7 stroke-[2.5]" />
            </div>
            <h1 className="text-2xl font-extrabold text-white font-serif tracking-tight">
              PATRIKA Admin Portal
            </h1>
            <p className="text-xs text-amber-300 font-mono">
              Restricted Access • Fact-Checking Lead & Moderator Workbench
            </p>
          </div>

          {/* Card */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-amber-900/60 shadow-2xl space-y-6">
            
            {/* Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setPendingMessage(''); }}
                className={`py-2.5 rounded-xl transition ${
                  activeTab === 'login' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Verified Admin Sign In
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('request'); setPendingMessage(''); }}
                className={`py-2.5 rounded-xl transition ${
                  activeTab === 'request' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Request Admin Access
              </button>
            </div>

            {/* Pending Message Banner */}
            {pendingMessage && (
              <div className="p-4 rounded-2xl bg-amber-950/90 border border-amber-800 text-amber-200 text-xs space-y-1 animate-in fade-in duration-200">
                <div className="font-bold flex items-center gap-2 text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Developer Approval Required</span>
                </div>
                <p className="leading-relaxed text-slate-300">{pendingMessage}</p>
              </div>
            )}

            {/* Admin Form */}
            <form onSubmit={handleAdminAuth} className="space-y-4">
              
              {/* Full Name (Only for Request Tab) */}
              {activeTab === 'request' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Full Name <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="e.g. Rahul Mishra"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-sans"
                    />
                  </div>
                </div>
              )}

              {/* Admin Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Official Admin Email Address <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="admin@patrika.org"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>
              </div>

              {/* Reason (Only for Request Tab) */}
              {activeTab === 'request' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Reason for Admin Access Request
                  </label>
                  <textarea
                    rows={2}
                    value={reasonInput}
                    onChange={(e) => setReasonInput(e.target.value)}
                    placeholder="e.g. Senior fact-checker verifying civic reports..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  ></textarea>
                </div>
              )}

              {/* Developer Access Key / Passkey */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                  <span>Developer Authorization Key (Optional)</span>
                  <span className="text-[10px] text-amber-400 font-mono">Instant Auto-Approve</span>
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3.5 top-3 text-amber-400" />
                  <input
                    type="password"
                    value={devKeyInput}
                    onChange={(e) => setDevKeyInput(e.target.value)}
                    placeholder="Enter Developer Passkey (e.g. PATRIKA_DEV_2026)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-xl shadow-amber-950 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span>{submitting ? 'Verifying Admin Credentials...' : activeTab === 'request' ? 'Submit Admin Request' : 'Sign In to Admin Portal'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </form>

          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="py-4 px-6 bg-slate-900/90 border-t border-slate-800 text-center text-xs text-slate-400">
        PATRIKA Admin & Fact-Check Portal • Strictly Restricted Developer Access
      </footer>

    </div>
  );
};
