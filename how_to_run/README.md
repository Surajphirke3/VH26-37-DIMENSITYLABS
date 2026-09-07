# 🧭 MEND - X | Teammate Run & Deployment Hub

Welcome to the **MEND - X** running hub! This folder contains ready-to-run scripts and documentation so any teammate on macOS, Linux, or Windows can run the complete system reliably.

---

## ⚡ Quick Decision: Which Mode Do You Need?

| Mode | When to Use | Command (macOS / Linux) | Command (Windows) |
| :--- | :--- | :--- | :--- |
| **🏠 Localhost Mode** | Developing or presenting completely on your own machine. Web UI on `http://localhost:3000` and API on `http://localhost:8000`. | `./how_to_run/start_localhost.sh` | `how_to_run\start_localhost.bat` |
| **🌐 Tunnelling Mode** | Sharing backend with remote teammates, Vercel frontend, or physical phone over Wi-Fi/4G. | `./how_to_run/start_tunnel.sh` | `how_to_run\start_tunnel.bat` |
| **📱 Mobile USB Mode** | Running the Expo app on a physical Android phone connected via USB cable (no Wi-Fi latency). | `./how_to_run/connect_phone.sh` | `how_to_run\connect_phone.bat` |
| **🔍 Diagnostics** | Check if Docker, DB, Redis, Backend, Frontend, and AI are currently running and healthy. | `./how_to_run/check_system.sh` | Run diagnostics in WSL / Git Bash |
| **🎛 Interactive Menu** | Choose any of the above options from a simple numbered terminal menu. | `./how_to_run/menu.sh` | `how_to_run\menu.bat` |

---

## 🏛 System Architecture & Port Reference

```text
┌──────────────────────────────────────────────────────────────────────────────────┐
│                               MEND - X FULL STACK                                │
├──────────────────────────┬───────────────────────────────────────────────────────┤
│ Frontend (Next.js 16)    │ Port 3000  → http://localhost:3000                    │
│ Backend API (FastAPI)    │ Port 8000  → http://localhost:8000                    │
│ Swagger API Docs         │ Port 8000  → http://localhost:8000/docs               │
│ PostgreSQL + pgvector    │ Port 5432  → postgresql://mechind:mechind_dev@localhost│
│ Redis Cache              │ Port 6379  → redis://localhost:6379/0                 │
│ Mobile Client (Expo)     │ Port 8081  → http://localhost:8081                    │
│ AI Inference Engine      │ Groq LPU (Apex 4B, Forge 2B, Nord 1B) (Active)        │
│ Embeddings Engine        │ Local Sentence-Transformers / FastEmbed (Active)      │
│ Cloudflare Tunnel        │ Dynamic URL (https://*.trycloudflare.com)             │
└──────────────────────────┴───────────────────────────────────────────────────────┘
```

---

## 1. 🏠 Running in Localhost Mode (Pure Local)

Use this when you want everything running locally on your computer.

### Step 1: Clone & Configure Environment
Make sure `.env` exists in the repository root:
```bash
cp .env.example .env
```
Ensure `GROQ_API_KEY` is present in `.env` (Groq provides free ultra-fast LPU inference).
Make sure `LLM_PROVIDER=groq`.

### Step 2: Start All Services Concurrently
- **macOS / Linux**:
  ```bash
  ./how_to_run/start_localhost.sh
  ```
- **Windows (Command Prompt / PowerShell)**:
  ```cmd
  how_to_run\start_localhost.bat
  ```

### What this script does automatically:
1. Detects Docker and starts the **PostgreSQL (pgvector)** and **Redis** containers.
2. Checks the Python virtual environment in `backend/.venv`, creating it and installing dependencies if missing.
3. Checks `frontend/node_modules`, running `npm install` if missing.
4. Starts the **FastAPI backend** on `http://localhost:8000` with hot-reload.
5. Starts the **Next.js frontend** on `http://localhost:3000`.
6. Pressing **Ctrl+C** automatically and cleanly shuts down all background processes.

---

## 2. 🌐 Running in Tunnelling Mode (Cloudflare Tunnel)

Use this mode when:
- Your frontend is hosted on **Vercel** (`https://vh26-37-dimensitylabs.vercel.app` or `https://mend-x.vercel.app`), but your database and backend are running on your local laptop.
- A teammate wants to test the API from their laptop without installing Docker or Python.
- You are testing the mobile Expo app from a remote network.

### Step 1: Ensure Localhost Backend is Running
Your backend must be running on port `8000`:
```bash
# In Terminal 1
cd backend
.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*(Or use `./how_to_run/start_localhost.sh`)*

### Step 2: Start Cloudflare Tunnel
- **macOS / Linux**:
  ```bash
  ./how_to_run/start_tunnel.sh
  ```
- **Windows**:
  ```cmd
  how_to_run\start_tunnel.bat
  ```

### Step 3: Copy Your Public URL
Cloudflare will print a secure URL like:
```text
https://xxxx-xxxx-xxxx.trycloudflare.com
```

1. **Add to Vercel Environment Variables** (or remote frontend):
   - `NEXT_PUBLIC_API_URL` = `https://xxxx-xxxx-xxxx.trycloudflare.com`
   - `INTERNAL_API_URL` = `https://xxxx-xxxx-xxxx.trycloudflare.com`
2. **Add to `CORS_ORIGINS` in `.env`**:
   Add `"https://xxxx-xxxx-xxxx.trycloudflare.com"` to `CORS_ORIGINS` in `.env` so your browser doesn't block API requests.

---

## 3. 📱 Physical Phone USB Cable Mode (ADB Reverse)

Use this when running the Expo mobile app on a physical Android phone connected via USB cable:

### Requirements on Phone:
1. Settings → About Phone → Tap **Build number** 7 times to enable Developer Mode.
2. Settings → Developer Options → Turn ON **USB Debugging**.
3. Plug in USB cable and change USB mode notification from *Charging* to *File Transfer (MTP)*.
4. Unlock phone and tap **Allow USB debugging** (check "Always allow").

### Run the connector:
- **macOS / Linux**:
  ```bash
  ./how_to_run/connect_phone.sh
  ```
- **Windows**:
  ```cmd
  how_to_run\connect_phone.bat
  ```

This reverse-forwards:
- Port `8081` (Expo Metro Bundler)
- Port `8000` (FastAPI Backend)

Then start Expo:
```bash
cd mobile
npx expo start
```
Press **`a`** in your terminal to immediately open the app on your phone!

---

## 4. 📚 Ingesting Manuals (RAG Knowledge Base)

To process and index technical PDF manuals into pgvector & ChromaDB:

```bash
# From project root using backend virtualenv:
backend/.venv/bin/python ingest.py --pdf sinamics_g120.pdf --machine_id sinamics_g120 --manual_name "Siemens SINAMICS G120"
backend/.venv/bin/python ingest.py --pdf sinamics_s120.pdf --machine_id sinamics_s120 --manual_name "Siemens SINAMICS S120"
backend/.venv/bin/python ingest.py --pdf powerflex_755.pdf --machine_id powerflex_755 --manual_name "Allen-Bradley PowerFlex 755"
```

Or open [`http://localhost:3000/upload`](http://localhost:3000/upload) in your browser and drag-and-drop any PDF manual!

---

## 5. 🛠 Troubleshooting & Common Teammate Issues

### Error: `Address already in use` (Port 8000 or 3000)
Someone or a previous session is still holding the port.
- **macOS / Linux**:
  ```bash
  kill -9 $(lsof -ti :8000) 2>/dev/null || true
  kill -9 $(lsof -ti :3000) 2>/dev/null || true
  ```
- **Windows**:
  ```cmd
  for /f "tokens=5" %a in ('netstat -aon ^| find ":8000" ^| find "LISTENING"') do taskkill /f /pid %a
  ```

### Error: `Docker daemon not running`
Start Docker Desktop on your machine and wait until the whale icon shows "Docker Engine is running".

### Error: `AttributeError: 'Settings' object has no attribute 'HUGGINGFACE_API_KEY'`
This has already been resolved! Hugging Face API key is now completely optional and exempt. The backend defaults safely to Groq (`LLM_PROVIDER=groq`).

### Error: `adb command not found`
- **macOS**: `brew install --cask android-platform-tools`
- **Windows**: Install Android SDK platform-tools or run `winget install Google.PlatformTools`
