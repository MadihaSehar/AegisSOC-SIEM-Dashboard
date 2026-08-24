import webbrowser
import os
import sys

def main():
    print("=" * 60)
    print("      AEGIS SOC - SIEM Threat Monitoring Tool & Dashboard")
    print("=" * 60)
    
    html_path = os.path.abspath("standalone_dashboard.html")
    print(f"\n[+] Opening SIEM SOC Web Dashboard in default browser...")
    print(f"[+] File: file:///{html_path}")
    
    webbrowser.open(f"file:///{html_path}")
    print("\n[✔] SIEM Dashboard launched successfully!")

if __name__ == "__main__":
    main()
