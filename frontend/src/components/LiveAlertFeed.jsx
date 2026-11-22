import React from 'react';
import { ShieldAlert, ExternalLink, Filter } from 'lucide-react';

const SEVERITY_BADGES = {
  CRITICAL: 'bg-red-950/80 text-red-300 border-red-700/80',
  HIGH: 'bg-orange-950/80 text-orange-300 border-orange-700/80',
  MEDIUM: 'bg-amber-950/80 text-amber-300 border-amber-700/80',
  LOW: 'bg-blue-950/80 text-blue-300 border-blue-700/80',
  NORMAL: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80',
};

export function LiveAlertFeed({ alerts = [], onSelectAlert }) {
  return (
    <div className="bg-[#0d1322] rounded-lg p-5 border border-slate-800 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white tracking-wide">
            Real-Time Alert Feed
          </h3>
          <span className="text-xs font-mono bg-cyan-950/60 text-cyan-400 border border-cyan-800/60 px-2 py-0.5 rounded">
            {alerts.length} Logged
          </span>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">
          Click any row to inspect ML evidence
        </span>
      </div>

      {alerts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
          <ShieldAlert className="w-8 h-8 text-slate-600 mb-2 stroke-1" />
          <p className="text-sm text-slate-400">No Security Incidents</p>
          <p className="text-xs text-slate-600 mt-1">
            Normal flow ingestion in progress. Real-time alerts will appear here as ML models flag malicious traffic.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b0f19] text-slate-400 font-mono sticky top-0 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Alert ID</th>
                <th className="py-2.5 px-3">Threat Category</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3">Endpoints</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3 text-right">Evidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {alerts.map((alert) => {
                const confPercent = (alert.confidence_score * 100).toFixed(1);
                const sevClass = SEVERITY_BADGES[alert.severity] || SEVERITY_BADGES.HIGH;

                return (
                  <tr
                    key={alert.id}
                    onClick={() => onSelectAlert(alert)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors duration-100 group"
                  >
                    <td className="py-2.5 px-3 text-cyan-400 font-semibold group-hover:text-cyan-300">
                      {alert.id}
                    </td>
                    <td className="py-2.5 px-3 text-white font-medium">
                      {alert.threat_category}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${sevClass}`}>
                        {alert.severity}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-cyan-400 h-1.5 rounded-full"
                            style={{ width: `${confPercent}%` }}
                          ></div>
                        </div>
                        <span className="text-slate-300 text-[11px]">{confPercent}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                      {alert.source_ip} <span className="text-slate-600">→</span> {alert.destination_ip}:{alert.destination_port}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                      {alert.timestamp.split('T')[1]?.substring(0, 8) || alert.timestamp}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAlert(alert);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/60 px-2 py-1 rounded border border-cyan-800/60 transition-colors"
                      >
                        <span>Inspect</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default LiveAlertFeed;
