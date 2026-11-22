import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, Activity } from 'lucide-react';

export function StatusBanner({ isUnderAttack, lastThreat, replayMode }) {
  if (isUnderAttack) {
    return (
      <div className="bg-gradient-to-r from-red-950/80 via-red-900/50 to-[#0b0f19] border-l-4 border-red-500 rounded-lg p-4 border border-red-900/60 shadow-lg shadow-red-950/30 flex items-center justify-between transition-all duration-300">
        <div className="flex items-center space-x-4">
          <div className="p-2.5 rounded-lg bg-red-600/20 text-red-400 border border-red-500/40 animate-pulse">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-red-200 tracking-wide font-mono">
                THREAT DETECTED — UNDER ATTACK
              </h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-red-600 text-white animate-pulse">
                CRITICAL INTRUSION
              </span>
            </div>
            <p className="text-xs text-red-300/90 mt-0.5">
              Active network vector:{' '}
              <strong className="text-white font-mono uppercase bg-red-950 px-1.5 py-0.5 rounded border border-red-800">
                {lastThreat?.threat_class || 'UNKNOWN ANOMALY'}
              </strong>{' '}
              {lastThreat?.confidence && (
                <span className="text-red-400 font-mono ml-2">
                  (Confidence: {(lastThreat.confidence * 100).toFixed(1)}%)
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="hidden sm:flex flex-col items-end text-xs font-mono text-red-400">
          <span>STATUS: MITIGATION TRIGGERED</span>
          <span className="text-[11px] text-red-500/80">INSPECTING INCOMING PACKETS</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-emerald-950/40 via-emerald-900/20 to-[#0b0f19] border-l-4 border-emerald-500 rounded-lg p-4 border border-emerald-900/40 shadow-sm flex items-center justify-between transition-all duration-300">
      <div className="flex items-center space-x-4">
        <div className="p-2.5 rounded-lg bg-emerald-600/10 text-emerald-400 border border-emerald-500/30">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-emerald-200 tracking-wide font-mono">
              ALL SYSTEMS NORMAL
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-950 text-emerald-400 border border-emerald-800/80">
              {replayMode === 'STOPPED' ? 'SIMULATION IDLE' : 'BENIGN FLOW INGESTION'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Zero anomalous telemetry detected. Machine learning inference engine active on CICIDS-2017 baseline.
          </p>
        </div>
      </div>
      <div className="hidden sm:flex flex-col items-end text-xs font-mono text-emerald-400/90">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          INTEGRITY: 100%
        </span>
        <span className="text-[11px] text-slate-500">FIREWALL / NIDS MONITORING</span>
      </div>
    </div>
  );
}

export default StatusBanner;
