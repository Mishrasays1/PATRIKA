import React from 'react';
import { BookOpen, ShieldCheck, CheckCircle2, AlertOctagon, Cpu, ExternalLink, Award, FileText } from 'lucide-react';

export const MediaLiteracy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-10 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="glass-card p-6 sm:p-10 rounded-3xl border border-slate-800 space-y-4 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/40">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>IFCN & PIB Aligned Verification Standard</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-serif tracking-tight leading-tight">
          Media Literacy & Verification Framework
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
          PATRIKA operates under international fact-checking principles to ensure citizen reporting remains credible, ethical, and resistant to misinformation.
        </p>
      </div>

      {/* 5 Pillars of Verification */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white font-serif flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-400" />
          <span>The 5 Core Pillars of Citizen Fact-Checking</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="font-bold text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>1. Nonpartisanship & Fairness</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              We evaluate every submitted story using the exact same standard of evidence regardless of political or institutional affiliations.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="font-bold text-blue-400 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>2. Transparency of Sources</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Every assertion must be backed by inspectable primary evidence (RTI responses, municipal tender disclosures, or EXIF-verified photos).
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="font-bold text-purple-400 flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              <span>3. Media Forensics & OSINT</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Photographs and videos are scanned for reverse image index matches, EXIF header manipulation, and lighting/compression anomalies.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="font-bold text-amber-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>4. Correction & Open Feedback Policy</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Readers can flag misinformation via the platform inbox. If a story requires correction, reviewer audit notes are publicly appended.
            </p>
          </div>

        </div>
      </div>

      {/* Citizen Educational Guide */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <h2 className="text-lg font-bold text-white font-serif flex items-center gap-2">
          <AlertOctagon className="w-5 h-5 text-rose-400" />
          <span>Citizen Guide: How to Spot Misinformation</span>
        </h2>

        <div className="space-y-4 text-xs text-slate-300">
          
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-semibold text-slate-200">Rule 1: Verify the Timestamp & Original Context</div>
            <p className="text-slate-400 leading-relaxed">
              Old images from past natural disasters or foreign events are frequently reshared during current local events. Always check EXIF metadata dates.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-semibold text-slate-200">Rule 2: Cross-Reference Official Municipal Bulletins</div>
            <p className="text-slate-400 leading-relaxed">
              For civic issues (water pipeline shutdowns, road closures, power cuts), verify if local ward offices or utility providers have issued statements.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-semibold text-slate-200">Rule 3: Look for Sensationalist Headlines vs. Evidence Body</div>
            <p className="text-slate-400 leading-relaxed">
              Out-of-context headlines designed for viral outrage often lack supporting facts in the report body. Stick to verified metrics.
            </p>
          </div>

        </div>
      </div>

      {/* Institutional References */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="space-y-1">
          <div className="font-bold text-slate-200">Official Standards & Resources</div>
          <div className="text-slate-400">Read more about global fact-checking & media literacy guidelines.</div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="https://www.poynter.org/ifcn/"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold flex items-center gap-1.5 transition"
          >
            <span>IFCN Network</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <a
            href="https://www.pib.gov.in/"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold flex items-center gap-1.5 transition"
          >
            <span>PIB Fact Check</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

    </div>
  );
};
