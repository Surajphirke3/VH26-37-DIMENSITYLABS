# 🚀 MEND - X | Server Startup & Boot Guide (`boot.md`)

This guide contains all startup commands, environment configurations, and orchestration procedures for **Frontend (Next.js)**, **Backend (FastAPI)**, **Docker Infrastructure**, and **Mobile (Expo / React Native)**.

---

## 📌 Service Matrix & Port Mapping

| Component | Technology | Default URL / Port | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Web** | Next.js 16 / React 19 | [`http://localhost:3000`](http://localhost:3000) | Technician dashboard & admin portal |
| **Backend API** | FastAPI / Uvicorn | [`http://localhost:8000`](http://localhost:8000) | Core RAG pipeline, AI inference & REST API |
| **API Swagger Docs** | OpenAPI | [`http://localhost:8000/docs`](http://localhost:8000/docs) (or `/api/docs`) | Interactive API documentation |
| **Health Check** | FastAPI | [`http://localhost:8000/api/v1/health`](http://localhost:8000/api/v1/health) | API & service health status |
| **Mobile App** | Expo SDK 51 / Metro | Metro Bundler: `http://localhost:8081` | Cross-platform mobile field triage client |
| **PostgreSQL** | pgvector (PostgreSQL 16) | `localhost:5432` | Relational data & vector storage |
| **Redis** | Redis 7 Alpine | `localhost:6379` | Fast caching & rate-limiting queue |
| **Ollama** *(Optional)* | Local LLM Engine | [`http://localhost:11434`](http://localhost:11434) | Offline local inference |

---

## ⚡ Quick Start: Recommended Multi-Terminal Workflow

For local development with hot reload across all layers, run services in **4 separate terminal windows**:

```text
Terminal 1 (Docker)  ──► Start Postgres & Redis
Terminal 2 (Backend) ──► Start FastAPI with Uvicorn
Terminal 3 (Frontend)──► Start Next.js Web Dev Server
Terminal 4 (Mobile)  ──► Start Expo Metro Bundler
```

### Terminal 1: Database & Redis (Docker)
```bash
docker compose up -d db redis
```

### Terminal 2: Backend (FastAPI)
**Windows (PowerShell):**
```powershell
cd backend
.\.venv\Scripts\Activate.ps1
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
**Linux / macOS / Git Bash:**
```bash
cd backend
source .venv/bin/activate
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Terminal 3: Frontend (Next.js)
```bash
cd frontend
npm run dev
```
*Access web interface at: `http://localhost:3000`*

### Terminal 4: Mobile App (Expo)
```bash
cd mobile
npx expo start
```
*Scan QR code using the **Expo Go** app on your phone (iOS / Android).*

---

## 🐳 1. Docker Orchestration Commands

All Docker services are defined in `docker-compose.yml`.

### A. Infrastructure Only (Databases for Local Dev)
Run this when developing Backend and Frontend locally on your machine:
```bash
# Start PostgreSQL (pgvector) and Redis in the background
docker compose up -d db redis

# Verify both containers are running and healthy
docker compose ps
```

### B. Full-Stack in Docker (Complete Environment)
Runs Database, Redis, FastAPI Backend, and Next.js Frontend in containers:
```bash
# Build and start all services in detached mode
docker compose up --build -d

# Start without rebuilding images
docker compose up -d
```

### C. Logs & Monitoring
```bash
# Tail logs from all services
docker compose logs -f

# Tail logs from a specific service (api, frontend, db, redis)
docker compose logs -f api
docker compose logs -f frontend
docker compose logs -f db
```

### D. Executing Migrations & Seeding inside Docker
When running the `api` container inside Docker, run database management via `docker compose exec`:
```bash
# 1. Run database migrations
docker compose exec api alembic upgrade head

# 2. Seed initial demo users and machines
docker compose exec api python scripts/seed_demo.py

# 3. (Optional) Generate demo PDF manuals
docker compose exec api python scripts/create_demo_pdfs.py
```

### E. Stop & Clean Up Containers
```bash
# Stop all containers (retains database data volumes)
docker compose down

# Stop containers AND delete all volumes (clean slate / wipes database)
docker compose down -v
```

---

## ⚙️ 2. Backend Server (FastAPI / Uvicorn)

Located in `backend/`.

### Prerequisites
1. Ensure PostgreSQL and Redis are running:
   ```bash
   docker compose up -d db redis
   ```
2. Verify root `.env` exists. If not:
   ```bash
   cp .env.example .env
   ```

### Initial Setup (One-time)
**Windows (PowerShell):**
```powershell
cd backend
python -m venv .venv
# If script execution is restricted on Windows PowerShell, run:
# Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

**Linux / macOS / Git Bash:**
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### Database Migrations & Seeding
Run from within `backend/` with the virtual environment activated:
```bash
# Apply Alembic database migrations
alembic upgrade head

# Seed demo users (admin, technician) and machines
python scripts/seed_demo.py

# (Optional) Generate synthetic PDF manuals for testing
python scripts/create_demo_pdfs.py
```

### Starting the Server
```bash
# Start with hot-reload enabled on port 8000
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

> **Note:** Binding to `--host 0.0.0.0` allows physical mobile devices on the same Wi-Fi network to connect to your backend server.

### Useful Endpoints
- **API Base:** `http://localhost:8000`
- **Swagger Documentation:** `http://localhost:8000/docs` or `http://localhost:8000/api/docs`
- **ReDoc Documentation:** `http://localhost:8000/redoc` or `http://localhost:8000/api/redoc`
- **Health Check:** `http://localhost:8000/api/v1/health`
- **Readiness Check (DB + Redis probe):** `http://localhost:8000/api/v1/health/ready`

### Running Backend Tests
```bash
# Run unit tests
pytest -m "not integration" -q

# Run all tests with verbosity
pytest -v
```

---

## 💻 3. Frontend Web App (Next.js 16)

Located in `frontend/`.

### Installation
```bash
cd frontend
npm install
```

### Development Server
```bash
# Start Next.js dev server with hot reload
npm run dev
```
*Frontend opens at: [`http://localhost:3000`](http://localhost:3000)*

### Production Build & Run
```bash
# Build the optimized production bundle
npm run build

# Start the production server
npm run start
```

### Root Convenience Shortcuts
From the workspace root directory:
```bash
# Start frontend dev server
npm run frontend

# Build frontend
npm run build
```

> **How Frontend communicates with Backend:**  
> Next.js uses rewrites configured in `frontend/next.config.mjs`. Any request to `http://localhost:3000/api/v1/*` is automatically forwarded to the backend (`http://127.0.0.1:8000/api/v1/*`).

---

## 📱 4. Mobile Client (Expo / React Native)

Located in `mobile/`.

### Step 1: Configure Backend URL (`mobile/.env`)
Physical phones and emulators cannot reach your PC via `localhost`. You must configure your PC's local network IP in `mobile/.env`:

1. Find your computer's local IP address:
   - **Windows (PowerShell/CMD):**
     ```powershell
     ipconfig
     # Look for IPv4 Address under your active Wi-Fi or Ethernet adapter (e.g. 192.168.1.15)
     ```
   - **macOS / Linux:**
     ```bash
     ifconfig | grep "inet "
     # or: ip a
     ```

2. Open `mobile/.env` and update `EXPO_PUBLIC_API_URL`:
   ```env
   # For physical device (phone connected to same Wi-Fi):
   EXPO_PUBLIC_API_URL=http://<YOUR_LOCAL_IP>:8000

   # For Android Studio Emulator:
   # EXPO_PUBLIC_API_URL=http://10.0.2.2:8000

   # For iOS Simulator / Web:
   # EXPO_PUBLIC_API_URL=http://localhost:8000
   ```

### Step 2: Install Dependencies
```bash
cd mobile
npm install
```

### Step 3: Launch Expo Metro Bundler
```bash
# Standard start (interactive terminal with QR code)
npx expo start

# Or using npm script
npm start
```

### Alternative Launch Modes
```bash
# Clear cache if experiencing bundling or stale state issues:
npx expo start -c

# Launch directly into Android emulator / connected device:
npm run android
# or: npx expo start --android

# Launch directly into iOS simulator (macOS only):
npm run ios
# or: npx expo start --ios

# Launch in Web browser:
npm run web
# or: npx expo start --web

# Launch via Expo Tunnel (Bypasses firewall / router subnet isolation):
npx expo start --tunnel
```

### Step 4: Connecting from Mobile Device
1. Install **Expo Go** from Google Play Store or Apple App Store.
2. Ensure your phone and development PC are connected to the **same Wi-Fi network**.
3. Scan the QR code displayed in your terminal:
   - **Android:** Open Expo Go -> tap "Scan QR Code".
   - **iOS:** Open default Camera app -> tap the Expo banner.

---

## 🔑 Demo Login Credentials

Use these seeded accounts to log in on either the Web frontend or Mobile client:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@mechind.com` | `Admin@123` | Full system access, document upload, admin panel |
| **Technician** | `tech@mechind.com` | `Tech@123` | Diagnostics, chat troubleshooting, manuals search |
| **Manager** | `manager@mechmind.io` | `Manager123!` | Oversight, machines, manuals |

---

## 🛠 Troubleshooting & Common Issues

### 1. "Port 8000 / 3000 / 5432 is already in use"
Check and terminate the process holding the port:
- **Windows (PowerShell):**
  ```powershell
  # Find PID using port 8000
  Get-NetTCPConnection -LocalPort 8000 | Select-Object OwningProcess
  # Kill process by PID
  Stop-Process -Id <PID> -Force
  ```
- **Linux / macOS:**
  ```bash
  lsof -i :8000
  kill -9 <PID>
  ```

### 2. "Cannot connect to database / Connection refused at localhost:5432"
Ensure the PostgreSQL container is running:
```bash
docker compose up -d db
docker compose ps db
```

### 3. Mobile App: "Network request failed"
- Verify your phone and computer are on the **exact same Wi-Fi network**.
- Verify `mobile/.env` contains your actual machine LAN IP (e.g. `192.168.x.x:8000`), NOT `localhost`.
- Check Windows Defender Firewall or router isolation:
  - Temporarily allow port 8000 through the firewall.
  - Alternatively, run Expo in tunnel mode:
    ```bash
    cd mobile
    npx expo start --tunnel
    ```

### 4. PowerShell "Script execution disabled" on Windows
If activating `.venv\Scripts\Activate.ps1` produces an execution policy error:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

### 5. Local Ollama LLM / Embeddings
If you configured `LLM_PROVIDER=ollama` in `.env`:
1. Ensure Ollama is installed and running locally:
   ```bash
   ollama serve
   ```
2. Ensure the required model is pulled:
   ```bash
   ollama pull qwen3.5:9b
   # or whichever model is set in your OLLAMA_LLM_MODEL
   ```
