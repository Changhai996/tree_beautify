#!/usr/bin/env python3
import os
import platform
import shutil
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent
VENV_DIR = ROOT / ".venv"
REQUIREMENTS = ROOT / "requirements.txt"
SERVER = ROOT / "server.py"
DIST_DIR = ROOT / "src" / "dist"
NODE_MODULES = ROOT / "node_modules"


def run(cmd, cwd=ROOT):
    print(f"[Run] {' '.join(cmd)}")
    subprocess.run(cmd, cwd=str(cwd), check=True)


def ensure_python_version():
    if sys.version_info < (3, 8):
        print("[Error] Python 3.8+ is required.")
        sys.exit(1)


def ensure_venv():
    if not VENV_DIR.exists():
        print("[Setup] Creating virtual environment (.venv)...")
        run([sys.executable, "-m", "venv", str(VENV_DIR)])


def venv_python():
    if platform.system().lower().startswith("win"):
        return VENV_DIR / "Scripts" / "python.exe"
    return VENV_DIR / "bin" / "python"


def ensure_python_deps(py_exec):
    print("[Setup] Installing Python dependencies...")
    run([str(py_exec), "-m", "pip", "install", "--upgrade", "pip"])
    run([str(py_exec), "-m", "pip", "install", "-r", str(REQUIREMENTS)])


def ensure_node_deps_and_build():
    npm = shutil.which("npm")
    if not npm:
        print("[Error] npm not found. Please install Node.js (includes npm).")
        sys.exit(1)

    if not NODE_MODULES.exists():
        print("[Setup] Installing Node.js dependencies...")
        run([npm, "install"])

    if not DIST_DIR.exists():
        print("[Build] Building frontend assets...")
        run([npm, "run", "build"])


def start_server(py_exec):
    if not SERVER.exists():
        print("[Error] server.py not found.")
        sys.exit(1)
    print("[Start] Launching TVBOT_Desktop at http://127.0.0.1:8000/")
    run([str(py_exec), str(SERVER)])


def main():
    os.chdir(ROOT)
    ensure_python_version()
    ensure_venv()
    py_exec = venv_python()
    ensure_python_deps(py_exec)
    ensure_node_deps_and_build()
    start_server(py_exec)


if __name__ == "__main__":
    try:
        main()
    except subprocess.CalledProcessError as exc:
        print(f"[Error] Command failed with exit code {exc.returncode}.")
        sys.exit(exc.returncode)
