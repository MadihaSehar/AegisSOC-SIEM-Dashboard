# 🛡️ AegisSOC — Global Distributed Multi-Node SIEM & Threat Intelligence Platform

[![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![MITRE ATT&CK](https://img.shields.io/badge/MITRE-ATT%26CK%20Mapped-red?style=for-the-badge)](https://attack.mitre.org)
[![Global Access](https://img.shields.io/badge/Global-Mobile%20%26%20PC%20Access-emerald?style=for-the-badge)](https://vercel.com)
[![License](https://img.shields.io/badge/License-MIT-blue.style=for-the-badge)](LICENSE)

**AegisSOC** is a next-generation, globally accessible Security Information and Event Management (SIEM) and Security Operations Center (SOC) dashboard. It enables real-time threat monitoring, Windows Security Event log correlation, and automated incident response across **multiple remote PCs, laptops, and mobile devices globally**.

---

## 📸 Verified Multi-Node Visual Gallery (5 Core Screenshots)

### 1. 🖥️ Remote Forwarder Agent (`agent.py`) Live Execution
![Remote Forwarder Agent Execution](docs/01_remote_agent_terminal.png)
*Zero-dependency Python agent executing on remote target PC `WIN-RJCSG0BSFFA` (`192.168.0.181`), successfully registering and forwarding Security Event IDs 5156, 1102, 4624, and 4688 to the central SIEM server (`192.168.0.128:8000`).*

---

### 2. ⚡ Command Center Executive HUD & Ingest Velocity
![Command Center Overview](docs/02_command_center_overview.png)
*Executive SOC HUD displaying 4 Fleet Nodes Active, 203+ EPS combined ingestion velocity, 88% Fleet Health Score, primary host workload, and Lateral Movement Warning Banner.*

---

### 3. 🔍 SIEM Log Analytics & Search Workbench
![SIEM Log Workbench](docs/03_siem_log_workbench.png)
*Multi-node streaming log grid with KQL search bar, severity badges, Event IDs, process names, and user telemetry across `WIN-RJCSG0BSFFA`, `DESKTOP-SOC-01`, `LAPTOP-OFFICE-02`, and `SERVER-PROD-03`.*

---

### 4. 🌐 Registered Fleet Management Hub
![Registered Fleet Cards](docs/04_registered_fleet_cards.png)
*Active node cards displaying `WIN-RJCSG0BSFFA` (Friend PC) registered live on the network alongside primary and remote fleet nodes.*

---

### 5. 🎯 MITRE ATT&CK Correlation & Incident Containment
![MITRE ATT&CK Matrix & Incidents](docs/05_mitre_matrix_incidents.png)
*Automated threat mapping for `WIN-RJCSG0BSFFA` under TA0002 Execution (PowerShell Execution T1059.001) & TA0005 Defense Evasion (Clear Event Logs T1070.001) with 1-click Host Isolation playbooks.*

---

## ✨ Key Features

- **🌐 Multi-Node Remote Forwarder Agent (`agent.py`)**: Lightweight agent script deployable on any remote PC (Windows/Linux/macOS) to forward system logs, process telemetry, and active listening sockets over local networks or public IP servers.
- **📱 Accessible Anywhere on Mobile & Desktop**: Access your SOC Command Center 24/7 from **Smartphones, Tablets, Laptops, or Smart TVs** anywhere in the world via cloud hosting (Vercel/Render).
- **🚨 Lateral Movement Detection**: Automatically detects adversary behavior when suspicious RDP/SMB failed logons hop between different nodes across your fleet.
- **🎯 MITRE ATT&CK Matrix Correlation**: Maps live telemetry in real-time to enterprise tactics (*Initial Access, Execution, Persistence, Defense Evasion, Credential Access, Command & Control*).
- **⚡ Rapid Containment Playbooks**: Analysts can trigger one-click remote host network isolation and malicious process termination (`Kill PID`) directly from the dashboard.

---

## 🏗️ Global Multi-Node System Architecture

```
 ┌──────────────────────┐       ┌──────────────────────┐       ┌──────────────────────┐
 │ Remote PC #1 (Friend)│       │   Remote Laptop #2   │       │   Remote Server #3   │
 │  (WIN-RJCSG0BSFFA)   │       │   (LAPTOP-OFFICE-02) │       │   (SERVER-PROD-03)   │
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
                       │    (FastAPI + WebSockets Engine)      │
                       └───────────────────┬───────────────────┘
                                           │
                                           ▼
                       ┌───────────────────────────────────────┐
                       │  Global Fleet Web Dashboard (Vercel)  │
                       │  (Access from Mobile, Tablet, PC)     │
                       └───────────────────────────────────────┘
```

---

## 📊 MITRE ATT&CK Event Correlation Matrix

| Event ID | Log Provider | Risk Level | MITRE Technique | Threat Description |
| :--- | :--- | :--- | :--- | :--- |
| **4688** | Security | `CRITICAL` | **T1059.001** (PowerShell) | Encoded command line execution via obfuscated PowerShell stager |
| **4625** | Security | `HIGH` | **T1110.001** (Password Guessing) | High frequency failed RDP/SMB logon attempts (Brute Force) |
| **1102** | Security | `HIGH` | **T1070.001** (Clear Event Logs) | Windows Security Audit log cleared by adversary to erase tracks |
| **4624** | Security | `INFO` | **T1078** (Valid Accounts) | Successful account logon telemetry baseline |
| **7045** | System | `MEDIUM` | **T1543.003** (Windows Service) | New background kernel driver or system service installed |
| **5156** | Filtering | `INFO` | **T1071** (Web Protocols) | Outbound socket connection permitted by Windows Filtering Platform |

---

## 🚀 Quick Start Guide

### Option 1: Instant Local Browser Demo
Double-click **`standalone_dashboard.html`** or run:
```bash
python start_siem.py
```

---

### Option 2: Full-Stack Multi-Node Setup

#### 1. Start Central SIEM Collector Server (Main PC)
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

#### 2. Run Forwarder Agent on Remote PCs / Laptops
Copy `agent.py` to any remote computer and run:
```bash
python agent.py --server http://YOUR_MAIN_PC_IP:8000
```
*Example:* `python agent.py --server http://192.168.0.128:8000`

---

### Option 3: 1-Click Global Cloud Deployment (Vercel / Render)

Deploy your dashboard to Vercel for 24/7 global access from any phone or PC:
1. Connect your GitHub repository to [Vercel](https://vercel.com).
2. Click **Deploy**.
3. Access your live SOC dashboard globally at `https://aegissoc-siem-dashboard.vercel.app`!

---

## 📁 Repository Structure

```
AegisSOC-SIEM-Dashboard/
├── docs/
│   ├── 01_remote_agent_terminal.png # Remote Agent Terminal Execution
│   ├── 02_command_center_overview.png# Command Center Overview HUD
│   ├── 03_siem_log_workbench.png    # SIEM Log Analytics Workbench
│   ├── 04_registered_fleet_cards.png # Registered Remote Fleet View (WIN-RJCSG0BSFFA)
│   └── 05_mitre_matrix_incidents.png# MITRE ATT&CK Matrix & Incidents Triage
├── backend/
│   ├── server.py                    # FastAPI + WebSockets multi-node collector engine
│   └── requirements.txt             # Dependencies (FastAPI, uvicorn, psutil)
├── frontend/
│   ├── index.html                  # HTML entry point
│   ├── package.json                # React + Tailwind configuration
│   └── src/                        # React components (CommandCenter, LiveLogStream, MitreMatrix)
├── agent.py                        # Zero-dependency remote forwarder script for external PCs
├── standalone_dashboard.html       # Self-contained single-file HTML web application
├── AegisSOC_Complete_Project_Guide.docx # Detailed MS Word project documentation
├── start_siem.py                   # Python quick launcher script
└── README.md                       # Global documentation with 5-image gallery
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.

<p align="center">
  Crafted with ❤️ for Cybersecurity Analysts, SOC Engineers, and Blue Teams.
</p>
