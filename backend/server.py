import asyncio
import json
import random
import time
import os
from typing import List, Dict, Any
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
import psutil

app = FastAPI(title="AegisSOC Multi-Node SIEM Engine API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connection Manager for WebSockets
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

# In-Memory Fleet Stores
REGISTERED_AGENTS: Dict[str, Dict[str, Any]] = {
    "AGENT-DESKTOP-SOC-01": {
        "agent_id": "AGENT-DESKTOP-SOC-01",
        "hostname": "DESKTOP-SOC-01",
        "ip_address": "192.168.1.15",
        "os": "win32",
        "status": "ONLINE",
        "last_seen": time.time(),
        "event_count": 412
    },
    "AGENT-LAPTOP-OFFICE-02": {
        "agent_id": "AGENT-LAPTOP-OFFICE-02",
        "hostname": "LAPTOP-OFFICE-02",
        "ip_address": "192.168.1.108",
        "os": "win32",
        "status": "ONLINE",
        "last_seen": time.time() - 10,
        "event_count": 289
    },
    "AGENT-SERVER-PROD-03": {
        "agent_id": "AGENT-SERVER-PROD-03",
        "hostname": "SERVER-PROD-03",
        "ip_address": "192.168.1.200",
        "os": "linux",
        "status": "ONLINE",
        "last_seen": time.time() - 5,
        "event_count": 890
    }
}

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
        "description": "powershell.exe executed with -EncodedCommand flag pointing to suspect C2 script.",
        "event_id": 4688,
        "affected_process": "powershell.exe",
        "pid": 4120
    },
    {
        "id": "INC-8941",
        "title": "Lateral Movement & RDP Brute Force",
        "severity": "HIGH",
        "category": "Credential Access",
        "mitre_id": "T1110.001",
        "mitre_name": "Password Guessing",
        "hostname": "LAPTOP-OFFICE-02",
        "user": "Administrator",
        "status": "IN_PROGRESS",
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(time.time() - 300)),
        "description": "Over 15 failed logon events detected in 60s from LAPTOP-OFFICE-02 (192.168.1.108).",
        "event_id": 4625,
        "affected_process": "lsass.exe",
        "pid": 672
    }
]

SIGMA_RULES = [
    { "id": "RULE-01", "name": "Encoded PowerShell Command Execution", "severity": "CRITICAL", "mitre": "T1059.001", "enabled": True, "query": "process.name: powershell.exe AND process.command_line: *-enc*" },
    { "id": "RULE-02", "name": "Windows Audit Log Cleared", "severity": "HIGH", "mitre": "T1070.001", "enabled": True, "query": "event.id: 1102 OR event.id: 104" },
    { "id": "RULE-03", "name": "RDP Multi-Node Brute Force", "severity": "HIGH", "mitre": "T1110", "enabled": True, "query": "event.id: 4625 COUNT > 10 IN 60s" },
    { "id": "RULE-04", "name": "Unusual Reverse Shell Port Listener", "severity": "MEDIUM", "mitre": "T1571", "enabled": True, "query": "network.port: (4444 OR 5555) AND process.name != known" }
]

LOG_HISTORY = []

def generate_sample_event(target_host=None):
    hosts = [
        {"name": "DESKTOP-SOC-01", "ip": "192.168.1.15"},
        {"name": "LAPTOP-OFFICE-02", "ip": "192.168.1.108"},
        {"name": "SERVER-PROD-03", "ip": "192.168.1.200"}
    ]
    h = random.choice(hosts) if not target_host else {"name": target_host, "ip": "192.168.1.50"}

    event_templates = [
        {"id": 4624, "provider": "Security", "severity": "INFORMATIONAL", "cat": "Logon", "msg": "An account was successfully logged on", "user": "madih", "proc": "svchost.exe", "mitre": "T1078"},
        {"id": 4625, "provider": "Security", "severity": "HIGH", "cat": "Logon Failure", "msg": "Failed logon attempt via Remote Desktop (RDP)", "user": "Administrator", "proc": "lsass.exe", "mitre": "T1110"},
        {"id": 4688, "provider": "Security", "severity": "MEDIUM", "cat": "Process Creation", "msg": "New process created (cmd.exe /c whoami)", "user": "SYSTEM", "proc": "cmd.exe", "mitre": "T1059"},
        {"id": 4688, "provider": "Security", "severity": "CRITICAL", "cat": "Process Creation", "msg": "powershell.exe -Enc SQBFA... [Obfuscated Stager]", "user": "SYSTEM", "proc": "powershell.exe", "mitre": "T1059.001"},
        {"id": 1102, "provider": "Security", "severity": "HIGH", "cat": "Audit Log Cleared", "msg": "Security Audit Log was cleared by Administrator", "user": "Administrator", "proc": "eventvwr.exe", "mitre": "T1070.001"}
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
        "hostname": h["name"],
        "ip": h["ip"]
    }

@app.get("/", response_class=HTMLResponse)
@app.get("/dashboard", response_class=HTMLResponse)
def get_dashboard_html():
    p1 = os.path.abspath("../standalone_dashboard.html")
    p2 = os.path.abspath("standalone_dashboard.html")
    p3 = os.path.abspath("C:/Users/madih/.gemini/antigravity/scratch/siem-soc-dashboard/standalone_dashboard.html")
    
    target_path = p1 if os.path.exists(p1) else p2 if os.path.exists(p2) else p3
    with open(target_path, "r", encoding="utf-8") as f:
        return f.read()

class AgentRegistration(BaseModel):
    agent_id: str
    hostname: str
    ip_address: str
    os: str
    cpu_cores: int
    ram_gb: float

@app.post("/api/agent/register")
def register_agent(data: AgentRegistration):
    REGISTERED_AGENTS[data.agent_id] = {
        "agent_id": data.agent_id,
        "hostname": data.hostname,
        "ip_address": data.ip_address,
        "os": data.os,
        "status": "ONLINE",
        "last_seen": time.time(),
        "event_count": 0
    }
    return {"success": True, "message": f"Agent {data.hostname} registered successfully!"}

class AgentTelemetry(BaseModel):
    agent_id: str
    hostname: str
    ip_address: str
    cpu_percent: float
    memory_percent: float
    process_count: int
    timestamp: str
    event: Dict[str, Any]

@app.post("/api/agent/ingest")
async def ingest_agent_telemetry(data: AgentTelemetry):
    if data.agent_id not in REGISTERED_AGENTS:
        REGISTERED_AGENTS[data.agent_id] = {
            "agent_id": data.agent_id,
            "hostname": data.hostname,
            "ip_address": data.ip_address,
            "os": "win32",
            "status": "ONLINE",
            "last_seen": time.time(),
            "event_count": 1
        }
    else:
        REGISTERED_AGENTS[data.agent_id]["last_seen"] = time.time()
        REGISTERED_AGENTS[data.agent_id]["status"] = "ONLINE"
        REGISTERED_AGENTS[data.agent_id]["event_count"] += 1

    evt = data.event
    LOG_HISTORY.append(evt)
    if len(LOG_HISTORY) > 500:
        LOG_HISTORY.pop(0)

    # Broadcast over WebSockets to Dashboard
    await manager.broadcast({
        "cpu_percent": data.cpu_percent,
        "memory_percent": data.memory_percent,
        "process_count": data.process_count,
        "eps": random.randint(180, 340),
        "active_node": data.hostname,
        "event": evt
    })

    return {"success": True, "ingested_id": evt.get("event_id")}

@app.get("/api/fleet/nodes")
def get_fleet_nodes():
    now = time.time()
    for ag in REGISTERED_AGENTS.values():
        if now - ag["last_seen"] > 25:
            ag["status"] = "OFFLINE"
    return list(REGISTERED_AGENTS.values())

@app.get("/api/incidents")
def get_incidents():
    return INCIDENTS

@app.get("/api/rules")
def get_rules():
    return SIGMA_RULES

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
                "eps": random.randint(180, 380),
                "active_fleet_nodes": len(REGISTERED_AGENTS),
                "event": evt
            }
            await websocket.send_json(telemetry)
            await asyncio.sleep(1.2)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
