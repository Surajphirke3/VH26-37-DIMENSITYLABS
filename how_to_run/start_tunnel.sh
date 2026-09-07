#!/usr/bin/env bash
# ==============================================================================
# MEND - X | Cloudflare Tunnel Runner for Backend (macOS & Linux)
# Team: DIMENSITY LABS [VH26-37] - VCET HackC++thon 2026
# ==============================================================================

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "========================================================"
echo " 🌐 MEND - X | CLOUDFLARE TUNNEL FOR BACKEND (PORT 8000)"
echo "========================================================"

# --- 1. Check if backend is running on port 8000 ---
if ! lsof -ti :8000 >/dev/null 2>&1; then
    echo "⚠️  No process detected on port 8000."
    echo "   The Cloudflare tunnel connects to your FastAPI backend at http://localhost:8000."
    echo ""
    read -p "❓ Would you like to start the backend in the background now? [y/N]: " START_BACKEND
    if [[ "$START_BACKEND" =~ ^[Yy]$ ]]; then
        echo "🚀 Starting backend in background..."
        cd "$REPO_ROOT/backend"
        .venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
        sleep 3
        cd "$REPO_ROOT"
    else
        echo "Please start the backend before running the tunnel (e.g. ./how_to_run/start_localhost.sh)."
        exit 1
    fi
else
    echo "✅ Backend detected running on http://localhost:8000!"
fi

# --- 2. Check for cloudflared binary ---
CLOUDFLARED_BIN=""
if command -v cloudflared >/dev/null 2>&1; then
    CLOUDFLARED_BIN="$(command -v cloudflared)"
elif [ -x "/opt/homebrew/bin/cloudflared" ]; then
    CLOUDFLARED_BIN="/opt/homebrew/bin/cloudflared"
elif [ -x "/usr/local/bin/cloudflared" ]; then
    CLOUDFLARED_BIN="/usr/local/bin/cloudflared"
fi

if [ -z "$CLOUDFLARED_BIN" ]; then
    echo "❌ 'cloudflared' command-line tool is not installed."
    echo ""
    echo "To install on macOS (Homebrew):"
    echo "   brew install cloudflared"
    echo ""
    echo "To install on Linux (Debian/Ubuntu):"
    echo "   curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb"
    echo "   sudo dpkg -i cloudflared.deb"
    echo ""
    exit 1
fi

echo "🔍 Found cloudflared at: $CLOUDFLARED_BIN"
echo ""
echo "========================================================"
echo " 📡 STARTING PUBLIC SECURE TUNNEL..."
echo "========================================================"
echo " Cloudflare will generate a public URL below, e.g.:"
echo " 🔗 https://xxxx-xxxx-xxxx.trycloudflare.com"
echo ""
echo " 📝 NEXT STEPS ONCE YOU GET YOUR URL:"
echo " 1. Update Vercel Environment Variables:"
echo "    NEXT_PUBLIC_API_URL = https://your-tunnel.trycloudflare.com"
echo "    INTERNAL_API_URL    = https://your-tunnel.trycloudflare.com"
echo ""
echo " 2. Add your tunnel URL to CORS_ORIGINS in .env so requests aren't blocked:"
echo "    CORS_ORIGINS=[\"http://localhost:3000\",\"https://your-tunnel.trycloudflare.com\",...]"
echo ""
echo " 3. For Mobile Expo (Physical device):"
echo "    Set EXPO_PUBLIC_API_URL = https://your-tunnel.trycloudflare.com in mobile/.env"
echo "========================================================"
echo ""

# Execute cloudflared tunnel
exec "$CLOUDFLARED_BIN" tunnel --url http://localhost:8000
