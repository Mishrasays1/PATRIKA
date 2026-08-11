import React from 'react';
import { ShieldCheck, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-900 bg-slate-950/80 text-slate-400 text-xs py-6 mt-12">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-2 text-slate-300 font-semibold">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>PATRIKA — Verified Citizen Journalism Platform</span>
        </div>

        <div className="flex items-center gap-1 text-slate-500 text-[11px]">
          <span>Built with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>for Community Trust</span>
        </div>

      </div>
    </footer>
  );
};
