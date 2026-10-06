import os
import sys
import subprocess
import time

def main():
    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
            sys.stderr.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass

    root_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root_dir, "backend")
    frontend_dir = os.path.join(root_dir, "frontend")

    if backend_dir not in sys.path:
        sys.path.insert(0, backend_dir)
    from lan_ip import get_local_ip, list_lan_ips

    local_ip = get_local_ip()
    lan_ips = list_lan_ips()

    print("=" * 60)
    print("         Starting BerryIO AI Application")
    print("=" * 60)

    child_env = os.environ.copy()
    child_env["PYTHONIOENCODING"] = "utf-8"
    child_env["PYTHONUTF8"] = "1"

    venv_py = os.path.join(root_dir, ".venv", "Scripts", "python.exe")
    py_executable = venv_py if os.path.exists(venv_py) else sys.executable

    print("[1/2] Launching Python FastAPI Backend...")
    backend_process = subprocess.Popen(
        [py_executable, "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"],
        cwd=backend_dir,
        env=child_env,
    )

    print("[2/2] Launching Vite Frontend Dev Server...")
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    frontend_process = subprocess.Popen(
        [npm_cmd, "run", "dev"],
        cwd=frontend_dir,
        env=child_env,
    )

    time.sleep(2)
    print("\n" + "=" * 60)
    print("   BerryIO Application is LIVE!")
    print("   Web App:      http://localhost:5173")
    print("   Backend Docs: http://localhost:8000/docs")
    print(f"   Mobile (LAN): http://{local_ip}:8000")
    if len(lan_ips) > 1:
        print("   Other LAN:    " + ", ".join(f"http://{ip}:8000" for ip in lan_ips[1:]))
    print("=" * 60)
    print("\n   Phone and PC must be on the same Wi-Fi.")
    print("   In the app About tab, paste the Mobile (LAN) URL, then Save & Test.")
    print("   Demo accounts: john / sarah  (password: password123)")
    print("=" * 60)

    try:
        frontend_process.wait()
    except KeyboardInterrupt:
        print("\nShutting down BerryIO...")
        backend_process.terminate()
        frontend_process.terminate()

if __name__ == "__main__":
    main()
