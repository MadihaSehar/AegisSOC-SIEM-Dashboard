# 🛡️ AegisSOC — Multi-Node Distributed SIEM & Threat Intelligence Platform

[![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![MITRE ATT&CK](https://img.shields.io/badge/MITRE-ATT%26CK%20Mapped-red?style=for-the-badge)](https://attack.mitre.org)
[![Multi-Node Agent](https://img.shields.io/badge/Verified-Multi--Node%20Live-emerald?style=for-the-badge)](backend/agent.py)

**AegisSOC** is a multi-node distributed Security Information and Event Management (SIEM) and Security Operations Center (SOC) monitoring platform. It collects, correlates, and monitors Windows Security Event Logs and system telemetry across **multiple remote PCs** over your local network or internet.

---

## ⚡ Verified Multi-Node Live Test (Real Network Connection)

```
[+] Hostname   : WIN-RJCSG0BSFFA (Remote Target PC)
[+] Agent ID   : AGENT-WIN-RJCSG0BSFFA
[+] Local IP   : 192.168.0.181
[+] SIEM Server: http://192.168.0.128:8000
[✔] Successfully registered agent with central SOC server!
[+] Forwarded Telemetry & Security Event IDs 5156, 1102, 4624, 4688 to Central SIEM Collector.
```

---

## ✨ Key Features

- **🌐 Multi-Node Remote Forwarder Agent (`agent.py`)**: Lightweight agent script deployable on any remote PC to forward system logs & process telemetry to your central SIEM collector.
- **⚡ Ingestion Velocity**: Stream Windows Security Event Logs (`4624`, `4625`, `4688`, `1102`, `7045`) over WebSockets with minimal delay (<12ms).
- **🎯 MITRE ATT&CK Correlation**: Automatic mapping of ingested events to MITRE ATT&CK enterprise tactics (*Execution, Persistence, Defense Evasion, Credential Access, Command & Control*).
- **🚨 Lateral Movement Detection**: Detects brute-force logon attempts hopping between different PCs on your local network.
- **🔍 Multi-Fleet Log Workbench**: Filter logs by specific target nodes (`WIN-RJCSG0BSFFA`, `DESKTOP-SOC-01`, `LAPTOP-OFFICE-02`) or view all fleet logs combined.
- **🛡️ Containment Playbooks**: One-click remote host isolation and malicious process termination.

---

## 🏗️ Distributed Multi-Node Architecture

```
 ┌──────────────────────┐       ┌──────────────────────┐       ┌──────────────────────┐
 │ Remote PC #1 (Friend)│       │   Remote PC #2       │       │   Remote PC #3       │
 │  (WIN-RJCSG0BSFFA)   │       │                      │       │                      │
 │ ┌──────────────────┐ │       │ ┌──────────────────┐ │       │ ┌──────────────────┐ │
 │ │ Aegis Agent Script│ │       │ │ Aegis Agent Script│ │       │ │ Aegis Agent Script│ │
 │ └────────┬─────────┘ │       │ └────────┬─────────┘ │       │ └────────┬─────────┘ │
 └──────────┼───────────┘       └──────────┼───────────┘       └──────────┼───────────┘
            │ Logs Stream (HTTP/WS)        │ Logs Stream                  │ Logs Stream
            └──────────────────────────────┼──────────────────────────────┘
                                           │
                                           ▼
                       ┌───────────────────────────────────────┐
                       │    Central SIEM Collector Server      │
                       │   (http://192.168.0.128:8000)         │
                       └───────────────────┬───────────────────┘
                                           │
                                           ▼
                       ┌───────────────────────────────────────┐
                       │  Multi-Node Fleet SOC Dashboard       │
                       │  (View all PCs on 1 Central Screen)   │
                       └───────────────────────────────────────┘
```

---

## 🚀 How to Run

### 1. Instant Dashboard Preview (Standalone Mode)
Double click **`standalone_dashboard.html`** or run:
```bash
python start_siem.py
```

### 2. Full-Stack Multi-Node Setup

#### Step 1: Start Central SIEM Collector Server (Main PC)
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

#### Step 2: Run Forwarder Agent on Remote PCs
Copy `agent.py` to any other PC on your network and run:
```bash
python agent.py --server http://YOUR_MAIN_PC_IP:8000
```
*Example:* `python agent.py --server http://192.168.0.128:8000`

---

## 📄 License

Distributed under the MIT License.
