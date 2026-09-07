#!/usr/bin/env bash
# ==============================================================================
# MEND - X | Start Full Localhost Stack (macOS & Linux)
# Team: DIMENSITY LABS [VH26-37] - VCET HackC++thon 2026
# ==============================================================================

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "========================================================"
echo " 🛠  MEND - X | LOCALHOST STACK RUNNER"
echo "========================================================"

# --- 1. Trap signals to clean up background processes ---
cleanup() {
    echo ""
    echo "🛑 Shutting down local services..."
    kill $(jobs -p) 2>/dev/null || true
    echo "✅ Shutdown complete."
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# --- 2. Environment check ---
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo "⚠️  .env not found! Generating from .env.example..."
        cp .env.example .env
        echo "✅ Created .env"
    else
        echo "❌ Error: .env file missing in project root."
        exit 1
    fi
fi

# Ensure LLM_PROVIDER is groq if not explicitly set
if ! grep -q "^LLM_PROVIDER=" .env; then
    echo "LLM_PROVIDER=groq" >> .env
fi

# --- 3. Port conflict check ---
check_port() {
    local port=$1
    local name=$2
    if lsof -ti :"$port" >/dev/null 2>&1; then
        echo "⚠️  Port $port ($name) is currently in use."
        echo "   Terminating previous process holding port $port..."
        kill -9 $(lsof -ti :"$port") 2>/dev/null || true
        sleep 1
    fi
}

check_port 8000 "FastAPI Backend"
check_port 3000 "Next.js Frontend"

# --- 4. Docker Database & Redis check ---
echo "🔍 Checking PostgreSQL and Redis..."
if ! docker info >/dev/null 2>&1; then
    echo "⚠️  Docker is not running or not installed."
    echo "   Please make sure Docker Desktop is running to enable PostgreSQL + Redis."
else
    echo "🐳 Starting PostgreSQL (pgvector) and Redis in Docker..."
    docker compose up -d db redis
    echo "✅ Containers running (Postgres on 5432, Redis on 6379)."
fi

# --- 5. Backend Preparation ---
BACKEND_DIR="$REPO_ROOT/backend"
VENV_DIR="$BACKEND_DIR/.venv"

echo "🐍 Checking backend Python environment..."
if [ ! -d "$VENV_DIR" ]; then
    echo "📦 Creating virtual environment in backend/.venv..."
    python3 -m venv "$VENV_DIR"
    echo "📥 Installing backend requirements..."
    "$VENV_DIR/bin/pip" install --upgrade pip
    "$VENV_DIR/bin/pip" install -r "$BACKEND_DIR/requirements.txt"
fi

# --- 6. Frontend Preparation ---
FRONTEND_DIR="$REPO_ROOT/frontend"
echo "🌐 Checking frontend Node dependencies..."
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo "📦 Installing frontend npm packages..."
    (cd "$FRONTEND_DIR" && npm install)
fi

# --- 7. Start FastAPI Backend ---
echo "🚀 Starting FastAPI Backend on http://localhost:8000..."
cd "$BACKEND_DIR"
"$VENV_DIR/bin/uvicorn" app.main:app --host 0.0.0.0 --port 8000 --reload --log-level info &
BACKEND_PID=$!

# Wait for backend to be ready
echo "⏳ Waiting for backend to initialize..."
for i in {1..30}; do
    if curl -s http://localhost:8000/api/v1/health >/dev/null 2>&1 || curl -s http://localhost:8000/health >/dev/null 2>&1; then
        echo "✅ Backend is healthy on http://localhost:8000!"
        break
    fi
    sleep 1
done

# --- 8. Start Next.js Frontend ---
echo "🚀 Starting Next.js Frontend on http://localhost:3000..."
cd "$FRONTEND_DIR"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "========================================================"
echo " 🎉 ALL LOCALHOST SERVICES ARE RUNNING!"
echo "========================================================"
echo " 🌐 Frontend Web App  : http://localhost:3000"
echo " 📡 FastAPI REST API  : http://localhost:8000"
echo " 📖 Interactive Docs  : http://localhost:8000/docs"
echo " 🐘 PostgreSQL DB     : localhost:5432"
echo " ⚡ Redis Cache       : localhost:6379"
echo "========================================================"
echo " Press Ctrl+C at any time to gracefully stop all services."
echo ""

wait
