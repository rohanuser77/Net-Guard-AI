import React from 'react';
import { Activity, Gauge, ShieldAlert, Award } from 'lucide-react';

export function StatsCards({ stats }) {
  const cards = [
    {
      title: 'Total Network Flows',
      value: (stats.total_flows || 0).toLocaleString(),
      subtext: `${(stats.normal_flows || 0).toLocaleString()} Benign flows`,
      icon: Activity,
      borderColor: 'border-slate-800',
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-950/40 border-cyan-800/50',
    },
    {
      title: 'Traffic Flows / Sec',
      value: (stats.flows_per_second || 0.0).toFixed(1),
      subtext: 'Real-time ingestion rate',
      icon: Gauge,
      borderColor: 'border-slate-800',
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-950/40 border-blue-800/50',
    },
    {
      title: 'Threats Detected',
      value: (stats.total_threats || 0).toLocaleString(),
      subtext: stats.total_threats > 0 ? 'Anomalous flows flagged' : 'Clean baseline',
      icon: ShieldAlert,
      borderColor: stats.total_threats > 0 ? 'border-red-900/60' : 'border-slate-800',
      iconColor: stats.total_threats > 0 ? 'text-red-400' : 'text-slate-400',
      iconBg: stats.total_threats > 0 ? 'bg-red-950/50 border-red-800/60' : 'bg-slate-900 border-slate-800',
    },
    {
      title: 'Avg Detection Confidence',
      value: stats.average_confidence > 0 ? `${(stats.average_confidence * 100).toFixed(1)}%` : '0.0%',
      subtext: 'Hold-out test verified',
      icon: Award,
      borderColor: 'border-slate-800',
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-950/40 border-emerald-800/50',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`bg-[#0d1322] rounded-lg p-4 border ${card.borderColor} flex items-center justify-between shadow-sm hover:border-slate-700 transition-colors duration-150`}
          >
            <div>
              <p className="text-xs text-slate-400 font-medium tracking-wide">{card.title}</p>
              <h3 className="text-2xl font-bold font-mono text-white mt-1">{card.value}</h3>
              <p className="text-[11px] text-slate-500 mt-1 font-mono">{card.subtext}</p>
            </div>
            <div className={`p-3 rounded-lg border ${card.iconBg} ${card.iconColor}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StatsCards;
