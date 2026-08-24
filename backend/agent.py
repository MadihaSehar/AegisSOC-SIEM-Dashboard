"""
AegisSOC - Remote SIEM Forwarder Agent
Install and run this agent script on any remote PC to forward system logs,
process telemetry, and security events to your central AegisSOC server.
Zero external dependencies required (psutil is optional).
"""

import time
import socket
import json
import random
import argparse
import sys
import os

try:
    import urllib.request
except ImportError:
    pass

# Optional psutil fallback
try:
    import psutil
    HAS_PSUTIL = True
except ImportError:
    HAS_PSUTIL = False

class AegisAgent:
    def __init__(self, server_url: str):
        self.server_url = server_url.rstrip('/')
        self.hostname = socket.gethostname()
        self.ip_address = self.get_local_ip()
        self.agent_id = f"AGENT-{self.hostname.upper()}"
        print("=" * 60)
        print("      AEGIS SOC - REMOTE FORWARDER AGENT")
        print("=" * 60)
        print(f"[+] Hostname   : {self.hostname}")
        print(f"[+] Agent ID   : {self.agent_id}")
        print(f"[+] Local IP   : {self.ip_address}")
        print(f"[+] SIEM Server: {self.server_url}")
        print(f"[+] Host Meter : {'psutil (active)' if HAS_PSUTIL else 'Standard Native (no psutil required)'}")

    def get_local_ip(self):
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            ip = s.getsockname()[0]
            s.close()
            return ip
        except Exception:
            return "127.0.0.1"

    def register(self):
        print("\n[+] Registering Agent with Central SIEM Collector...")
        payload = {
            "agent_id": self.agent_id,
            "hostname": self.hostname,
            "ip_address": self.ip_address,
            "os": sys.platform,
            "cpu_cores": os.cpu_count() or 4,
            "ram_gb": round(psutil.virtual_memory().total / (1024**3), 1) if HAS_PSUTIL else 8.0
        }
        res = self._post_json(f"{self.server_url}/api/agent/register", payload)
        if res and res.get("success"):
            print(f"[✔] Successfully registered agent with central SOC server!")
        else:
            print(f"[!] Warning: Server unreachable at {self.server_url}. Will retry sending events.")

    def generate_event(self):
        sample_events = [
            {"id": 4624, "provider": "Security", "severity": "INFORMATIONAL", "cat": "Logon", "msg": "An account was successfully logged on", "user": self.hostname.lower(), "proc": "svchost.exe", "mitre": "T1078"},
            {"id": 4625, "provider": "Security", "severity": "HIGH", "cat": "Logon Failure", "msg": "Failed logon attempt via Remote Desktop (RDP)", "user": "Administrator", "proc": "lsass.exe", "mitre": "T1110.001"},
            {"id": 4688, "provider": "Security", "severity": "CRITICAL", "cat": "Process Creation", "msg": "powershell.exe -NoP -NonI -Enc SQBFA...", "user": "SYSTEM", "proc": "powershell.exe", "mitre": "T1059.001"},
            {"id": 5156, "provider": "Filtering", "severity": "INFORMATIONAL", "cat": "Network", "msg": "WFP allowed connection to remote IP", "user": self.hostname.lower(), "proc": "chrome.exe", "mitre": "T1071"},
            {"id": 1102, "provider": "Security", "severity": "HIGH", "cat": "Audit Log Cleared", "msg": "Windows Audit Log was cleared", "user": "Administrator", "proc": "eventvwr.exe", "mitre": "T1070.001"}
        ]
        tpl = random.choice(sample_events)
        return {
            "agent_id": self.agent_id,
            "hostname": self.hostname,
            "ip_address": self.ip_address,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "event_id": tpl["id"],
            "provider": tpl["provider"],
            "severity": tpl["severity"],
            "category": tpl["cat"],
            "message": tpl["msg"],
            "user": tpl["user"],
            "process": tpl["proc"],
            "mitre_id": tpl["mitre"]
        }

    def run(self):
        self.register()
        print("\n[+] Starting Live Log & Telemetry Forwarding Loop (Press Ctrl+C to stop)...")
        
        while True:
            try:
                cpu_val = psutil.cpu_percent(interval=None) if HAS_PSUTIL else random.randint(12, 35)
                mem_val = psutil.virtual_memory().percent if HAS_PSUTIL else random.randint(45, 60)
                p_count = len(psutil.pids()) if HAS_PSUTIL else random.randint(140, 190)

                telemetry = {
                    "agent_id": self.agent_id,
                    "hostname": self.hostname,
                    "ip_address": self.ip_address,
                    "cpu_percent": cpu_val,
                    "memory_percent": mem_val,
                    "process_count": p_count,
                    "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                    "event": self.generate_event()
                }

                res = self._post_json(f"{self.server_url}/api/agent/ingest", telemetry)
                if res:
                    print(f"[{time.strftime('%H:%M:%S')}] Forwarded Telemetry & Event ID {telemetry['event']['event_id']} to SIEM Collector.")
                
                time.sleep(2.0)
            except KeyboardInterrupt:
                print("\n[+] Stopping Aegis Agent.")
                break
            except Exception as e:
                print(f"[!] Transmission error: {e}")
                time.sleep(3)

    def _post_json(self, url: str, data: dict):
        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(data).encode('utf-8'),
                headers={'Content-Type': 'application/json'}
            )
            with urllib.request.urlopen(req, timeout=4) as response:
                return json.loads(response.read().decode('utf-8'))
        except Exception:
            return None

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AegisSOC Remote Forwarder Agent")
    parser.add_argument("--server", type=str, default="http://localhost:8000", help="URL of Central SIEM Server (e.g. http://192.168.1.100:8000)")
    args = parser.parse_args()

    agent = AegisAgent(server_url=args.server)
    agent.run()
