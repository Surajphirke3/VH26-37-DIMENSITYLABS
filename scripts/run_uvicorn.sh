#!/usr/bin/env bash
# ==============================================================================
# MEND - X | Local FastAPI / Uvicorn Development Server
# Team: DIMENSITY LABS [VH26-37] - VCET HackC++thon 2026
# ==============================================================================

set -e

# Change to repository root
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$REPO_ROOT/backend"

echo "========================================================"
echo " 🚀 MEND - X FastAPI / Uvicorn Server"
echo "========================================================"

cd "$BACKEND_DIR"

# 1. Environment check
if [ ! -f "$REPO_ROOT/.env" ] && [ -f "$REPO_ROOT/.env.example" ]; then
    echo "⚠️  .env not found in root! Creating from .env.example..."
    cp "$REPO_ROOT/.env.example" "$REPO_ROOT/.env"
fi

# 2. Virtual environment setup
VENV_DIR="$BACKEND_DIR/.venv"
if [ ! -d "$VENV_DIR" ]; then
    echo "📦 Creating backend Python virtual environment in backend/.venv..."
    python3 -m venv "$VENV_DIR"
    echo "📥 Installing dependencies from requirements.txt..."
    "$VENV_DIR/bin/pip" install --upgrade pip
    "$VENV_DIR/bin/pip" install -r "$BACKEND_DIR/requirements.txt"
fi

# Source virtualenv
source "$VENV_DIR/bin/activate"

# 3. Ensure PostgreSQL (pgvector) and Redis are running
if ! nc -z localhost 5432 2>/dev/null; then
    echo "🐘 PostgreSQL is not running on localhost:5432."
    echo "🐳 Starting PostgreSQL (pgvector) and Redis via Docker..."
    cd "$REPO_ROOT"
    docker compose up -d db redis
    cd "$BACKEND_DIR"
    echo "⏳ Waiting for PostgreSQL to be ready..."
    until nc -z localhost 5432 2>/dev/null; do
        sleep 1
    done
    echo "✅ Database is ready!"
fi

PORT="${PORT:-8000}"
HOST="${HOST:-0.0.0.0}"

echo ""
echo "📡 Server Address : http://$HOST:$PORT"
echo "📖 Swagger API Docs: http://localhost:$PORT/docs"
echo "📖 ReDoc Docs      : http://localhost:$PORT/redoc"
echo "🔄 Hot Reloading   : Enabled"
echo ""
echo "Press Ctrl+C to stop the server."
echo "--------------------------------------------------------"

exec uvicorn app.main:app --host "$HOST" --port "$PORT" --reload
