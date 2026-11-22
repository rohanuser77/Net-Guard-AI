import React from 'react';
import { Cpu, Award, BarChart3, CheckCircle2, ShieldCheck, Database, HelpCircle } from 'lucide-react';

export function ModelPerformanceView({ modelPerf }) {
  if (!modelPerf) {
    return (
      <div className="bg-[#0d1322] rounded-lg p-8 border border-slate-800 text-center text-slate-400">
        <Cpu className="w-8 h-8 mx-auto text-slate-600 mb-2" />
        <p>Loading model evaluation telemetry...</p>
      </div>
    );
  }

  const overall = modelPerf.overall_metrics || {};
  const perClass = modelPerf.per_class_metrics || {};
  const topFeatures = modelPerf.top_features || [];

  return (
    <div className="space-y-6">
      {/* Title & Distinction Notice */}
      <div className="bg-[#0d1322] rounded-lg p-5 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white tracking-wide">
              Model Performance & Hold-Out Validation
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Supervised Random Forest Classifier trained on CICIDS-2017 network flow features.
          </p>
        </div>
        <div className="px-3.5 py-2 rounded-lg bg-cyan-950/40 border border-cyan-800/60 text-xs font-mono text-cyan-300">
          <span className="font-bold text-white">DATA INTEGRITY:</span> Evaluated on 20% hold-out test set with zero data leakage
        </div>
      </div>

      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#0d1322] rounded-lg p-4 border border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Test Set Accuracy</p>
          <h3 className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {((overall.accuracy || 0) * 100).toFixed(2)}%
          </h3>
          <p className="text-[11px] text-slate-500 font-mono mt-0.5">Overall classification rate</p>
        </div>
        <div className="bg-[#0d1322] rounded-lg p-4 border border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Macro Precision</p>
          <h3 className="text-2xl font-bold font-mono text-cyan-400 mt-1">
            {((overall.macro_precision || 0) * 100).toFixed(2)}%
          </h3>
          <p className="text-[11px] text-slate-500 font-mono mt-0.5">Low false alarm profile</p>
        </div>
        <div className="bg-[#0d1322] rounded-lg p-4 border border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Macro Recall</p>
          <h3 className="text-2xl font-bold font-mono text-blue-400 mt-1">
            {((overall.macro_recall || 0) * 100).toFixed(2)}%
          </h3>
          <p className="text-[11px] text-slate-500 font-mono mt-0.5">Threat capture coverage</p>
        </div>
        <div className="bg-[#0d1322] rounded-lg p-4 border border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Macro F1-Score</p>
          <h3 className="text-2xl font-bold font-mono text-purple-400 mt-1">
            {((overall.macro_f1 || 0) * 100).toFixed(2)}%
          </h3>
          <p className="text-[11px] text-slate-500 font-mono mt-0.5">Harmonic balance</p>
        </div>
      </div>

      {/* Per Class Breakdown Table */}
      <div className="bg-[#0d1322] rounded-lg p-5 border border-slate-800">
        <h3 className="text-sm font-semibold text-white tracking-wide mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          Per-Class Test Evaluation Breakdown
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#0b0f19] text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Threat Category</th>
                <th className="py-2.5 px-3">Precision</th>
                <th className="py-2.5 px-3">Recall</th>
                <th className="py-2.5 px-3">F1-Score</th>
                <th className="py-2.5 px-3">Test Support Samples</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {Object.entries(perClass).map(([clsName, metrics]) => (
                <tr key={clsName} className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 text-white font-bold">{clsName}</td>
                  <td className="py-2.5 px-3 text-emerald-400">
                    {(metrics.precision * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-cyan-400">
                    {(metrics.recall * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-purple-400">
                    {(metrics.f1_score * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">
                    {metrics.support} flows
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Features Section */}
      <div className="bg-[#0d1322] rounded-lg p-5 border border-slate-800">
        <h3 className="text-sm font-semibold text-white tracking-wide mb-3 flex items-center gap-2">
          <Award className="w-4 h-4 text-cyan-400" />
          Key Predictive Feature Importances (Gini Impurity Reduction)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          {topFeatures.map((feat, idx) => (
            <div
              key={idx}
              className="bg-[#0b0f19] p-3 rounded border border-slate-800/80 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-bold">#{idx + 1}</span>
                <span className="text-slate-300">{feat.feature}</span>
              </div>
              <span className="text-cyan-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {(feat.importance * 100).toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ModelPerformanceView;
