# 🚀 MEND - X | Complete Project & Ingestion Pipeline Run Guide

This markdown document provides end-to-end instructions for running the **MEND - X** system:
- **Backend API & AI Engine** (FastAPI, pgvector, ChromaDB, Groq/Gemini/Ollama)
- **Infrastructure Services** (PostgreSQL pgvector + Redis)
- **Manual Ingestion & RAG Pipeline** (PDF Parsing, Metadata Extraction, Chunking, Embedding)
- **Cloudflare Tunnel** (Exposing backend for remote access & mobile)
- **Frontend Dashboard** (Next.js 16)
- **Mobile Client** (Expo / React Native)

---

## 📋 Table of Contents
1. [Architecture & Port Overview](#1-architecture--port-overview)
2. [Prerequisites](#2-prerequisites)
3. [Environment Configuration (.env)](#3-environment-configuration-env)
4. [Step 1: Start Infrastructure (Docker)](#step-1-start-infrastructure-docker)
5. [Step 2: Database Migration & Seeding](#step-2-database-migration--seeding)
6. [Step 3: Run FastAPI Backend](#step-3-step-3-run-fastapi-backend)
7. [Step 4: Expose Backend via Cloudflare Tunnel](#step-4-expose-backend-via-cloudflare-tunnel)
8. [Step 5: Run Ingestion & RAG Pipeline](#step-5-run-ingestion--rag-pipeline)
   - [Option A: Automated CLI Ingestion (`ingest.py`)](#option-a-automated-cli-ingestion-ingestpy)
   - [Option B: Web Dashboard UI Ingestion](#option-b-web-dashboard-ui-ingestion)
   - [Option C: Test & Verification Scripts](#option-c-test--verification-scripts)
9. [Step 6: Run Frontend Web App](#step-6-run-frontend-web-app)
10. [Step 7: Run Mobile App (Expo)](#step-7-run-mobile-app-expo)
11. [Troubleshooting & Common Fixes](#troubleshooting--common-fixes)

---

## 1. Architecture & Port Overview

| Service | Host Port | Internal URL | Purpose |
| :--- | :--- | :--- | :--- |
| **PostgreSQL + pgvector** | `5432` | `postgresql+asyncpg://mechind:mechind_dev@localhost:5432/mechind` | Relational tables & vector embeddings |
| **Redis** | `6379` | `redis://localhost:6379/0` | High-speed cache & rate limiting |
| **FastAPI Backend** | `8000` | `http://localhost:8000` | REST API, Ingestion, RAG Query engine |
| **Swagger UI Docs** | `8000` | `http://localhost:8000/api/docs` | Interactive API documentation |
| **Next.js Frontend** | `3000` | `http://localhost:3000` | Responsive web dashboard & pipeline tracker |
| **Expo Metro Bundler**| `8081` | `http://localhost:8081` | Mobile client app bundler |
| **ChromaDB** | Local | `backend/chroma_db/` | Embedded Chroma vector store fallback |

---

## 2. Prerequisites

- **Docker Desktop** (running and healthy)
- **Python 3.11+** (virtual environment inside `backend/.venv`)
- **Node.js 18+** & `npm`
- **cloudflared CLI** (Installed via `brew install cloudflared` on macOS)

---

## 3. Environment Configuration (`.env`)

Ensure you have a `.env` file at the root of the workspace. A template is available in `.env.example`:

```bash
cp .env.example .env
```

Key variables to verify:
```dotenv
# Database
POSTGRES_USER=mechind
POSTGRES_PASSWORD=mechind_dev
POSTGRES_DB=mechind
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
DATABASE_URL=postgresql+asyncpg://mechind:mechind_dev@localhost:5432/mechind

# Redis
REDIS_URL=redis://localhost:6379/0

# AI Provider API Keys
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
DEFAULT_LLM_PROVIDER=groq

# Ingestion / Storage
CHROMA_PERSIST_DIRECTORY=./chroma_db
UPLOAD_DIR=./uploads
```

---

## Step 1: Start Infrastructure (Docker)

Start the PostgreSQL vector database and Redis containers:

```bash
docker compose up -d db redis
```

Verify containers are healthy:
```bash
docker compose ps
```

---

## Step 2: Database Migration & Seeding

Navigate to the `backend` directory and activate the virtual environment:

### macOS / Linux:
```bash
cd backend
source .venv/bin/activate
```

### Windows (PowerShell):
```powershell
cd backend
.\.venv\Scripts\Activate.ps1
```

### Apply Database Migrations:
```bash
alembic upgrade head
```

### Seed Demo Users, Machines, and Sample Data:
```bash
python scripts/seed.py
```
*(Creates initial machines like Siemens SINAMICS G120, S120, and Allen-Bradley PowerFlex 755).*

---

## Step 3: Run FastAPI Backend

Start the FastAPI backend with live reload:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Verify Backend Health:
Open a browser or run:
```bash
curl http://localhost:8000/api/v1/health
```
Expected response:
```json
{"status":"healthy","version":"3.0.0","environment":"development"}
```

Access API Documentation:
- Swagger UI: [http://localhost:8000/api/docs](http://localhost:8000/api/docs)
- ReDoc: [http://localhost:8000/api/redoc](http://localhost:8000/api/redoc)

---

## Step 4: Expose Backend via Cloudflare Tunnel

To enable remote access, mobile client testing, or public webhooks:

```bash
cloudflared tunnel --url http://localhost:8000
```

Cloudflare will generate a public URL in the terminal, for example:
```text
https://associated-metallica-third-spent.trycloudflare.com
```

> **Note:** If you are testing the mobile app or remote frontend, update `NEXT_PUBLIC_API_URL` or the mobile `.env` with this HTTPS URL.

---

## Step 5: Run Ingestion & RAG Pipeline

The ingestion pipeline processes industrial manuals through 5 stages:
1. **PDF Text & Table Extraction** (PyMuPDF / pdfplumber)
2. **Auto-Metadata Extraction** (Machine model, serial regex, fault codes)
3. **Semantic Hierarchy Chunking** (Structural headers, error tables)
4. **Local Embedding Generation** (`BAAI/bge-small-en-v1.5` via FastEmbed)
5. **Dual Persistence** (PostgreSQL pgvector + ChromaDB collection)

### Option A: Automated CLI Ingestion (`ingest.py`)

Run the ingestion CLI from the project root using the backend virtual environment:

#### Ingest Siemens SINAMICS G120:
```bash
backend/.venv/bin/python ingest.py --pdf sinamics_g120.pdf --machine_id sinamics_g120 --manual_name "Siemens SINAMICS G120"
```

#### Ingest Siemens SINAMICS S120:
```bash
backend/.venv/bin/python ingest.py --pdf sinamics_s120.pdf --machine_id sinamics_s120 --manual_name "Siemens SINAMICS S120"
```

#### Ingest Allen-Bradley PowerFlex 755:
```bash
backend/.venv/bin/python ingest.py --pdf powerflex_755.pdf --machine_id powerflex_755 --manual_name "Allen-Bradley PowerFlex 755"
```

### Option B: Web Dashboard UI Ingestion

1. Start Frontend (see Step 6).
2. Open [`http://localhost:3000/upload`](http://localhost:3000/upload).
3. Drag and drop any PDF manual.
4. Watch the real-time **Execution Pipeline Tracker** as it parses, chunks, and indexes the document.

### Option C: Test & Verification Scripts

Run the end-to-end RAG verification test:
```bash
cd backend
python scripts/run_rag_demo.py
```

Run test suite:
```bash
cd backend
pytest -m "not integration" -q
```

---

## Step 6: Run Frontend Web App

In a separate terminal:

```bash
cd frontend
npm install   # If running for the first time
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser:
- **Triage & Diagnosis**: `/query` or `/dashboard`
- **Manual Upload & Pipeline**: `/upload`
- **Machines Overview**: `/machines`

---

## Step 7: Run Mobile App (Expo)

In a separate terminal:

```bash
cd mobile
npm install   # If running for the first time
npx expo start
```

- Press `a` for Android Emulator
- Press `i` for iOS Simulator
- Scan the QR code using the **Expo Go** mobile app on a physical device

---

## Troubleshooting & Common Fixes

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| `Connection refused: localhost:5432` | Docker DB not running | Run `docker compose up -d db` |
| `alembic: command not found` | Virtualenv inactive | Run `source backend/.venv/bin/activate` |
| `requests module not found` in `ingest.py` | Wrong Python interpreter | Run with `backend/.venv/bin/python ingest.py ...` |
| `QUIC connection failed` in Cloudflared | UDP blocked on network | Cloudflared will automatically fallback to HTTP/2 TCP |
| Ingestion memory issues on large PDFs | Large batch size | The pipeline auto-flushes every 10 chunks with `batch_size=30` |
