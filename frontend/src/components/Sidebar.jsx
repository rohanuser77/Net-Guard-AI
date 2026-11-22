import React from 'react';
import { 
  ShieldAlert, 
  Activity, 
  Radio, 
  FileText, 
  Cpu, 
  Settings, 
  Binary,
  ShieldCheck
} from 'lucide-react';

export function Sidebar({ activeTab, onSelectTab, isUnderAttack }) {
  const navItems = [
    { id: 'overview', label: 'SOC Overview', icon: Activity },
    { id: 'monitoring', label: 'Live Monitoring', icon: Radio },
    { id: 'intelligence', label: 'Threat Intelligence', icon: Binary },
    { id: 'alerts', label: 'Alert History', icon: FileText },
    { id: 'models', label: 'Model Performance', icon: Cpu },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0d1322] border-r border-slate-800 flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-950">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5">
              NetGuard <span className="text-cyan-400 font-mono text-xs px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60">AI</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Enterprise SOC NIDS</p>
          </div>
        </div>

        {/* Threat Level Status Pill */}
        <div className="px-4 py-3 border-b border-slate-800/60">
          <div className={`px-3 py-2 rounded-md text-xs font-medium flex items-center justify-between border ${
            isUnderAttack 
              ? 'bg-red-950/40 border-red-800/60 text-red-300' 
              : 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300'
          }`}>
            <span className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isUnderAttack ? 'bg-red-500 animate-ping' : 'bg-emerald-400'}`}></span>
              DEFCON STATE
            </span>
            <span className="font-mono font-bold">{isUnderAttack ? 'ATTACK' : 'SECURE'}</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 space-y-1">
        <div className="flex items-center justify-between">
          <span>Engine</span>
          <span className="text-slate-400 font-mono">RandomForest v1</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Dataset</span>
          <span className="text-slate-400 font-mono">CICIDS-2017</span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <span>Telemetry</span>
          <span className="text-emerald-400 font-mono font-semibold">ONLINE</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
