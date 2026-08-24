import React, { useState } from 'react';
import { Sliders, CheckCircle2, XCircle, Code, ShieldCheck, Plus } from 'lucide-react';

export default function RuleEngineView() {
  const [rules, setRules] = useState([
    {
      id: "RULE-01",
      name: "Encoded PowerShell Command Execution",
      severity: "CRITICAL",
      mitre: "T1059.001",
      enabled: true,
      query: "process.name: powershell.exe AND process.command_line: *-enc*",
      description: "Detects obfuscated PowerShell executions commonly used in initial stagers."
    },
    {
      id: "RULE-02",
      name: "Windows Security Audit Log Cleared",
      severity: "HIGH",
      mitre: "T1070.001",
      enabled: true,
      query: "event.id: 1102 OR event.id: 104",
      description: "Detects clearing of Windows Security or System Event Log to hide adversary activity."
    },
    {
      id: "RULE-03",
      name: "RDP Brute Force Attempt",
      severity: "HIGH",
      mitre: "T1110.001",
      enabled: true,
      query: "event.id: 4625 COUNT > 10 IN 60s",
      description: "Detects high frequency failed logon events."
    },
    {
      id: "RULE-04",
      name: "Unusual Listening Reverse Shell Port",
      severity: "MEDIUM",
      mitre: "T1571",
      enabled: false,
      query: "network.port: (4444 OR 5555 OR 8888) AND process.name != known",
      description: "Detects uncommon high port listeners associated with reverse shells."
    },
    {
      id: "RULE-05",
      name: "Suspicious Service Creation (TargetDriver)",
      severity: "HIGH",
      mitre: "T1543.003",
      enabled: true,
      query: "event.id: 7045 AND service.name: *Target*",
      description: "Detects unauthorized driver or service installation for persistence."
    }
  ]);

  const toggleRule = (id) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  return (
    <div className="space-y-6">
      
      {/* Header Toolbar */}
      <div className="glass-panel rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-100 flex items-center gap-2 text-lg">
            <Sliders className="w-5 h-5 text-cyan-400" />
            Sigma Threat Detection Rules Engine
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Active Sigma rule definitions executed against incoming Windows security event logs.
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-mono text-xs transition-all">
          <Plus className="w-4 h-4" /> Deploy Custom Sigma Rule
        </button>
      </div>

      {/* Rules Grid */}
      <div className="space-y-4">
        {rules.map((rule) => {
          return (
            <div 
              key={rule.id}
              className={`glass-panel rounded-xl p-5 border transition-all ${
                rule.enabled ? 'border-white/10' : 'opacity-60 border-white/5 bg-slate-900/40'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                
                <div className="space-y-1">
                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className="font-bold text-cyan-400">{rule.id}</span>
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      rule.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                      rule.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                      'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                    }`}>
                      {rule.severity}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[10px]">
                      MITRE: {rule.mitre}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-100 font-mono text-sm mt-1">{rule.name}</h4>
                  <p className="text-xs text-slate-300 font-mono">{rule.description}</p>
                  
                  <div className="mt-2 p-2.5 rounded-lg bg-[#050811] border border-white/10 text-xs font-mono text-cyan-300 flex items-center gap-2">
                    <Code className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{rule.query}</span>
                  </div>
                </div>

                {/* Enable/Disable Toggle */}
                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => toggleRule(rule.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono border transition-all ${
                      rule.enabled
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 glow-green'
                        : 'bg-slate-800 text-slate-400 border-white/10'
                    }`}
                  >
                    {rule.enabled ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {rule.enabled ? 'RULE ACTIVE' : 'RULE DISABLED'}
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
