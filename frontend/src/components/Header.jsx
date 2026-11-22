import React, { useState, useEffect } from 'react';
import { Radio, Clock, Shield, Server, Wifi, WifiOff } from 'lucide-react';

export function Header({ wsStatus, flowsPerSecond }) {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isConnected = wsStatus === 'connected';

  return (
    <header className="h-16 bg-[#0d1322] border-b border-slate-800 px-6 flex items-center justify-between shrink-0">
      {/* Title & Context */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-400" />
          <span className="text-sm font-semibold text-white tracking-wide">
            NetGuard AI Operations Center
          </span>
        </div>
        <span className="text-slate-600">|</span>
        <span className="text-xs text-slate-400">
          Unidirectional Flow Threat Detection & Anomaly Classification
        </span>
      </div>

      {/* Indicators and Clocks */}
      <div className="flex items-center space-x-5">
        {/* Replay rate telemetry */}
        <div className="hidden md:flex items-center space-x-2 text-xs font-mono bg-slate-900/90 px-3 py-1.5 rounded border border-slate-800 text-slate-300">
          <Server className="w-3.5 h-3.5 text-cyan-400" />
          <span>INSPECTION RATE:</span>
          <span className="text-cyan-300 font-bold">{flowsPerSecond} flows/s</span>
        </div>

        {/* Live Status indicator */}
        <div className="flex items-center space-x-2 text-xs font-mono px-3 py-1.5 rounded border bg-slate-900/90 border-slate-800">
          {isConnected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Wifi className="w-3.5 h-3.5 inline" /> LIVE TELEMETRY
              </span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <WifiOff className="w-3.5 h-3.5 inline" /> CONNECTING
              </span>
            </>
          )}
        </div>

        {/* Real-time UTC clock */}
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>{currentTime || 'Synchronizing...'}</span>
        </div>
      </div>
    </header>
  );
}

export default Header;
