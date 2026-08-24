// SIEM Service managing WebSockets & REST connection + Client Fallback Engine

let ws = null;
let listeners = [];
let isConnected = false;

const MOCK_EVENTS = [
  { id: 4624, provider: "Security", severity: "INFORMATIONAL", category: "Logon", message: "An account was successfully logged on (User: madih)", user: "madih", process: "svchost.exe", mitre_id: "T1078", hostname: "DESKTOP-SOC-01", ip: "192.168.1.15" },
  { id: 4625, provider: "Security", severity: "HIGH", category: "Logon Failure", message: "An account failed to log on (User: Administrator)", user: "Administrator", process: "lsass.exe", mitre_id: "T1110", hostname: "DESKTOP-SOC-01", ip: "192.168.1.108" },
  { id: 4688, provider: "Security", severity: "MEDIUM", category: "Process Creation", message: "New process created: cmd.exe /c powershell -nop -w hidden", user: "SYSTEM", process: "cmd.exe", mitre_id: "T1059", hostname: "DESKTOP-SOC-01", ip: "192.168.1.15" },
  { id: 4688, provider: "Security", severity: "CRITICAL", category: "Process Creation", message: "powershell.exe -Enc SQBFA... [Obfuscated C2 Stager]", user: "SYSTEM", process: "powershell.exe", mitre_id: "T1059.001", hostname: "DESKTOP-SOC-01", ip: "192.168.1.15" },
  { id: 5156, provider: "Filtering Platform", severity: "INFORMATIONAL", category: "Network", message: "WFP allowed outbound connection to 142.250.190.46:443", user: "madih", process: "chrome.exe", mitre_id: "T1071", hostname: "DESKTOP-SOC-01", ip: "192.168.1.15" },
  { id: 1102, provider: "Security", severity: "HIGH", category: "Audit Log Cleared", message: "The security audit log was cleared by Administrator", user: "Administrator", process: "eventvwr.exe", mitre_id: "T1070.001", hostname: "DESKTOP-SOC-01", ip: "192.168.1.15" },
  { id: 7045, provider: "System", severity: "MEDIUM", category: "Service Creation", message: "A new service was installed: TargetDriver.sys", user: "SYSTEM", process: "services.exe", mitre_id: "T1543.003", hostname: "DESKTOP-SOC-01", ip: "192.168.1.15" }
];

let mockInterval = null;

export function connectTelemetry(onMessage, onStatusChange) {
  listeners.push(onMessage);

  try {
    ws = new WebSocket("ws://localhost:8000/ws/telemetry");

    ws.onopen = () => {
      isConnected = true;
      if (onStatusChange) onStatusChange(true);
      if (mockInterval) clearInterval(mockInterval);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        listeners.forEach(cb => cb(data));
      } catch (err) {
        console.error("WS Parse error", err);
      }
    };

    ws.onerror = () => {
      startMockFallback(onStatusChange);
    };

    ws.onclose = () => {
      isConnected = false;
      if (onStatusChange) onStatusChange(false);
      startMockFallback(onStatusChange);
    };
  } catch (e) {
    startMockFallback(onStatusChange);
  }

  return () => {
    listeners = listeners.filter(cb => cb !== onMessage);
    if (listeners.length === 0 && ws) {
      ws.close();
      if (mockInterval) clearInterval(mockInterval);
    }
  };
}

function startMockFallback(onStatusChange) {
  if (mockInterval) return;
  if (onStatusChange) onStatusChange(false); // Indicates standalone/demo mode

  mockInterval = setInterval(() => {
    const rawEvt = MOCK_EVENTS[Math.floor(Math.random() * MOCK_EVENTS.length)];
    const evt = {
      ...rawEvt,
      timestamp: new Date().toLocaleTimeString(),
      ip: `192.168.1.${Math.floor(Math.random() * 200) + 10}`
    };

    const telemetry = {
      cpu_percent: Math.floor(Math.random() * 35) + 15,
      memory_percent: 48 + Math.floor(Math.random() * 8),
      process_count: 184 + Math.floor(Math.random() * 10),
      eps: Math.floor(Math.random() * 150) + 120,
      event: evt
    };

    listeners.forEach(cb => cb(telemetry));
  }, 1200);
}
