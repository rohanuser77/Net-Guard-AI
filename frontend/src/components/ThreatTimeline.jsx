import React from 'react';
import { History, ShieldAlert, CheckCircle2 } from 'lucide-react';

export function ThreatTimeline({ alerts = [] }) {
  // Grab up to 8 most recent events chronologically
  const timelineEvents = alerts.slice(0, 8);

  return (
    <div className="bg-[#0d1322] rounded-lg p-5 border border-slate-800 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center space-x-2">
          <History className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white tracking-wide">
            Threat Detection Timeline
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-500">Chronological Event Log</span>
      </div>

      {timelineEvents.length === 0 ? (
        <div className="h-48 flex flex-col items-center justify-center text-center p-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-500/60 mb-2 stroke-1" />
          <p className="text-xs text-slate-400">Timeline Inactive</p>
          <p className="text-[11px] text-slate-600 mt-0.5">
            Security timeline will record threat incursions in chronological order.
          </p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-4 border-l border-slate-800 my-2 max-h-[300px] overflow-y-auto">
          {timelineEvents.map((evt, idx) => {
            const timeStr = evt.timestamp.split('T')[1]?.substring(0, 8) || evt.timestamp;
            return (
              <div key={idx} className="relative group">
                {/* Timeline dot */}
                <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-[#0d1322] border-2 border-red-500 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                </div>

                {/* Event content */}
                <div className="bg-[#0b0f19] p-2.5 rounded border border-slate-800/80 hover:border-slate-700 transition-colors">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-red-300 font-mono flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-red-400 inline" />
                      {evt.threat_category} Detected
                    </span>
                    <span className="font-mono text-slate-500 text-[10px]">{timeStr}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono mt-1">
                    Target: <span className="text-white">{evt.destination_ip}:{evt.destination_port}</span> | Confidence: <span className="text-cyan-400">{(evt.confidence_score * 100).toFixed(1)}%</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ThreatTimeline;
