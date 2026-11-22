import React from 'react';
import { X, ShieldAlert, Cpu, Network, CheckCircle2, FileText, Activity } from 'lucide-react';

export function EvidenceModal({ alert, onClose }) {
  if (!alert) return null;

  const evidence = alert.evidence || {};
  const confPercent = (alert.confidence_score * 100).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-[#0d1322] border border-slate-700 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#0b0f19]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-red-950/60 border border-red-800/60 text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-mono">
                  Forensic Evidence Dossier
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-red-600 text-white">
                  {alert.id}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Threat Vector: <strong className="text-red-300">{alert.threat_category}</strong> | Severity: <strong className="text-white">{alert.severity}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs font-mono">
          {/* Classification Banner */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[11px]">Model Confidence</span>
              <span className="text-2xl font-bold text-cyan-400 mt-1 block">
                {confPercent}%
              </span>
              <span className="text-[11px] text-slate-500">Evaluated on hold-out CICIDS distribution</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[11px]">Inference Engine</span>
              <span className="text-sm font-bold text-white mt-1 block">{alert.model_name}</span>
              <span className="text-[11px] text-emerald-400">Calibrated Multi-Class Forest</span>
            </div>
          </div>

          {/* Flow Network Endpoints */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Network className="w-4 h-4 text-cyan-400" />
              Network Flow Identification
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#0b0f19] p-3 rounded-lg border border-slate-800">
              <div>
                <span className="text-slate-500 text-[10px] block">SOURCE IP</span>
                <span className="text-white font-bold">{alert.source_ip}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">DESTINATION IP</span>
                <span className="text-white font-bold">{alert.destination_ip}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">DEST PORT</span>
                <span className="text-cyan-300 font-bold">{alert.destination_port}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">PROTOCOL</span>
                <span className="text-emerald-400 font-bold">{alert.protocol}</span>
              </div>
            </div>
          </div>

          {/* Key Feature Evidence */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Salient Feature Evidence Extracted
            </h4>
            <div className="bg-[#0b0f19] rounded-lg border border-slate-800 p-3 divide-y divide-slate-800/60">
              {Object.keys(evidence).length > 0 ? (
                Object.entries(evidence).map(([key, value]) => (
                  <div key={key} className="py-2 flex items-center justify-between">
                    <span className="text-slate-400">{key}</span>
                    <span className="text-white font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {typeof value === 'number' ? Number(value).toLocaleString() : String(value)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-2 text-slate-500">No feature evidence recorded.</div>
              )}
            </div>
          </div>

          {/* Explanation Section */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              SOC Anomaly Assessment
            </h4>
            <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800/80 text-slate-300 leading-relaxed text-[11px]">
              This flow exhibited packet frequency and flag variations strongly correlated with <strong className="text-white">{alert.threat_category}</strong> behavior in the CICIDS-2017 benchmark dataset. The high confidence score ({confPercent}%) indicates statistically significant deviation from benign traffic baselines.
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0b0f19] flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            Captured: {alert.timestamp}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition-colors"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}

export default EvidenceModal;
