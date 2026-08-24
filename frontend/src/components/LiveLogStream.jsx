import React, { useState } from 'react';
import { Search, Pause, Play, Download, Filter, Terminal, Copy, Check, ChevronRight, X } from 'lucide-react';

export default function LiveLogStream({ logs, isPaused, setIsPaused }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState(null);
  const [copied, setCopied] = useState(false);

  const filteredLogs = logs.filter(log => {
    const matchesSev = severityFilter === 'ALL' || log.severity === severityFilter;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesSev;

    const matchesQuery = 
      String(log.event_id).includes(q) ||
      log.message.toLowerCase().includes(q) ||
      log.user.toLowerCase().includes(q) ||
      log.process.toLowerCase().includes(q) ||
      log.mitre_id.toLowerCase().includes(q);

    return matchesSev && matchesQuery;
  });

  const handleCopyJson = () => {
    if (selectedLog) {
      navigator.clipboard.writeText(JSON.stringify(selectedLog, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `siem_logs_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-4">
      
      {/* Workbench Search & Control Toolbar */}
      <div className="glass-panel rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* KQL Search Bar */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search logs e.g. 4625, powershell, T1110..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-900/90 border border-white/10 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 placeholder:text-slate-500 transition-all"
          />
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          
          {/* Severity Dropdown */}
          <div className="flex items-center gap-1 bg-slate-900/90 border border-white/10 rounded-lg px-2 py-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-transparent text-xs font-mono text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All Severities</option>
              <option value="CRITICAL" className="bg-slate-900 text-rose-400">CRITICAL</option>
              <option value="HIGH" className="bg-slate-900 text-amber-400">HIGH</option>
              <option value="MEDIUM" className="bg-slate-900 text-cyan-400">MEDIUM</option>
              <option value="INFORMATIONAL" className="bg-slate-900 text-emerald-400">INFORMATIONAL</option>
            </select>
          </div>

          {/* Stream Pause/Play */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
              isPaused 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40 glow-green'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/40'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            {isPaused ? 'RESUME STREAM' : 'PAUSE STREAM'}
          </button>

          {/* Export JSON */}
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-mono transition-all"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            Export JSON
          </button>

        </div>

      </div>

      {/* Log Count & Live Indicator */}
      <div className="flex items-center justify-between text-xs font-mono px-2 text-slate-400">
        <div>
          Showing <span className="text-cyan-400 font-bold">{filteredLogs.length}</span> of {logs.length} captured events
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-ping'}`}></span>
          <span>{isPaused ? 'STREAM PAUSED' : 'LIVE STREAM ACTIVE'}</span>
        </div>
      </div>

      {/* SIEM Log Grid */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Event ID</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Process</th>
                <th className="py-3 px-4">MITRE</th>
                <th className="py-3 px-4">Payload Message</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-500 font-mono">
                    No security events match the active search/filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => (
                  <tr 
                    key={idx}
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-cyan-500/5 transition-colors cursor-pointer group"
                  >
                    <td className="py-2.5 px-4 whitespace-nowrap text-slate-400">{log.timestamp}</td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                        log.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                        log.severity === 'MEDIUM' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-bold text-cyan-400 whitespace-nowrap">ID: {log.event_id}</td>
                    <td className="py-2.5 px-4 whitespace-nowrap text-slate-300">{log.category}</td>
                    <td className="py-2.5 px-4 whitespace-nowrap text-slate-200">{log.user}</td>
                    <td className="py-2.5 px-4 whitespace-nowrap text-purple-400">{log.process}</td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 text-purple-300 border border-purple-500/30 text-[10px]">
                        {log.mitre_id}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 max-w-xs truncate text-slate-300">{log.message}</td>
                    <td className="py-2.5 px-4 text-right">
                      <button className="p-1 rounded hover:bg-slate-800 text-slate-400 group-hover:text-cyan-400 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Detail Drawer Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl w-full max-w-2xl overflow-hidden border border-white/20 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/90">
              <div className="flex items-center gap-3">
                <Terminal className="w-5 h-5 text-cyan-400" />
                <h3 className="font-mono font-bold text-slate-100">
                  Event ID {selectedLog.event_id} - Payload Inspector
                </h3>
              </div>
              <button 
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              
              <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                <div className="p-3 rounded-lg bg-slate-900/80 border border-white/5">
                  <span className="text-slate-400 block text-[10px] uppercase">Timestamp</span>
                  <span className="text-slate-100 font-bold">{selectedLog.timestamp}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/80 border border-white/5">
                  <span className="text-slate-400 block text-[10px] uppercase">Provider / Log Name</span>
                  <span className="text-cyan-400 font-bold">{selectedLog.provider}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/80 border border-white/5">
                  <span className="text-slate-400 block text-[10px] uppercase">Target Host</span>
                  <span className="text-slate-100">{selectedLog.hostname} ({selectedLog.ip})</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/80 border border-white/5">
                  <span className="text-slate-400 block text-[10px] uppercase">MITRE ATT&CK Technique</span>
                  <span className="text-purple-400 font-bold">{selectedLog.mitre_id}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 mb-1 block">Formatted Raw Security JSON</label>
                <pre className="p-4 rounded-xl bg-[#050811] border border-white/10 text-xs font-mono text-cyan-300 overflow-x-auto">
                  {JSON.stringify(selectedLog, null, 2)}
                </pre>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 bg-slate-900/90 flex items-center justify-between">
              <button
                onClick={handleCopyJson}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-mono transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied to Clipboard!' : 'Copy JSON Payload'}
              </button>

              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono"
              >
                Close Inspector
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
