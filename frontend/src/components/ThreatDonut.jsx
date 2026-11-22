import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

const THREAT_COLORS = {
  DoS: '#f97316',        // Orange
  DDoS: '#ef4444',       // Crimson Red
  PortScan: '#eab308',   // Amber / Yellow
  Bot: '#a855f7',        // Purple
  'Web Attack': '#ec4899', // Pink / Magenta
  Infiltration: '#dc2626', // Dark Red
  Other: '#64748b',      // Slate
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-[#0b0f19] border border-slate-700 p-2.5 rounded shadow-xl text-xs font-mono">
        <p className="font-bold text-white">{data.name}</p>
        <p className="text-cyan-400">
          Detected: <span className="text-white font-semibold">{data.value} flows</span>
        </p>
      </div>
    );
  }
  return null;
};

export function ThreatDonut({ distribution = {} }) {
  const data = Object.entries(distribution)
    .filter(([name]) => name !== 'BENIGN')
    .map(([name, value]) => ({
      name,
      value,
    }));

  const totalThreats = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="bg-[#0d1322] rounded-lg p-5 border border-slate-800 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-2">
        <div className="flex items-center space-x-2">
          <PieChartIcon className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white tracking-wide">
            Threat Category Distribution
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
          {totalThreats} Incursions
        </span>
      </div>

      {totalThreats === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-center p-4">
          <div className="w-12 h-12 rounded-full bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-center mb-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
          </div>
          <p className="text-sm font-medium text-slate-300">Clean Telemetry Baseline</p>
          <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
            No attack vectors currently detected. Inject attack traffic to visualize distribution.
          </p>
        </div>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center relative">
          <div className="w-full h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={THREAT_COLORS[entry.name] || '#64748b'}
                      stroke="#0d1322"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend items */}
          <div className="flex flex-wrap gap-2 justify-center max-w-full px-2 pt-2">
            {data.map((item) => (
              <div
                key={item.name}
                className="flex items-center space-x-1.5 text-[11px] font-mono text-slate-300 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800"
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: THREAT_COLORS[item.name] || '#64748b' }}
                ></span>
                <span>{item.name}:</span>
                <span className="font-bold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ThreatDonut;
