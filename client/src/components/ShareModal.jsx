import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  Send, 
  MessageCircle, 
  Twitter, 
  Facebook, 
  Mail,
  ExternalLink,
  Smartphone
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ShareModal = ({ story, isOpen, onClose }) => {
  const { showToast } = useApp();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !story) return null;

  // Generate public deep link for the story
  const shareUrl = `${window.location.origin}/?story=${story._id}`;
  const shareTitle = `PATRIKA Verified News: ${story.title}`;
  const shareText = `Check out this verified citizen news report on PATRIKA: "${story.title}"\n📍 Location: ${story.location || 'Ground'}\n`;

  // 1. Copy Direct Link to Clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    showToast('Story share link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  // 2. Native Mobile Share API (if supported by browser/device)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        showToast('Shared successfully!', 'success');
      } catch (err) {
        console.log('Native share cancelled:', err);
      }
    } else {
      handleCopyLink();
    }
  };

  // 3. Social Platform Handlers
  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
    window.open(url, '_blank');
  };

  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const handleEmailShare = () => {
    const url = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\nRead story here: ${shareUrl}`)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Modal Card */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="glass-card max-w-md w-full p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base font-serif">Share Story</h3>
              <p className="text-[11px] text-slate-400">Share this verified report across platforms</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Story Snapshot Preview */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
          <div className="text-[10px] text-amber-400 font-mono font-bold uppercase">{story.category}</div>
          <h4 className="font-bold text-white text-xs line-clamp-2">{story.title}</h4>
          <div className="text-[11px] text-slate-400">Location: <span className="text-emerald-300">{story.location || 'Ground'}</span></div>
        </div>

        {/* 1-Click Copy Link Bar */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">
            Direct Share Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 font-mono focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Social Sharing Grid */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-300">Share to Platforms:</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            
            {/* WhatsApp */}
            <button
              onClick={handleWhatsAppShare}
              className="p-3 rounded-2xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800/80 text-emerald-300 text-xs font-semibold flex flex-col items-center gap-1.5 transition group"
            >
              <MessageCircle className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition" />
              <span>WhatsApp</span>
            </button>

            {/* X / Twitter */}
            <button
              onClick={handleTwitterShare}
              className="p-3 rounded-2xl bg-sky-950/60 hover:bg-sky-900/80 border border-sky-800/80 text-sky-300 text-xs font-semibold flex flex-col items-center gap-1.5 transition group"
            >
              <Twitter className="w-5 h-5 text-sky-400 group-hover:scale-110 transition" />
              <span>X (Twitter)</span>
            </button>

            {/* Facebook */}
            <button
              onClick={handleFacebookShare}
              className="p-3 rounded-2xl bg-blue-950/60 hover:bg-blue-900/80 border border-blue-800/80 text-blue-300 text-xs font-semibold flex flex-col items-center gap-1.5 transition group"
            >
              <Facebook className="w-5 h-5 text-blue-400 group-hover:scale-110 transition" />
              <span>Facebook</span>
            </button>

            {/* Email */}
            <button
              onClick={handleEmailShare}
              className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold flex flex-col items-center gap-1.5 transition group"
            >
              <Mail className="w-5 h-5 text-slate-400 group-hover:scale-110 transition" />
              <span>Email</span>
            </button>

          </div>
        </div>

        {/* Mobile Device Native Share Button */}
        {typeof navigator !== 'undefined' && navigator.share && (
          <button
            onClick={handleNativeShare}
            className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>More Sharing Options (Device Native)</span>
          </button>
        )}

      </div>

    </div>
  );
};
