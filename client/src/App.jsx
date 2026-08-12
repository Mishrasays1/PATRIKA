import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { OAuthLanding } from './pages/OAuthLanding';
import { ReaderHome } from './pages/ReaderHome';
import { ArticleDetail } from './pages/ArticleDetail';
import { SubmitStory } from './pages/SubmitStory';
import { MediaLiteracy } from './pages/MediaLiteracy';
import { VerificationDesk } from './pages/VerificationDesk';
import { ReporterDashboard } from './pages/ReporterDashboard';
import { AdminLogin } from './pages/AdminLogin';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

const MainContent = () => {
  const { currentView, setCurrentView, currentUser, toast } = useApp();

  // Mandatory OAuth Gatekeeper: If user is not authenticated, show OAuth Landing Page
  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col justify-between relative bg-slate-950 text-slate-100 font-sans">
        <OAuthLanding />
        <Footer />
      </div>
    );
  }

  // UNIFIED UI & WORKFLOW ROUTER
  const renderView = () => {
    switch (currentView) {
      case 'submit':
        return <SubmitStory />;

      case 'story':
        return <ArticleDetail />;

      case 'dashboard':
        return <ReporterDashboard />;

      case 'verification':
        return <VerificationDesk />;

      case 'admin_login':
        return <AdminLogin onBackToUserAuth={() => setCurrentView('feed')} />;

      case 'literacy':
        return <MediaLiteracy />;

      case 'feed':
      default:
        return <ReaderHome />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between relative bg-slate-950 text-slate-100 font-sans">
      
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className={`px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 text-xs font-semibold backdrop-blur-md ${
            toast.type === 'error' ? 'bg-rose-950/90 border-rose-800 text-rose-200' :
            toast.type === 'warning' ? 'bg-amber-950/90 border-amber-800 text-amber-200' :
            toast.type === 'info' ? 'bg-blue-950/90 border-blue-800 text-blue-200' :
            'bg-emerald-950/90 border-emerald-800 text-emerald-200'
          }`}>
            {toast.type === 'error' ? <AlertCircle className="w-4 h-4 text-rose-400" /> :
             toast.type === 'info' ? <Info className="w-4 h-4 text-blue-400" /> :
             <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div>
        <Navbar />
        <main>{renderView()}</main>
      </div>

      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
