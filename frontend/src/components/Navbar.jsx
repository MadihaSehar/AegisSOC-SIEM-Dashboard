import React, { useState, useEffect } from 'react';
import { Shield, Activity, Terminal, Grid, AlertTriangle, Sliders, Server, Cpu, RefreshCw } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, isLiveApi, systemHealth }) {
  const [timeStr, setTimeStr] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setTimeStr(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { id: 'overview', label: 'Command Center', icon: Activity },
    { id: 'logs', label: 'SIEM Live Logs', icon: Terminal },
    { id: 'mitre', label: 'MITRE ATT&CK', icon: Grid },
    { id: 'incidents', label: 'Incidents & Triage', icon: AlertTriangle },
    { id: 'rules', label: 'Sigma Rules', icon: Sliders },
    { id: 'endpoint', label: 'Endpoint Control', icon: Server },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#080d1a]/90 backdrop-blur-md border-b border-white/10 px-4 lg:px-8 py-3">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Brand Logo & Telemetry Indicator */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 glow-cyan">
              <Shield className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-wider text-white">AEGIS<span className="text-cyan-400">SOC</span></span>
                <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">SIEM v1.0</span>
              </div>
              <p className="text-xs text-slate-400 font-mono">Host: DESKTOP-SOC-01 | Win11 Pro</p>
            </div>
          </div>

          {/* Connection Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-white/10 text-xs font-mono">
            <span className={`w-2 h-2 rounded-full ${isLiveApi ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            <span className={isLiveApi ? 'text-emerald-400' : 'text-amber-400'}>
              {isLiveApi ? 'LIVE API CONNECTED' : 'STANDALONE ENGINE'}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                  active
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/40 glow-cyan'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-cyan-400' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* System Time & Security Health Indicator */}
        <div className="hidden xl:flex items-center gap-4 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-white/5">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Health Score:</span>
            <span className={`font-bold ${systemHealth >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {systemHealth}%
            </span>
          </div>
          <div className="bg-slate-900/60 px-3 py-1.5 rounded-lg border border-white/5 text-cyan-400 font-bold">
            {timeStr}
          </div>
        </div>

      </div>
    </header>
  );
}
