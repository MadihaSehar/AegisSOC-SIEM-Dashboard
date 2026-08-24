# 🛡️ AegisSOC — SIEM Threat Monitoring & Incident Response System

[![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![MITRE ATT&CK](https://img.shields.io/badge/MITRE-ATT%26CK%20Mapped-red?style=for-the-badge)](https://attack.mitre.org)
[![License](https://img.shields.io/badge/License-MIT-blue.style=for-the-badge)](LICENSE)

**AegisSOC** is an enterprise-grade Security Information and Event Management (SIEM) and Security Operations Center (SOC) monitoring platform designed for real-time Windows host log ingestion, Sigma-based threat detection, MITRE ATT&CK correlation, and incident containment.

![AegisSOC Dashboard Overview](https://raw.githubusercontent.com/placeholder/aegissoc-preview.png)

---

## ✨ Key Features

- **⚡ Real-Time Ingestion Velocity**: Stream Windows Security Event Logs (`4624`, `4625`, `4688`, `1102`, `7045`, Sysmon) and system metrics over WebSockets with minimal delay (<12ms).
- **🎯 MITRE ATT&CK Matrix Correlation**: Automatic mapping of ingested telemetry to MITRE ATT&CK enterprise tactics (*Initial Access, Execution, Persistence, Privilege Escalation, Credential Access, Defense Evasion, Command & Control*).
- **🔍 SIEM Workbench & KQL Query Engine**: Filter logs with Lucene/KQL-style search syntax (`event.id:4625 AND process:powershell.exe`), inspect formatted raw JSON payloads, and export forensic bundles.
- **🛡️ Sigma Threat Detection Engine**: Customizable rule evaluation engine detecting obfuscated PowerShell stagers, RDP brute force attempts, audit log tampering, and listening reverse shell ports.
- **⚡ Incident Triage & Containment Playbooks**: Security analyst ticket triage workflow (*NEW, IN_PROGRESS, RESOLVED*) with one-click containment actions (*Host Network Isolation, Malicious Process Termination*).
- **💻 Host Endpoint Diagnostics**: Live process tree inspection (`psutil`), CPU/RAM workload monitoring, and active TCP/UDP socket listening table.

---

## 🏗️ System Architecture

```
                               ┌──────────────────────────────────────────────────────────┐
                               │                    Windows Host PC                       │
                               │  ┌────────────────────┐      ┌────────────────────────┐  │
                               │  │ Windows Event Logs │      │ Process & Socket Metrics│  │
                               │  │ (Security/Sysmon)  │      │ (psutil / netstat)     │  │
                               │  └─────────┬──────────┘      └───────────┬────────────┘  │
                               └────────────┼─────────────────────────────┼───────────────┘
                                            │                             │
                                            ▼                             ▼
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │                              SIEM Collector & Engine (Backend)                         │
 │                                                                                        │
 │  ┌────────────────────────┐    ┌─────────────────────────┐   ┌──────────────────────┐  │
 │  │ Log Ingestion Adapter  │ ──►│ Threat Detection Engine │──►│ Incident Correlator  │  │
 │  │ (Local PC / Simulator) │    │ (Sigma Rules Engine)    │   │ (MITRE ATT&CK Map)   │  │
 │  └────────────────────────┘    └─────────────────────────┘   └──────────────────────┘  │
 │                                             │                                          │
 │                                  WebSockets / REST APIs                                │
 └─────────────────────────────────────────────┼──────────────────────────────────────────┘
                                               │
                                               ▼
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │                              SOC Web Dashboard (Frontend)                              │
 │                                                                                        │
 │  ┌─────────────────┐   ┌───────────────────┐   ┌────────────────┐   ┌──────────────┐   │
 │  │  Command Center │   │ Live SIEM Log Grid│   │ Threat & MITRE │   │ Incident &   │   │
 │  │   Overview HUD  │   │  & KQL Search     │   │   Matrix View  │   │ Endpoint Hub │   │
 │  └─────────────────┘   └───────────────────┘   └────────────────┘   └──────────────┘   │
 └────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 MITRE ATT&CK Coverage Table

| Event ID | Provider | Risk Level | MITRE Technique | Description |
| :--- | :--- | :--- | :--- | :--- |
| **4688** | Security | `CRITICAL` | **T1059.001** (PowerShell) | Encoded command line execution via PowerShell stager |
| **4625** | Security | `HIGH` | **T1110.001** (Password Guessing) | High frequency failed RDP/SMB logon attempts (Brute Force) |
| **1102** | Security | `HIGH` | **T1070.001** (Clear Event Logs) | Windows Security Audit log cleared by adversary |
| **4624** | Security | `INFO` | **T1078** (Valid Accounts) | Successful account logon telemetry |
| **7045** | System | `MEDIUM` | **T1543.003** (Windows Service) | New background kernel driver or system service installed |
| **5156** | Filtering | `INFO` | **T1071** (Web Protocols) | Outbound network connection permitted by WFP |

---

## 🚀 Quick Start Guide

### Option 1: Standalone Single-Click Launch (Recommended for Demos)

Simply double-click the included standalone web application:

```bash
# Double-click standalone_dashboard.html in File Explorer OR run via terminal:
python start_siem.py
```

---

### Option 2: Full-Stack Development Setup (FastAPI + React)

#### 1. Start the Backend API & WebSockets Engine
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn server:app --reload --port 8000
```
*Backend API available at: `http://localhost:8000`*

#### 2. Start the Frontend React Web Dashboard
```bash
cd frontend
npm install
npm run dev
```
*Frontend SOC Dashboard available at: `http://localhost:3000`*

---

## 📂 Project Structure

```
AegisSOC-SIEM-Dashboard/
├── backend/
│   ├── server.py              # FastAPI + WebSockets engine & REST endpoints
│   └── requirements.txt       # Backend dependencies (FastAPI, uvicorn, psutil)
├── frontend/
│   ├── index.html             # HTML entry point with metadata
│   ├── package.json           # Frontend React + Lucide + Tailwind config
│   ├── vite.config.js         # Vite dev server configuration
│   └── src/
│       ├── App.jsx            # Main app controller & WebSockets state manager
│       ├── components/
│       │   ├── Navbar.jsx          # Header status bar & clock
│       │   ├── CommandCenter.jsx   # Executive HUD & EPS chart
│       │   ├── LiveLogStream.jsx   # SIEM log search workbench & raw payload inspector
│       │   ├── MitreMatrix.jsx     # Interactive MITRE ATT&CK coverage grid
│       │   ├── IncidentManager.jsx # Incident triage & containment playbooks
│       │   ├── RuleEngineView.jsx  # Sigma detection rule manager
│       │   └── EndpointControl.jsx # Host process list & port listener inspector
│       └── services/
│           └── siemService.js # Telemetry WebSockets & mock fallback stream
├── standalone_dashboard.html  # Zero-dependency self-contained HTML dashboard
├── start_siem.py              # Python quick launcher script
└── README.md                  # Professional project documentation
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/placeholder/issues).

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Crafted with ❤️ for Cybersecurity Analysts, SOC Engineers, and Blue Teams.
</p>
