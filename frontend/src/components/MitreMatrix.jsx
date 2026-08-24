import React, { useState } from 'react';
import { Grid, Shield, AlertCircle, ChevronRight, Info } from 'lucide-react';

export default function MitreMatrix() {
  const [selectedTechnique, setSelectedTechnique] = useState(null);

  const TACTICS = [
    {
      name: "Initial Access",
      code: "TA0001",
      techniques: [
        { id: "T1078", name: "Valid Accounts", count: 4, status: "ALERT", desc: "Adversaries obtain credentials of existing domain/local user accounts." },
        { id: "T1190", name: "Exploit Public-Facing App", count: 0, status: "COVERED", desc: "Exploiting software vulnerabilities in web servers or remote access points." }
      ]
    },
    {
      name: "Execution",
      code: "TA0002",
      techniques: [
        { id: "T1059.001", name: "PowerShell", count: 9, status: "CRITICAL", desc: "Powershell commands with encoded payload or bypass flags executed." },
        { id: "T1059.003", name: "Windows Command Shell", count: 5, status: "ALERT", desc: "Execution of cmd.exe via parent processes." }
      ]
    },
    {
      name: "Persistence",
      code: "TA0003",
      techniques: [
        { id: "T1543.003", name: "Windows Service", count: 2, status: "ALERT", desc: "Installation of target kernel driver or background system service." },
        { id: "T1053.005", name: "Scheduled Task", count: 1, status: "COVERED", desc: "Adversaries configure tasks to run commands at recurring intervals." }
      ]
    },
    {
      name: "Privilege Escalation",
      code: "TA0004",
      techniques: [
        { id: "T1055", name: "Process Injection", count: 3, status: "ALERT", desc: "Injecting code into processes (e.g. lsass.exe or svchost.exe)." },
        { id: "T1548.002", name: "Bypass UAC", count: 0, status: "COVERED", desc: "Bypassing User Account Control to elevate permissions without prompt." }
      ]
    },
    {
      name: "Defense Evasion",
      code: "TA0005",
      techniques: [
        { id: "T1070.001", name: "Clear Windows Event Logs", count: 3, status: "CRITICAL", desc: "Event ID 1102 / 104 generated when audit log cleared." },
        { id: "T1027", name: "Obfuscated Command", count: 6, status: "ALERT", desc: "Command line arguments encoded in Base64 or XOR obfuscation." }
      ]
    },
    {
      name: "Credential Access",
      code: "TA0006",
      techniques: [
        { id: "T1110.001", name: "Password Guessing", count: 14, status: "CRITICAL", desc: "Brute force failed logons detected on RDP / SMB endpoints." },
        { id: "T1003", name: "OS Credential Dumping", count: 1, status: "ALERT", desc: "Accessing LSASS process memory to dump NTLM hashes." }
      ]
    },
    {
      name: "Command & Control",
      code: "TA0011",
      techniques: [
        { id: "T1071.001", name: "Web Protocols (HTTP/S)", count: 22, status: "MONITORED", desc: "Beaconing outbound traffic over SSL port 443 to external C2 IPs." },
        { id: "T1571", name: "Non-Standard Port", count: 2, status: "ALERT", desc: "Listening sockets bound to non-standard high ports like 4444 or 8888." }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-100 flex items-center gap-2 text-lg">
            <Grid className="w-5 h-5 text-cyan-400" />
            MITRE ATT&CK Enterprise Matrix Coverage
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Real-time mapping of ingested security logs and active threat detection rules to MITRE ATT&CK tactics & techniques.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span> Critical Alert
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span> Active Threat
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Monitored
          </span>
        </div>
      </div>

      {/* MITRE Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {TACTICS.map((tactic) => (
          <div key={tactic.code} className="glass-panel rounded-xl overflow-hidden flex flex-col">
            
            {/* Tactic Column Header */}
            <div className="bg-slate-900/90 p-3 border-b border-white/10 text-center">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">{tactic.code}</span>
              <h4 className="font-mono font-bold text-xs text-slate-200 mt-0.5">{tactic.name}</h4>
            </div>

            {/* Techniques List */}
            <div className="p-2 space-y-2 flex-1">
              {tactic.techniques.map((tech) => {
                const isCritical = tech.status === 'CRITICAL';
                const isAlert = tech.status === 'ALERT';

                return (
                  <div
                    key={tech.id}
                    onClick={() => setSelectedTechnique(tech)}
                    className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all duration-150 font-mono text-xs ${
                      isCritical
                        ? 'bg-rose-500/15 border-rose-500/40 hover:bg-rose-500/25 glow-red'
                        : isAlert
                        ? 'bg-amber-500/15 border-amber-500/40 hover:bg-amber-500/25'
                        : 'bg-slate-900/60 border-white/5 hover:border-cyan-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-bold">{tech.id}</span>
                      {tech.count > 0 && (
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          isCritical ? 'bg-rose-500 text-black' : isAlert ? 'bg-amber-500 text-black' : 'bg-cyan-500/20 text-cyan-400'
                        }`}>
                          {tech.count}
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-slate-200 mt-1 line-clamp-1">{tech.name}</p>
                  </div>
                );
              })}
            </div>

          </div>
        ))}
      </div>

      {/* Selected Technique Detail Drawer */}
      {selectedTechnique && (
        <div className="glass-panel rounded-xl p-5 border-l-4 border-l-cyan-400 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 font-mono">
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 text-xs font-bold border border-cyan-500/40">
                {selectedTechnique.id}
              </span>
              <h3 className="font-bold text-slate-100 text-base">{selectedTechnique.name}</h3>
            </div>
            <button 
              onClick={() => setSelectedTechnique(null)}
              className="text-xs font-mono text-slate-400 hover:text-slate-200"
            >
              Close Details ✕
            </button>
          </div>
          <p className="text-xs text-slate-300 font-mono mt-2">{selectedTechnique.desc}</p>
          <div className="mt-4 flex items-center gap-4 text-xs font-mono">
            <span className="text-slate-400">Current Status: <strong className="text-amber-400">{selectedTechnique.status}</strong></span>
            <span className="text-slate-400">Triggered Detections: <strong className="text-cyan-400">{selectedTechnique.count} Events</strong></span>
          </div>
        </div>
      )}

    </div>
  );
}
