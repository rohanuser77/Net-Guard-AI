import React, { useState } from 'react';
import { 
  Play, 
  Square, 
  Zap, 
  RotateCcw, 
  Gauge, 
  Sliders, 
  ShieldAlert, 
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export function ControlPanel({
  replayStatus,
  onStart,
  onStop,
  onInject,
  onReset,
  isLoading,
  successMsg,
  errorMsg,
}) {
  const [selectedAttack, setSelectedAttack] = useState('DoS');
  const [burstCount, setBurstCount] = useState(25);
  const [speed, setSpeed] = useState(replayStatus.speed_factor || 1.0);

  const availableAttacks = replayStatus.available_attack_types || [
    'DoS',
    'DDoS',
    'PortScan',
    'Bot',
    'Web Attack',
    'Infiltration',
  ];

  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
    if (replayStatus.is_running) {
      onStart(newSpeed);
    }
  };

  return (
    <div className="bg-[#0d1322] rounded-lg p-5 border border-slate-800 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white tracking-wide">
            Traffic Simulation & Threat Injection Console
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-slate-400">Simulation Status:</span>
          <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
            replayStatus.is_running
              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80'
              : 'bg-slate-900 text-slate-400 border-slate-800'
          }`}>
            {replayStatus.mode || 'STOPPED'}
          </span>
        </div>
      </div>

      {/* Notification banners */}
      {successMsg && (
        <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-2.5 rounded bg-red-950/40 border border-red-800/60 text-red-300 text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        {/* Replay Execution Buttons */}
        <div className="space-y-1.5">
          <label className="text-xs text-slate-400 font-medium block">Simulator State</label>
          <div className="flex items-center space-x-2">
            {!replayStatus.is_running ? (
              <button
                onClick={() => onStart(speed)}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-emerald-950 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                START REPLAY
              </button>
            ) : (
              <button
                onClick={onStop}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-amber-950 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Square className="w-4 h-4" />}
                STOP REPLAY
              </button>
            )}
            <button
              onClick={onReset}
              disabled={isLoading}
              title="Reset metrics and simulation"
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors border border-slate-700 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Speed Selector */}
        <div className="space-y-1.5">
          <label className="text-xs text-slate-400 font-medium flex items-center justify-between">
            <span>Replay Speed Multiplier</span>
            <span className="text-cyan-400 font-mono font-bold">{speed}x</span>
          </label>
          <div className="flex space-x-1">
            {[0.5, 1.0, 2.0, 5.0].map((s) => (
              <button
                key={s}
                onClick={() => handleSpeedChange(s)}
                className={`flex-1 py-2 text-xs font-mono font-semibold rounded border transition-colors cursor-pointer ${
                  speed === s
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Attack Vector Selector */}
        <div className="space-y-1.5">
          <label className="text-xs text-slate-400 font-medium block">Dataset Threat Vector</label>
          <select
            value={selectedAttack}
            onChange={(e) => setSelectedAttack(e.target.value)}
            className="w-full py-2 px-3 rounded-lg bg-[#0b0f19] border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            {availableAttacks.map((atk) => (
              <option key={atk} value={atk}>
                {atk}
              </option>
            ))}
          </select>
        </div>

        {/* Attack Injection Trigger */}
        <div className="space-y-1.5">
          <label className="text-xs text-slate-400 font-medium flex items-center justify-between">
            <span>Burst Flow Quantity</span>
            <span className="text-red-400 font-mono font-bold">{burstCount} flows</span>
          </label>
          <div className="flex items-center space-x-2">
            <select
              value={burstCount}
              onChange={(e) => setBurstCount(Number(e.target.value))}
              className="w-20 py-2 px-2 rounded-lg bg-[#0b0f19] border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <button
              onClick={() => onInject(selectedAttack, burstCount)}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-red-950 disabled:opacity-50 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              INJECT ATTACK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ControlPanel;
