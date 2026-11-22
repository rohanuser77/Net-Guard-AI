import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { LineChart as LineChartIcon } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const normal = payload.find((p) => p.dataKey === 'normal')?.value || 0;
    const threat = payload.find((p) => p.dataKey === 'threat')?.value || 0;
    return (
      <div className="bg-[#0b0f19] border border-slate-700 p-2.5 rounded shadow-xl text-xs font-mono">
        <p className="text-slate-400 mb-1 font-semibold">{label}</p>
        <p className="text-emerald-400">Normal Flows: <span className="font-bold text-white">{normal}</span></p>
        <p className="text-red-400">Threat Flows: <span className="font-bold text-white">{threat}</span></p>
        <p className="text-slate-500 pt-1 border-t border-slate-800">Total: {normal + threat}</p>
      </div>
    );
  }
  return null;
};

export function TrafficChart({ data = [] }) {
  // Fallback points if data is empty initially
  const chartData = data.length > 0 ? data : Array.from({ length: 20 }, (_, i) => ({
    time: `--:--:${i < 10 ? '0' + i : i}`,
    normal: 0,
    threat: 0,
    total: 0,
  }));

  return (
    <div className="bg-[#0d1322] rounded-lg p-5 border border-slate-800 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center space-x-2">
          <LineChartIcon className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white tracking-wide">
            Traffic Volume & Threat Ingestion (Last 60 Seconds)
          </h3>
        </div>
        <div className="flex items-center space-x-4 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block"></span> Normal
          </span>
          <span className="flex items-center gap-1.5 text-red-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block"></span> Suspicious / Attack
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="normalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="threatGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#1e293b' }}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#1e293b' }}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="normal"
              name="Normal Traffic"
              stroke="#10b981"
              strokeWidth={1.5}
              fillOpacity={1}
              fill="url(#normalGrad)"
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="threat"
              name="Suspicious Traffic"
              stroke="#ef4444"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#threatGrad)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default TrafficChart;
