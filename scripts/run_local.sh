#!/usr/bin/env bash
# ==============================================================================
# MEND - X | Run Both Backend & Frontend Concurrently (Local Dev)
# Team: DIMENSITY LABS [VH26-37] - VCET HackC++thon 2026
# ==============================================================================

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "========================================================"
echo " 🛠 Starting MEND - X Local Full-Stack (Backend + Frontend)"
echo "========================================================"

# Trap Ctrl+C to kill both background jobs
cleanup() {
    echo ""
    echo "🛑 Shutting down backend and frontend..."
    kill $(jobs -p) 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 1. Start Backend in background
echo "🚀 Starting FastAPI Backend on http://localhost:8000..."
./scripts/run_uvicorn.sh &
BACKEND_PID=$!

# Wait briefly for backend to initialize
sleep 2

# 2. Start Frontend
echo "🌐 Starting Next.js Frontend on http://localhost:3000..."
cd "$REPO_ROOT/frontend"
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend npm dependencies..."
    npm install
fi

npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Both services running!"
echo "   - Frontend : http://localhost:3000"
echo "   - Backend  : http://localhost:8000"
echo "   - API Docs : http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both."

wait
