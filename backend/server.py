import asyncio
import json
import random
import time
from typing import List, Dict, Any
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psutil

app = FastAPI(title="SIEM SOC Engine API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Active WebSockets
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass

manager = ConnectionManager()

# In-Memory Store
INCIDENTS = [
    {
        "id": "INC-8942",
        "title": "Possible PowerShell Encoded Execution",
        "severity": "CRITICAL",
        "category": "Execution",
        "mitre_id": "T1059.001",
        "mitre_name": "PowerShell",
        "hostname": "DESKTOP-SOC-01",
        "user": "NT AUTHORITY\\SYSTEM",
        "status": "NEW",
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "description": "powershell.exe executed with -e / -EncodedCommand flag pointing to suspect C2 script.",
        "event_id": 4688,
        "affected_process": "powershell.exe",
        "pid": 4120
    },
    {
        "id": "INC-8941",
        "title": "Multiple Failed RDP Logon Attempts (Brute Force)",
        "severity": "HIGH",
        "category": "Credential Access",
        "mitre_id": "T1110.001",
        "mitre_name": "Password Guessing",
        "hostname": "DESKTOP-SOC-01",
        "user": "Administrator",
        "status": "IN_PROGRESS",
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(time.time() - 300)),
        "description": "Over 15 failed logon events detected in 60 seconds from IP 192.168.1.105.",
        "event_id": 4625,
        "affected_process": "lsass.exe",
        "pid": 672
    }
]

SIGMA_RULES = [
    {
        "id": "RULE-01",
        "name": "Encoded PowerShell Command Detection",
        "severity": "CRITICAL",
        "mitre": "T1059.001",
        "enabled": True,
        "query": "process.name: powershell.exe AND process.command_line: *-enc*",
        "description": "Detects obfuscated PowerShell executions commonly used in initial stagers."
    },
    {
        "id": "RULE-02",
        "name": "Windows Audit Log Cleared",
        "severity": "HIGH",
        "mitre": "T1070.001",
        "enabled": True,
        "query": "event.id: 1102 OR event.id: 104",
        "description": "Detects clearing of Windows Security or System Event Log to hide adversary activity."
    },
    {
        "id": "RULE-03",
        "name": "RDP Brute Force Attempt",
        "severity": "HIGH",
        "mitre": "T1110",
        "enabled": True,
        "query": "event.id: 4625 COUNT > 10 IN 60s",
        "description": "Detects high frequency failed logon events."
    },
    {
        "id": "RULE-04",
        "name": "Unusual Listening Network Socket",
        "severity": "MEDIUM",
        "mitre": "T1043",
        "enabled": True,
        "query": "network.port: (4444 OR 5555 OR 8888) AND process.name != known",
        "description": "Detects uncommon high port listeners associated with reverse shells."
    }
]

LOG_HISTORY = []

def generate_sample_event():
    event_templates = [
        {"id": 4624, "provider": "Security", "severity": "INFORMATIONAL", "cat": "Logon", "msg": "An account was successfully logged on", "user": "madih", "proc": "svchost.exe", "mitre": "T1078"},
        {"id": 4625, "provider": "Security", "severity": "HIGH", "cat": "Logon Failure", "msg": "An account failed to log on (Reason: Unknown User or Bad Password)", "user": "Administrator", "proc": "lsass.exe", "mitre": "T1110"},
        {"id": 4688, "provider": "Security", "severity": "MEDIUM", "cat": "Process Creation", "msg": "A new process has been created (cmd.exe /c whoami)", "user": "SYSTEM", "proc": "cmd.exe", "mitre": "T1059"},
        {"id": 4688, "provider": "Security", "severity": "CRITICAL", "cat": "Process Creation", "msg": "powershell.exe -NoP -NonI -W Hidden -Enc SQBFAFgA...", "user": "SYSTEM", "proc": "powershell.exe", "mitre": "T1059.001"},
        {"id": 5156, "provider": "Filtering Platform", "severity": "INFORMATIONAL", "cat": "Network", "msg": "The Windows Filtering Platform has allowed a connection to 142.250.190.46:443", "user": "madih", "proc": "chrome.exe", "mitre": "T1071"},
        {"id": 1102, "provider": "Security", "severity": "HIGH", "cat": "Audit Log Cleared", "msg": "The audit log was cleared by user Admin", "user": "Admin", "proc": "eventvwr.exe", "mitre": "T1070.001"},
        {"id": 7045, "provider": "System", "severity": "MEDIUM", "cat": "Service Creation", "msg": "A service was installed in the system: TargetService.sys", "user": "SYSTEM", "proc": "services.exe", "mitre": "T1543.003"}
    ]
    tpl = random.choice(event_templates)
    return {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "event_id": tpl["id"],
        "provider": tpl["provider"],
        "severity": tpl["severity"],
        "category": tpl["cat"],
        "message": tpl["msg"],
        "user": tpl["user"],
        "process": tpl["proc"],
        "mitre_id": tpl["mitre"],
        "hostname": "DESKTOP-SOC-01",
        "ip": f"192.168.1.{random.randint(10, 200)}"
    }

@app.get("/")
def read_root():
    return {"status": "online", "system": "SIEM SOC Engine v1.0", "time": time.time()}

@app.get("/api/telemetry")
def get_telemetry():
    cpu = psutil.cpu_percent(interval=None)
    memory = psutil.virtual_memory().percent
    disk = psutil.disk_usage('/').percent
    p_count = len(psutil.pids())
    return {
        "cpu_percent": cpu,
        "memory_percent": memory,
        "disk_percent": disk,
        "process_count": p_count,
        "eps": random.randint(140, 290),
        "health_score": max(20, 100 - (len([i for i in INCIDENTS if i["status"] != "RESOLVED"]) * 15)),
        "timestamp": time.strftime("%H:%M:%S")
    }

@app.get("/api/incidents")
def get_incidents():
    return INCIDENTS

class TriageRequest(BaseModel):
    incident_id: str
    status: str

@app.post("/api/incidents/triage")
def triage_incident(req: TriageRequest):
    for inc in INCIDENTS:
        if inc["id"] == req.incident_id:
            inc["status"] = req.status
            return {"success": True, "incident": inc}
    raise HTTPException(status_code=404, detail="Incident not found")

@app.get("/api/rules")
def get_rules():
    return SIGMA_RULES

class RuleToggle(BaseModel):
    rule_id: str
    enabled: bool

@app.post("/api/rules/toggle")
def toggle_rule(req: RuleToggle):
    for r in SIGMA_RULES:
        if r["id"] == req.rule_id:
            r["enabled"] = req.enabled
            return {"success": True, "rule": r}
    raise HTTPException(status_code=404, detail="Rule not found")

class ContainmentAction(BaseModel):
    action: str
    target: str

@app.post("/api/actions/contain")
def trigger_containment(req: ContainmentAction):
    return {
        "success": True,
        "action": req.action,
        "target": req.target,
        "message": f"Action '{req.action}' successfully executed against target '{req.target}'. Host isolated/process terminated.",
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    }

@app.websocket("/ws/telemetry")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            evt = generate_sample_event()
            LOG_HISTORY.append(evt)
            if len(LOG_HISTORY) > 500:
                LOG_HISTORY.pop(0)

            telemetry = {
                "cpu_percent": psutil.cpu_percent(interval=None),
                "memory_percent": psutil.virtual_memory().percent,
                "process_count": len(psutil.pids()),
                "eps": random.randint(120, 310),
                "event": evt
            }
            await websocket.send_json(telemetry)
            await asyncio.sleep(1.5)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
