# 📋 MEND - X | Complete Step-by-Step Run Instructions

This guide provides end-to-end instructions for any teammate to set up, run, and test **MEND - X** on **macOS**, **Linux**, or **Windows**.

---

## 📑 Table of Contents
1. [Prerequisites Checklist](#1-prerequisites-checklist)
2. [Environment Setup (.env)](#2-environment-setup-env)
3. [Mode A: Running Full Stack on Localhost](#3-mode-a-running-full-stack-on-localhost-recommended-for-local-dev)
4. [Mode B: Running with Cloudflare Tunneling](#4-mode-b-running-with-cloudflare-tunneling-for-remote--vercel)
5. [Mode C: Running Mobile App on Physical Phone (USB Cable)](#5-mode-c-running-mobile-app-on-physical-phone-usb-cable)
6. [Mode D: Interactive Terminal Menu Launcher](#6-mode-d-interactive-terminal-menu-launcher)
7. [How to Check System Health & Running Services](#7-how-to-check-system-health--running-services)
8. [How to Ingest New OEM Manuals (RAG Pipeline)](#8-how-to-ingest-new-oem-manuals-rag-pipeline)
9. [Troubleshooting & FAQs](#9-troubleshooting--faqs)

---

## 1. Prerequisites Checklist

Before running, make sure your machine has:
- [x] **Docker Desktop** installed and running (Required for PostgreSQL `pgvector` & `Redis`).
- [x] **Python 3.11+** installed (`python3 --version`).
- [x] **Node.js 18+** & **npm** installed (`node --version` and `npm --version`).
- [x] *(Optional for Tunneling)* **cloudflared CLI**:
  - macOS: `brew install cloudflared`
  - Windows: `winget install Cloudflare.cloudflared`
- [x] *(Optional for Mobile)* **Android Debug Bridge (ADB)**:
  - macOS: `brew install --cask android-platform-tools`
  - Windows: `winget install Google.PlatformTools`

---

## 2. Environment Setup (`.env`)

From the root of the project directory (`VH26-37-DIMENSITYLABS/`):

1. Copy the example environment file if you haven't already:
   ```bash
   cp .env.example .env
   ```
2. Verify these key variables inside `.env`:
   ```dotenv
   # AI Provider: Groq is active (free, ultra-fast LPU inference)
   LLM_PROVIDER=groq
   GROQ_API_KEY=gsk_...
   GROQ_MODEL=openai/gpt-oss-120b

   # Embeddings: Local sentence-transformers (No external key needed)
   EMBEDDING_PROVIDER=local

   # Database: Docker Postgres pgvector
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   POSTGRES_DB=mechind
   POSTGRES_USER=mechind
   POSTGRES_PASSWORD=change_me_in_production

   # Redis: Docker Redis
   REDIS_URL=redis://localhost:6379/0
   ```
   > 💡 **Note on Hugging Face:** The Hugging Face API key is completely optional and exempt. You do **not** need a Hugging Face key to run the full application.

---

## 3. Mode A: Running Full Stack on Localhost (Recommended for Local Dev)

In this mode, everything runs locally:
- Database + Redis in Docker
- FastAPI Backend on `http://localhost:8000`
- Next.js Frontend on `http://localhost:3000`

### ⚡ One-Command Automatic Startup:

#### On macOS / Linux:
```bash
./how_to_run/start_localhost.sh
```

#### On Windows:
Double-click `how_to_run\start_localhost.bat` or run:
```cmd
how_to_run\start_localhost.bat
```

### What this automated script does:
1. Verifies that ports `8000` and `3000` are free (cleans up stale processes).
2. Starts Docker containers for PostgreSQL (`pgvector`) and Redis.
3. Automatically sets up Python `backend/.venv` and installs `requirements.txt` if needed.
4. Checks and installs frontend `npm` dependencies if needed.
5. Launches FastAPI on `http://localhost:8000` with hot-reload.
6. Launches Next.js on `http://localhost:3000`.
7. **Pressing Ctrl+C stops all services cleanly.**

### 🛠 Manual Step-by-Step Startup (Alternative):
If you prefer running services in separate terminal windows:

- **Terminal 1 (Infrastructure):**
  ```bash
  docker compose up -d db redis
  ```
- **Terminal 2 (FastAPI Backend):**
  ```bash
  cd backend
  source .venv/bin/activate       # Windows: .venv\Scripts\activate
  alembic upgrade head           # (First time only)
  python scripts/seed.py         # (First time only)
  uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
  ```
- **Terminal 3 (Next.js Frontend):**
  ```bash
  cd frontend
  npm install                    # (First time only)
  npm run dev
  ```

### Verify Localhost is Working:
- Frontend Dashboard: [http://localhost:3000](http://localhost:3000)
- Interactive Swagger API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- API Health Status: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

---

## 4. Mode B: Running with Cloudflare Tunneling (For Remote & Vercel)

Use this mode when your backend is running on your laptop, but:
- Your frontend is hosted remotely on **Vercel** (`https://vh26-37-dimensitylabs.vercel.app` or `https://mend-x.vercel.app`).
- A teammate wants to connect to your backend from their laptop or home.
- You want to test the mobile app over Wi-Fi / 4G without USB.

### Step 1: Ensure Localhost Backend is Running
Make sure your FastAPI server is running on `http://localhost:8000` (via Mode A above).

### Step 2: Launch the Tunnel Script

#### On macOS / Linux:
```bash
./how_to_run/start_tunnel.sh
```

#### On Windows:
```cmd
how_to_run\start_tunnel.bat
```

### Step 3: Copy Your Public Tunnel URL
Cloudflare will output a public HTTPS address in your terminal:
```text
https://your-unique-name.trycloudflare.com
```

### Step 4: Configure Remote Environments:
1. **In Vercel Dashboard (Settings → Environment Variables):**
   - Set `NEXT_PUBLIC_API_URL` = `https://your-unique-name.trycloudflare.com`
   - Set `INTERNAL_API_URL`    = `https://your-unique-name.trycloudflare.com`
   - Redeploy or trigger a new deployment.
2. **In Local `.env` (CORS Whitelist):**
   Add your tunnel URL to `CORS_ORIGINS` so your browser doesn't block requests:
   ```dotenv
   CORS_ORIGINS=["http://localhost:3000","https://your-unique-name.trycloudflare.com"]
   ```

---

## 5. Mode C: Running Mobile App on Physical Phone (USB Cable)

Use this mode to test the Expo React Native app on an Android phone over USB cable with zero Wi-Fi latency.

### Step 1: Prepare Your Android Phone
1. Go to **Settings** → **About Phone** → Tap **Build Number** 7 times until Developer Mode is unlocked.
2. Go to **Settings** → **Developer Options** → Turn ON **USB Debugging**.
3. Connect your phone via USB cable to your computer.
4. When the USB notification appears, change from *Charging* to *File Transfer (MTP)*.
5. When the prompt appears on your phone screen: **Allow USB debugging?**, tap **Allow** (check *Always allow from this computer*).

### Step 2: Run the USB Connector Script

#### On macOS / Linux:
```bash
./how_to_run/connect_phone.sh
```

#### On Windows:
```cmd
how_to_run\connect_phone.bat
```

This automatically executes:
- `adb reverse tcp:8081 tcp:8081` (Expo Metro Bundler)
- `adb reverse tcp:8000 tcp:8000` (FastAPI Backend)

### Step 3: Start Expo
In another terminal:
```bash
cd mobile
npx expo start
```
Press **`a`** in the terminal to immediately open MEND - X on your connected phone!

---

## 6. Mode D: Interactive Terminal Menu Launcher

If you prefer a numbered menu where you can trigger any action with one keypress:

#### On macOS / Linux:
```bash
./how_to_run/menu.sh
```

#### On Windows:
```cmd
how_to_run\menu.bat
```

### Menu Options:
```text
========================================================
 🛠  MEND - X | TEAMMATE LAUNCHPAD
========================================================
 [1] 🏠 Start Localhost Stack (DB + Redis + Backend + Frontend)
 [2] 🌐 Start Cloudflare Tunnel for Backend (Port 8000)
 [3] 📱 Connect Android Phone via USB (ADB Reverse Tunnel)
 [4] 🔍 Check System Health & Running Services
 [5] 📚 Ingest Sample OEM Manuals (RAG Knowledge Base)
 [6] 🛑 Kill Any Processes on Ports 8000 & 3000
 [0] 🚪 Exit
========================================================
```

---

## 7. How to Check System Health & Running Services

To quickly inspect what services are currently running, healthy, or down:

```bash
./how_to_run/check_system.sh
```

Sample output:
```text
========================================================
 🔍 MEND - X | SYSTEM STATUS & HEALTH CHECK
========================================================
🐳 Docker Engine: Running ✅
🐘 PostgreSQL (Port 5432): Active on localhost:5432 ✅
⚡ Redis Cache (Port 6379): Active on localhost:6379 ✅
📡 FastAPI Backend (Port 8000): Healthy & Responding ✅
   Response: {"status":"ok","environment":"development","version":"1.0.0"}
🌐 Next.js Frontend (Port 3000): Active on http://localhost:3000 ✅
🧠 Active AI Model: {"success":true,"data":{"active_model":"openai/gpt-oss-120b","provider":"groq"}} ✅
🌐 Cloudflare Tunnel: Not currently running (Run: ./how_to_run/start_tunnel.sh if needed)
📱 Android Phone (ADB): ADB available, no authorized device connected.
========================================================
```

---

## 8. How to Ingest New OEM Manuals (RAG Pipeline)

### Option 1: Automated CLI Ingestion
Run the ingestion script from the repository root using the backend Python virtual environment:

```bash
# Ingest Siemens SINAMICS G120 Manual:
backend/.venv/bin/python ingest.py --pdf sinamics_g120.pdf --machine_id sinamics_g120 --manual_name "Siemens SINAMICS G120"

# Ingest Siemens SINAMICS S120 Manual:
backend/.venv/bin/python ingest.py --pdf sinamics_s120.pdf --machine_id sinamics_s120 --manual_name "Siemens SINAMICS S120"

# Ingest Allen-Bradley PowerFlex 755 Manual:
backend/.venv/bin/python ingest.py --pdf powerflex_755.pdf --machine_id powerflex_755 --manual_name "Allen-Bradley PowerFlex 755"
```

### Option 2: Web Dashboard Upload
1. Open [`http://localhost:3000/upload`](http://localhost:3000/upload).
2. Drag and drop any OEM PDF manual.
3. Watch the real-time **Execution Pipeline Tracker** as it parses, chunks, embeds, and stores the document in PostgreSQL & ChromaDB.

---

## 9. Troubleshooting & FAQs

### Q: `Address already in use: [Errno 48]` (Port 8000 or 3000)
A previous process is still holding the port. To clear it:
- **macOS / Linux:**
  ```bash
  kill -9 $(lsof -ti :8000) 2>/dev/null || true
  kill -9 $(lsof -ti :3000) 2>/dev/null || true
  ```
- **Windows:**
  Select option `[5] Kill Any Processes on Port 8000` in `how_to_run\menu.bat`.

### Q: `Docker daemon not running`
Start Docker Desktop on your laptop and wait until the status turns green ("Engine running").

### Q: Do I need a Hugging Face API key?
**No.** Hugging Face is completely exempt and optional. The system uses **Groq LPU** (`openai/gpt-oss-120b` Apex, `openai/gpt-oss-20b` Forge, `groq/compound-mini` Nord) and local FastEmbed embeddings.

### Q: CORS Error when calling API from Vercel / Remote Frontend
1. Make sure your tunnel URL is added to `CORS_ORIGINS` in your local `.env`.
2. Save `.env` and restart/reload FastAPI.
