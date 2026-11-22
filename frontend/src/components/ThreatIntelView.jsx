import React from 'react';
import { Binary, ShieldAlert, AlertTriangle, ShieldCheck, Bug, Terminal, Globe, Lock } from 'lucide-react';

export function ThreatIntelView() {
  const threatProfiles = [
    {
      category: 'DoS (Denial of Service)',
      severity: 'HIGH',
      mitre: 'T1498 - Network Denial of Service',
      description: 'Slowloris, Hulk, GoldenEye, and SlowHTTP attacks aimed at exhausting target web server thread pools and socket buffers.',
      indicators: 'Elevated SYN flag counts, asymmetric forward packet lengths, high flow duration with low packet volume.',
      ports: 'TCP 80, 443, 8080',
      icon: AlertTriangle,
      color: 'border-orange-800/80 bg-orange-950/20 text-orange-400',
    },
    {
      category: 'DDoS (Distributed Denial of Service)',
      severity: 'CRITICAL',
      mitre: 'T1498.001 - Direct Network Flood',
      description: 'High-volume synchronized flow flooding saturating network bandwidth and gateway queues.',
      indicators: 'Extremely high packets/sec, high byte rate, abnormal ratio of small SYN/ACK packets.',
      ports: 'TCP 80, 443',
      icon: ShieldAlert,
      color: 'border-red-800/80 bg-red-950/20 text-red-400',
    },
    {
      category: 'PortScan',
      severity: 'MEDIUM',
      mitre: 'T1046 - Network Service Scanning',
      description: 'Systematic reconnaissance scanning across sequential port ranges to discover active listener services.',
      indicators: 'Rapid micro-flows under 1500μs, single SYN or RST flag, very low payload bytes per flow.',
      ports: 'Range 20 - 1024',
      icon: Terminal,
      color: 'border-amber-800/80 bg-amber-950/20 text-amber-400',
    },
    {
      category: 'Bot (Botnet Telemetry)',
      severity: 'HIGH',
      mitre: 'T1071 - Application Layer Protocol C2',
      description: 'Automated command-and-control beaconing and peer-to-peer heartbeats coordinating compromised endpoints (e.g. Ares botnet).',
      indicators: 'Periodic flow inter-arrival times (IAT), fixed header sizes, repeating PSH/ACK flags.',
      ports: 'TCP 80, 8080, 6667',
      icon: Bug,
      color: 'border-purple-800/80 bg-purple-950/20 text-purple-400',
    },
    {
      category: 'Web Attack',
      severity: 'HIGH',
      mitre: 'T1190 - Exploit Public-Facing Application',
      description: 'SQL Injection, Cross-Site Scripting (XSS), and HTTP authentication brute force vectors against web applications.',
      indicators: 'Abnormal HTTP payload lengths, high backward packet size ratios, specific web request parameter anomalies.',
      ports: 'TCP 80, 443',
      icon: Globe,
      color: 'border-pink-800/80 bg-pink-950/20 text-pink-400',
    },
    {
      category: 'Infiltration',
      severity: 'CRITICAL',
      mitre: 'T1068 - Exploitation for Privilege Escalation',
      description: 'Internal exploitation, lateral network movement, and privilege escalation following preliminary perimeter compromise.',
      indicators: 'Long-duration administrative protocol sessions (SSH/RDP/SMB) with anomalous data transfers.',
      ports: 'TCP 22, 3389, 445',
      icon: Lock,
      color: 'border-rose-800/80 bg-rose-950/20 text-rose-400',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-[#0d1322] rounded-lg p-5 border border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Binary className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white tracking-wide">
              Threat Intelligence Knowledge Base
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Signatures, behavioral anomalies, and MITRE ATT&CK alignments derived from CICIDS-2017.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {threatProfiles.map((tp, idx) => {
          const Icon = tp.icon;
          return (
            <div
              key={idx}
              className={`rounded-lg p-5 border ${tp.color} space-y-3 shadow-sm`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <Icon className="w-5 h-5" />
                  <h3 className="text-sm font-bold text-white font-mono">{tp.category}</h3>
                </div>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded border border-current">
                  {tp.severity}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{tp.description}</p>

              <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">MITRE ATT&CK:</span>
                  <span className="text-cyan-300">{tp.mitre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Ports:</span>
                  <span className="text-white">{tp.ports}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Flow Indicators:</span>
                  <span className="text-slate-400">{tp.indicators}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ThreatIntelView;
