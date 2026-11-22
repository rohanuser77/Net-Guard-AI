import React from 'react';
import { Award, CheckCircle, AlertTriangle } from 'lucide-react';

export function ConfidenceBar({ confidence = 0, label = 'ML Confidence' }) {
  const percent = Math.min(100, Math.max(0, confidence * 100));

  let color = 'bg-cyan-500';
  let badgeColor = 'text-cyan-400 bg-cyan-950/60 border-cyan-800/80';
  if (percent >= 90) {
    color = 'bg-emerald-500';
    badgeColor = 'text-emerald-400 bg-emerald-950/60 border-emerald-800/80';
  } else if (percent >= 70) {
    color = 'bg-cyan-500';
    badgeColor = 'text-cyan-400 bg-cyan-950/60 border-cyan-800/80';
  } else if (percent > 0) {
    color = 'bg-amber-500';
    badgeColor = 'text-amber-400 bg-amber-950/60 border-amber-800/80';
  } else {
    color = 'bg-slate-600';
    badgeColor = 'text-slate-400 bg-slate-900 border-slate-800';
  }

  return (
    <div className="space-y-1.5 font-mono">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400 flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-slate-500" />
          {label}
        </span>
        <span className={`text-[11px] px-2 py-0.5 rounded border font-bold ${badgeColor}`}>
          {percent.toFixed(1)}%
        </span>
      </div>
      <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    </div>
  );
}

export default ConfidenceBar;
