#!/usr/bin/env bash
# ==============================================================================
# MEND - X | Docker Compose Orchestration Script
# Team: DIMENSITY LABS [VH26-37] - VCET HackC++thon 2026
# ==============================================================================

set -e

# Change to repository root
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "========================================================"
echo " 🔧 MEND - X Docker Compose Orchestration"
echo "========================================================"

# 1. Check for .env file
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo "⚠️  .env not found! Creating from .env.example..."
        cp .env.example .env
        echo "✅ Created .env. Please update API keys if needed."
    else
        echo "❌ Error: Neither .env nor .env.example found!"
        exit 1
    fi
fi

ACTION="${1:-up}"

case "$ACTION" in
    up|start)
        echo "🚀 Starting MEND - X stack (DB, Redis, API, Frontend)..."
        docker compose up -d
        echo ""
        echo "⏳ Waiting for services to initialize..."
        sleep 3
        docker compose ps
        echo ""
        echo "✅ Stack is running!"
        echo "   - Frontend: http://localhost:3000"
        echo "   - FastAPI Backend: http://localhost:8000"
        echo "   - API Docs: http://localhost:8000/docs"
        echo ""
        echo "Tip: Run './scripts/run_docker.sh logs' to follow live logs."
        ;;
    build|rebuild)
        echo "🔨 Rebuilding and starting all Docker containers..."
        docker compose up --build -d
        docker compose ps
        ;;
    down|stop)
        echo "🛑 Stopping all containers..."
        docker compose down
        echo "✅ All containers stopped."
        ;;
    down-v|clean)
        echo "⚠️  Stopping all containers and wiping volumes..."
        docker compose down -v
        echo "✅ Cleaned up containers and volumes."
        ;;
    logs)
        echo "📜 Streaming logs (Ctrl+C to exit)..."
        docker compose logs -f
        ;;
    migrate)
        echo "🔄 Running database migrations..."
        docker compose exec api alembic upgrade head
        ;;
    seed)
        echo "🌱 Seeding demo data..."
        docker compose exec api python scripts/seed.py
        ;;
    *)
        echo "Usage: $0 [up|build|down|down-v|logs|migrate|seed]"
        exit 1
        ;;
esac
