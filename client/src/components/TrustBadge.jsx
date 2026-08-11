import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const TrustBadge = ({ score = 0, level = 'Unverified', size = 'md', showScore = true }) => {
  let badgeStyle = 'bg-slate-800 text-slate-300 border-slate-700';
  let Icon = ShieldAlert;
  let label = level;

  if (score >= 85 || level === 'High Confidence') {
    badgeStyle = 'badge-high';
    Icon = ShieldCheck;
    label = 'Verified Authentic';
  } else if (score >= 65 || level === 'Medium Confidence') {
    badgeStyle = 'badge-medium';
    Icon = CheckCircle2;
    label = 'Verified w/ Caveats';
  } else if (level === 'Needs Edits') {
    badgeStyle = 'badge-warning';
    Icon = AlertTriangle;
    label = 'Edits Requested';
  } else if (level === 'Rejected') {
    badgeStyle = 'bg-rose-950/60 text-rose-400 border-rose-800/60';
    Icon = ShieldAlert;
    label = 'Flagged / Rejected';
  } else {
    badgeStyle = 'bg-slate-800/80 text-amber-300 border-amber-500/30';
    Icon = ShieldAlert;
    label = 'Pending Review';
  }

  const py = size === 'lg' ? 'py-1.5 px-3.5 text-sm font-semibold' : 'py-1 px-2.5 text-xs font-medium';

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full border transition-all shadow-sm ${py} ${badgeStyle}`}>
      <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      <span>{label}</span>
      {showScore && score > 0 && (
        <span className="ml-1 pl-1.5 border-l border-current/20 font-mono font-bold">
          {score}%
        </span>
      )}
    </div>
  );
};
