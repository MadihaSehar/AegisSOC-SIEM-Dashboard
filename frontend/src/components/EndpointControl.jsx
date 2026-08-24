import React, { useState } from 'react';
import { Server, ShieldAlert, Cpu, HardDrive, Zap, RefreshCw, AlertOctagon, Terminal } from 'lucide-react';

export default function EndpointControl() {
  const [processes, setProcesses] = useState([
    { pid: 4120, name: "powershell.exe", cpu: 14.2, memory: 88, user: "SYSTEM", path: "C:\\Windows\\System32\\powershell.exe", status: "SUSPICIOUS" },
    { pid: 672, name: "lsass.exe", cpu: 1.1, memory: 45, user: "SYSTEM", path: "C:\\Windows\\System32\\lsass.exe", status: "MONITORED" },
    { pid: 1420, name: "svchost.exe", cpu: 0.4, memory: 120, user: "NETWORK SERVICE", path: "C:\\Windows\\System32\\svchost.exe", status: "NORMAL" },
    { pid: 3204, name: "chrome.exe", cpu: 8.5, memory: 410, user: "madih", path: "C:\\Program Files\\Google\\Chrome\\chrome.exe", status: "NORMAL" },
    { pid: 5890, name: "cmd.exe", cpu: 0.0, memory: 18, user: "madih", path: "C:\\Windows\\System32\\cmd.exe", status: "MONITORED" }
  ]);

  const [sockets] = useState([
    { port: 443, proto: "TCP", remote: "142.250.190.46:443", process: "chrome.exe", status: "ESTABLISHED" },
    { port: 4444, proto: "TCP", remote: "0.0.0.0:4444", process: "powershell.exe", status: "LISTENING" },
    { port: 135, proto: "TCP", remote: "0.0.0.0:135", process: "svchost.exe", status: "LISTENING" }
  ]);

  const [notice, setNotice] = useState(null);

  const killProcess = (pid, name) => {
    setProcesses(prev => prev.filter(p => p.pid !== pid));
    setNotice(`PID ${pid} (${name}) forcibly terminated by SOC analyst.`);
    setTimeout(() => setNotice(null), 3500);
  };

  const triggerAction = (actionName) => {
    setNotice(`SOC Command executed: [${actionName}] on DESKTOP-SOC-01. Operation complete.`);
    setTimeout(() => setNotice(null), 3500);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Toolbar */}
      <div className="glass-panel rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-100 flex items-center gap-2 text-lg">
            <Server className="w-5 h-5 text-cyan-400" />
            Endpoint Control & Telemetry Manager
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Host: <strong className="text-cyan-400">DESKTOP-SOC-01</strong> | Windows System Process Inspection & Containment Controls
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <button
            onClick={() => triggerAction('Isolate Host Network')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 glow-red transition-all"
          >
            <ShieldAlert className="w-4 h-4" /> Network Isolation
          </button>
          <button
            onClick={() => triggerAction('Vulnerability Scan')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Run Quick Scan
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notice && (
        <div className="p-4 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono text-xs flex items-center gap-2 glow-cyan animate-in fade-in">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span>{notice}</span>
        </div>
      )}

      {/* Main Grid: Active Processes & Network Sockets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Running Processes Table */}
        <div className="lg:col-span-2 glass-panel rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-100 flex items-center gap-2 font-mono text-sm">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Active System Processes ({processes.length})
            </h4>
            <span className="text-xs font-mono text-slate-400">Collector: psutil</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-2.5 px-3">PID</th>
                  <th className="py-2.5 px-3">Process Name</th>
                  <th className="py-2.5 px-3">CPU %</th>
                  <th className="py-2.5 px-3">RAM (MB)</th>
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">Risk Level</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {processes.map((proc) => (
                  <tr key={proc.pid} className="hover:bg-cyan-500/5 transition-colors">
                    <td className="py-2.5 px-3 text-cyan-400 font-bold">{proc.pid}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-100">{proc.name}</td>
                    <td className="py-2.5 px-3">{proc.cpu}%</td>
                    <td className="py-2.5 px-3">{proc.memory} MB</td>
                    <td className="py-2.5 px-3 text-slate-400">{proc.user}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        proc.status === 'SUSPICIOUS' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                        proc.status === 'MONITORED' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                        'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {proc.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => killProcess(proc.pid, proc.name)}
                        className="px-2 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 text-[10px] transition-all"
                      >
                        Kill Process
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Active Network Sockets */}
        <div className="glass-panel rounded-xl p-5 space-y-4">
          <h4 className="font-bold text-slate-100 flex items-center gap-2 font-mono text-sm">
            <HardDrive className="w-4 h-4 text-purple-400" />
            Active Listening Sockets
          </h4>

          <div className="space-y-3">
            {sockets.map((sock, i) => (
              <div key={i} className="p-3 rounded-lg bg-slate-900/80 border border-white/5 font-mono text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-cyan-400 font-bold">Port {sock.port} ({sock.proto})</span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    sock.status === 'LISTENING' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {sock.status}
                  </span>
                </div>
                <div className="text-slate-300">Remote: <span className="text-slate-100">{sock.remote}</span></div>
                <div className="text-purple-400 text-[11px]">Process: {sock.process}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
