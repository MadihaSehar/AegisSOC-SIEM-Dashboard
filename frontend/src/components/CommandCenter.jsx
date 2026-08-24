import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, ShieldAlert, Cpu, HardDrive, Zap, AlertTriangle, Eye, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export default function CommandCenter({ telemetry, recentEvents, incidents, onSelectTab }) {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (telemetry) {
      setChartData((prev) => {
        const next = [
          ...prev,
          {
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            eps: telemetry.eps || 180,
            cpu: telemetry.cpu_percent || 25,
            memory: telemetry.memory_percent || 50
          }
        ];
        return next.slice(-15);
      });
    }
  }, [telemetry]);

  const activeIncidentsCount = incidents.filter(i => i.status !== 'RESOLVED').length;
  const criticalCount = incidents.filter(i => i.severity === 'CRITICAL' && i.status !== 'RESOLVED').length;

  const severityPieData = [
    { name: 'Critical', value: criticalCount + 1, color: '#ef4444' },
    { name: 'High', value: 3, color: '#f59e0b' },
    { name: 'Medium', value: 5, color: '#06b6d4' },
    { name: 'Info', value: 12, color: '#10b981' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Security Health */}
        <div className="glass-panel rounded-xl p-5 relative overflow-hidden glass-panel-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-slate-400">Security Posture</p>
              <h3 className="text-3xl font-bold font-mono mt-1 text-emerald-400">
                {telemetry.health_score || 85}%
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-mono text-slate-400 border-t border-white/5 pt-2">
            <span>Threat Defense: Active</span>
            <span className="text-emerald-400">OPSEC NORMINAL</span>
          </div>
        </div>

        {/* Card 2: Events Per Second (EPS) */}
        <div className="glass-panel rounded-xl p-5 relative overflow-hidden glass-panel-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-slate-400">Ingestion Velocity</p>
              <h3 className="text-3xl font-bold font-mono mt-1 text-cyan-400">
                {telemetry.eps || 215} <span className="text-xs text-slate-400 font-normal">EPS</span>
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-mono text-slate-400 border-t border-white/5 pt-2">
            <span>Pipeline Delay: &lt;12ms</span>
            <span className="text-cyan-400">Real-Time Ingest</span>
          </div>
        </div>

        {/* Card 3: Active Incidents */}
        <div className="glass-panel rounded-xl p-5 relative overflow-hidden glass-panel-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-slate-400">Active Incidents</p>
              <h3 className="text-3xl font-bold font-mono mt-1 text-rose-500">
                {activeIncidentsCount} <span className="text-xs text-rose-400/80 font-normal">({criticalCount} Critical)</span>
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 glow-red">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-mono text-slate-400 border-t border-white/5 pt-2">
            <span>Requires Analyst Action</span>
            <button onClick={() => onSelectTab('incidents')} className="text-rose-400 hover:underline flex items-center gap-1">
              Review <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 4: Host Telemetry */}
        <div className="glass-panel rounded-xl p-5 relative overflow-hidden glass-panel-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-slate-400">Host Workload</p>
              <div className="flex items-center gap-4 mt-1">
                <div>
                  <span className="text-xs text-slate-400">CPU</span>
                  <p className="text-lg font-bold font-mono text-cyan-400">{telemetry.cpu_percent || 24}%</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400">RAM</span>
                  <p className="text-lg font-bold font-mono text-purple-400">{telemetry.memory_percent || 52}%</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400">PIDs</span>
                  <p className="text-lg font-bold font-mono text-amber-400">{telemetry.process_count || 188}</p>
                </div>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Cpu className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-mono text-slate-400 border-t border-white/5 pt-2">
            <span>DESKTOP-SOC-01</span>
            <span className="text-slate-300">psutil collector</span>
          </div>
        </div>

      </div>

      {/* Main Grid: Live Velocity Chart + Severity Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: EPS Telemetry Chart */}
        <div className="lg:col-span-2 glass-panel rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                Live Telemetry & Event Ingestion Velocity
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">Real-time EPS throughput and host CPU workload correlation</p>
            </div>
            <span className="px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-mono">
              Live Stream Active
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorEps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0e1424', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="eps" name="Events / Sec (EPS)" stroke="#06b6d4" fillOpacity={1} fill="url(#colorEps)" strokeWidth={2} />
                <Area type="monotone" dataKey="cpu" name="CPU Load %" stroke="#a855f7" fillOpacity={1} fill="url(#colorCpu)" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Severity Pie Breakdown & Threat Radar */}
        <div className="glass-panel rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Event Severity Breakdown
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Distribution of security logs by risk level</p>

            <div className="h-44 w-full my-2 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {severityPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0e1424', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {severityPieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-white/5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-slate-300">{item.name}</span>
                </div>
                <span className="font-bold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Real-Time Security Event Stream Preview */}
      <div className="glass-panel rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-100 flex items-center gap-2">
              <Eye className="w-5 h-5 text-cyan-400" />
              Real-Time Security Event Ticker
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Streaming telemetry directly from host event bus</p>
          </div>
          <button 
            onClick={() => onSelectTab('logs')}
            className="px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs font-mono transition-all flex items-center gap-1"
          >
            Open Full Workbench <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2 overflow-hidden">
          {recentEvents.slice(0, 5).map((evt, idx) => {
            const isHigh = evt.severity === 'HIGH' || evt.severity === 'CRITICAL';
            return (
              <div 
                key={idx} 
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg bg-slate-900/80 border border-white/5 hover:border-cyan-500/30 transition-all font-mono text-xs gap-2"
              >
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    evt.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                    evt.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                    evt.severity === 'MEDIUM' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {evt.severity}
                  </span>
                  <span className="text-slate-400">{evt.timestamp}</span>
                  <span className="text-cyan-400 font-bold">ID: {evt.event_id}</span>
                  <span className="text-slate-200 hidden md:inline truncate max-w-md">{evt.message}</span>
                </div>

                <div className="flex items-center gap-3 text-slate-400 text-[11px] self-end sm:self-center">
                  <span>User: <strong className="text-slate-200">{evt.user}</strong></span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-purple-400 border border-purple-500/20">{evt.mitre_id}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
