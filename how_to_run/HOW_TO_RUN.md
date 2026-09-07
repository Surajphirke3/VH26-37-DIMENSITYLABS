# 🚀 HOW TO RUN MEND - X

For detailed step-by-step instructions, please read **[`INSTRUCTIONS.md`](INSTRUCTIONS.md)** and **[`README.md`](README.md)** in this folder.

---

## ⚡ Quick Start Cheatsheet

### 1. 🏠 Localhost Mode (Frontend + Backend + DB)
```bash
# macOS / Linux
./how_to_run/start_localhost.sh

# Windows
how_to_run\start_localhost.bat
```
- Web UI: http://localhost:3000
- API: http://localhost:8000
- Docs: http://localhost:8000/docs

---

### 2. 🌐 Cloudflare Tunneling Mode (For Vercel / Remote)
```bash
# macOS / Linux
./how_to_run/start_tunnel.sh

# Windows
how_to_run\start_tunnel.bat
```
Generates a public `https://*.trycloudflare.com` URL to connect your local backend to Vercel or remote teammates.

---

### 3. 📱 Mobile USB Phone Mode (ADB Reverse)
```bash
# macOS / Linux
./how_to_run/connect_phone.sh

# Windows
how_to_run\connect_phone.bat
```
Forwards ports 8081 (Expo) and 8000 (Backend) over USB cable to your Android phone.

---

### 4. 🎛 Interactive Menu (Choose Any Action)
```bash
# macOS / Linux
./how_to_run/menu.sh

# Windows
how_to_run\menu.bat
```

---

### 5. 🔍 Health Check
```bash
./how_to_run/check_system.sh
```
Shows the real-time status of Docker, Postgres, Redis, FastAPI, Next.js, and active AI model.
