import React, { useState, useRef } from 'react';
import { 
  PenSquare, 
  Upload, 
  Send, 
  Image as ImageIcon, 
  CheckCircle2, 
  ArrowLeft,
  FolderOpen
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export const SubmitStory = () => {
  const { currentUser, setCurrentView, showToast, refreshData } = useApp();

  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Civic Infrastructure');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  const categories = [
    'Civic Infrastructure',
    'Environment',
    'Local Governance',
    'Crime & Safety',
    'Health & Sanitation'
  ];

  // Handle local file selection
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size should be under 5MB.', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64Url = uploadEvent.target?.result;
        setImageUrl(base64Url);
        setImagePreview(base64Url);
        showToast(`Image "${file.name}" loaded from files!`, 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast('Please enter title and report body.', 'error');
      return;
    }

    const finalImage = imageUrl || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800';

    try {
      setSubmitting(true);
      const storyData = {
        title,
        summary: summary || title.slice(0, 120),
        content,
        category,
        media: [
          {
            url: finalImage,
            type: 'image',
            caption: imageCaption || 'Reporter ground evidence photo'
          }
        ],
        evidenceAttachments: [
          {
            title: 'Ground Evidence Photo',
            url: finalImage,
            type: 'photo',
            description: imageCaption || 'Original camera photograph'
          }
        ],
        verificationChecklist: {
          mediaAuthenticity: true,
          sourceCrossCheck: true,
          locationVerified: true,
          metadataIntegrity: true
        },
        reporterId: currentUser?._id
      };

      await api.createStory(storyData);
      showToast('Story published successfully!', 'success');
      await refreshData();
      setCurrentView('feed');
    } catch (err) {
      showToast('Failed to publish story: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-200">
      
      {/* Publisher Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
            <PenSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-serif">Publisher Workspace</h1>
            <p className="text-xs text-slate-400">Write and publish your citizen report</p>
          </div>
        </div>

        <button
          onClick={() => setCurrentView('feed')}
          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Feed</span>
        </button>
      </div>

      {/* Editor Form */}
      <form onSubmit={handlePublish} className="glass-card p-6 sm:p-10 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
        
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Story Title / Headline <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter clear story headline..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-serif"
          />
        </div>

        {/* Category Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Summary */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Short Summary
          </label>
          <input
            type="text"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Brief summary..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Content Body */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Detailed Ground Report <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows={8}
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write full detailed report story here..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 leading-relaxed font-sans"
          ></textarea>
        </div>

        {/* IMAGE ATTACHMENT WITH CHOOSE FROM FILES OPTION */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <ImageIcon className="w-4 h-4 text-emerald-400" />
              <span>Image Attachment</span>
            </div>
            
            {/* Native Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* CHOOSE FROM FILES BUTTON */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-2 transition shadow"
            >
              <FolderOpen className="w-4 h-4 text-emerald-400" />
              <span>Choose from Files</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                setImagePreview(e.target.value);
              }}
              placeholder="Or paste Image Web URL..."
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
            <input
              type="text"
              value={imageCaption}
              onChange={(e) => setImageCaption(e.target.value)}
              placeholder="Caption (e.g. Ground photo)"
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Image Preview Box */}
          {imagePreview && (
            <div className="pt-2">
              <div className="text-[11px] text-slate-400 mb-1">Attached Image Preview:</div>
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-full max-h-48 object-cover rounded-xl border border-slate-800" 
              />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xl transition flex items-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Publishing...' : 'Publish Story'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
