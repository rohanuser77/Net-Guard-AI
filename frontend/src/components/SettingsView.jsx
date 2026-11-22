import React from 'react';
import { Settings, Server, Database, Radio, Cpu, CheckCircle2 } from 'lucide-react';

export function SettingsView({ wsStatus, replayStatus }) {
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const wsBase = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

  return (
    <div className="space-y-6">
      <div className="bg-[#0d1322] rounded-lg p-5 border border-slate-800">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white tracking-wide">
            NetGuard AI SOC Environment Diagnostics
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Operational telemetry and subsystem integration parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* API Backend Config */}
        <div className="bg-[#0d1322] rounded-lg p-5 border border-slate-800 space-y-3 font-mono text-xs">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-400" />
            FastAPI Backend Service
          </h3>
          <div className="space-y-2 text-slate-400">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span>REST API Base URL</span>
              <span className="text-cyan-400">{apiBase}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span>WebSocket Gateway</span>
              <span className="text-cyan-400">{wsBase}/ws/live</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span>Telemetry State</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {wsStatus.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Machine Learning Pipeline Config */}
        <div className="bg-[#0d1322] rounded-lg p-5 border border-slate-800 space-y-3 font-mono text-xs">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            Detection Engine Configuration
          </h3>
          <div className="space-y-2 text-slate-400">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span>Model Architecture</span>
              <span className="text-white">RandomForestClassifier</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span>Feature Normalizer</span>
              <span className="text-white">CICIDSPreprocessor (StandardScaler)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span>Classification Mode</span>
              <span className="text-emerald-400">7-Class Multiclass</span>
            </div>
          </div>
        </div>

        {/* Persistent Storage */}
        <div className="bg-[#0d1322] rounded-lg p-5 border border-slate-800 space-y-3 font-mono text-xs">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            Persistent Alert Store
          </h3>
          <div className="space-y-2 text-slate-400">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span>Database Engine</span>
              <span className="text-white">SQLite 3</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span>Indexed Tables</span>
              <span className="text-cyan-400">alerts (timestamp, category)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span>Production Target</span>
              <span className="text-slate-300">PostgreSQL Ready</span>
            </div>
          </div>
        </div>

        {/* Dataset Telemetry */}
        <div className="bg-[#0d1322] rounded-lg p-5 border border-slate-800 space-y-3 font-mono text-xs">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            Dataset Replayer Telemetry
          </h3>
          <div className="space-y-2 text-slate-400">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span>Dataset Source</span>
              <span className="text-white">CICIDS-2017</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span>Replayed Flows</span>
              <span className="text-cyan-400 font-bold">{replayStatus.flows_replayed} flows</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span>Replay Speed Multiplier</span>
              <span className="text-white">{replayStatus.speed_factor}x</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsView;
