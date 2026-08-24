import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CommandCenter from './components/CommandCenter';
import LiveLogStream from './components/LiveLogStream';
import MitreMatrix from './components/MitreMatrix';
import IncidentManager from './components/IncidentManager';
import RuleEngineView from './components/RuleEngineView';
import EndpointControl from './components/EndpointControl';
import { connectTelemetry } from './services/siemService';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLiveApi, setIsLiveApi] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [telemetry, setTelemetry] = useState({
    cpu_percent: 24,
    memory_percent: 52,
    process_count: 188,
    eps: 215,
    health_score: 85
  });

  const [logs, setLogs] = useState([]);
  const [incidents, setIncidents] = useState([
    {
      id: "INC-8942",
      title: "Possible PowerShell Encoded Execution",
      severity: "CRITICAL",
      category: "Execution",
      mitre_id: "T1059.001",
      mitre_name: "PowerShell",
      hostname: "DESKTOP-SOC-01",
      user: "NT AUTHORITY\\SYSTEM",
      status: "NEW",
      timestamp: new Date().toLocaleTimeString(),
      description: "powershell.exe executed with -e / -EncodedCommand flag pointing to suspect C2 script.",
      event_id: 4688,
      affected_process: "powershell.exe",
      pid: 4120
    },
    {
      id: "INC-8941",
      title: "Multiple Failed RDP Logon Attempts (Brute Force)",
      severity: "HIGH",
      category: "Credential Access",
      mitre_id: "T1110.001",
      mitre_name: "Password Guessing",
      hostname: "DESKTOP-SOC-01",
      user: "Administrator",
      status: "IN_PROGRESS",
      timestamp: new Date(Date.now() - 300000).toLocaleTimeString(),
      description: "Over 15 failed logon events detected in 60 seconds from IP 192.168.1.108.",
      event_id: 4625,
      affected_process: "lsass.exe",
      pid: 672
    }
  ]);

  useEffect(() => {
    const cleanup = connectTelemetry(
      (data) => {
        if (data.cpu_percent !== undefined) {
          setTelemetry(prev => ({
            ...prev,
            cpu_percent: data.cpu_percent,
            memory_percent: data.memory_percent || prev.memory_percent,
            process_count: data.process_count || prev.process_count,
            eps: data.eps || prev.eps,
            health_score: Math.max(20, 100 - (incidents.filter(i => i.status !== 'RESOLVED').length * 15))
          }));
        }

        if (data.event && !isPaused) {
          setLogs(prev => [data.event, ...prev].slice(0, 300));
        }
      },
      (status) => {
        setIsLiveApi(status);
      }
    );

    return () => cleanup();
  }, [isPaused, incidents]);

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      
      {/* Top Navigation */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isLiveApi={isLiveApi}
        systemHealth={telemetry.health_score}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6">
        {activeTab === 'overview' && (
          <CommandCenter 
            telemetry={telemetry} 
            recentEvents={logs} 
            incidents={incidents}
            onSelectTab={setActiveTab}
          />
        )}

        {activeTab === 'logs' && (
          <LiveLogStream 
            logs={logs} 
            isPaused={isPaused} 
            setIsPaused={setIsPaused} 
          />
        )}

        {activeTab === 'mitre' && (
          <MitreMatrix />
        )}

        {activeTab === 'incidents' && (
          <IncidentManager 
            incidents={incidents} 
            setIncidents={setIncidents} 
          />
        )}

        {activeTab === 'rules' && (
          <RuleEngineView />
        )}

        {activeTab === 'endpoint' && (
          <EndpointControl />
        )}
      </main>

      {/* Footer Status Bar */}
      <footer className="border-t border-white/10 bg-[#050811] px-4 lg:px-8 py-3 text-xs font-mono text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-4">
          <span className="text-slate-300">AEGIS SIEM SOC Engine v1.0.0</span>
          <span>•</span>
          <span className="text-cyan-400">Target Host: DESKTOP-SOC-01</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Engine Status: <strong className="text-emerald-400">OPERATIONAL</strong></span>
          <span>•</span>
          <span>Total Ingested: <strong className="text-cyan-400">{logs.length} events</strong></span>
        </div>
      </footer>

    </div>
  );
}
