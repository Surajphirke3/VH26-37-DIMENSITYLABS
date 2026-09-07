#!/usr/bin/env bash
# ==============================================================================
# MEND - X | System Health & Services Diagnostic Checker
# Team: DIMENSITY LABS [VH26-37] - VCET HackC++thon 2026
# ==============================================================================

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# Text styles
BOLD="\033[1m"
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[0;33m"
CYAN="\033[0;36m"
RESET="\033[0m"

echo -e "${BOLD}${CYAN}========================================================${RESET}"
echo -e "${BOLD}${CYAN} 🔍 MEND - X | SYSTEM STATUS & HEALTH CHECK${RESET}"
echo -e "${BOLD}${CYAN}========================================================${RESET}"

# 1. Check Docker
echo -n "🐳 Docker Engine: "
if docker info >/dev/null 2>&1; then
    echo -e "${GREEN}Running ✅${RESET}"
else
    echo -e "${RED}NOT RUNNING ❌${RESET}"
fi

# 2. Check PostgreSQL (5432)
echo -n "🐘 PostgreSQL (Port 5432): "
if nc -z localhost 5432 2>/dev/null || lsof -ti :5432 >/dev/null 2>&1; then
    echo -e "${GREEN}Active on localhost:5432 ✅${RESET}"
else
    echo -e "${RED}Inactive ❌ (Run: docker compose up -d db)${RESET}"
fi

# 3. Check Redis (6379)
echo -n "⚡ Redis Cache (Port 6379): "
if nc -z localhost 6379 2>/dev/null || lsof -ti :6379 >/dev/null 2>&1; then
    echo -e "${GREEN}Active on localhost:6379 ✅${RESET}"
else
    echo -e "${RED}Inactive ❌ (Run: docker compose up -d redis)${RESET}"
fi

# 4. Check FastAPI Backend (8000)
echo -n "📡 FastAPI Backend (Port 8000): "
BACKEND_HEALTH=$(curl -s http://localhost:8000/api/v1/health 2>/dev/null || curl -s http://localhost:8000/health 2>/dev/null || true)
if [ -n "$BACKEND_HEALTH" ]; then
    echo -e "${GREEN}Healthy & Responding ✅${RESET}"
    echo -e "   Response: ${CYAN}$BACKEND_HEALTH${RESET}"
else
    echo -e "${RED}Inactive ❌ (Run: ./how_to_run/start_localhost.sh)${RESET}"
fi

# 5. Check Next.js Frontend (3000)
echo -n "🌐 Next.js Frontend (Port 3000): "
if curl -s http://localhost:3000 >/dev/null 2>&1 || lsof -ti :3000 >/dev/null 2>&1; then
    echo -e "${GREEN}Active on http://localhost:3000 ✅${RESET}"
else
    echo -e "${YELLOW}Inactive ⚠️ (Run: cd frontend && npm run dev)${RESET}"
fi

# 6. Check Active AI Provider & Model
echo -n "🧠 Active AI Model: "
MODEL_RESP=$(curl -s http://localhost:8000/api/v1/models/active 2>/dev/null || true)
if [ -n "$MODEL_RESP" ]; then
    echo -e "${GREEN}$MODEL_RESP ✅${RESET}"
else
    echo -e "${YELLOW}Backend not reachable to fetch active model${RESET}"
fi

# 7. Check Cloudflare Tunnel
echo -n "🌐 Cloudflare Tunnel: "
if pgrep -f cloudflared >/dev/null 2>&1; then
    echo -e "${GREEN}Running in background ✅${RESET}"
else
    echo -e "${YELLOW}Not currently running (Run: ./how_to_run/start_tunnel.sh if needed)${RESET}"
fi

# 8. Check ADB (Android Phone)
echo -n "📱 Android Phone (ADB): "
if command -v adb >/dev/null 2>&1; then
    CONNECTED=$(adb devices | grep -E '\b(device)\b' || true)
    if [ -n "$CONNECTED" ]; then
        echo -e "${GREEN}Connected & Authorized ✅ ($CONNECTED)${RESET}"
    else
        echo -e "${YELLOW}ADB available, no authorized device connected.${RESET}"
    fi
else
    echo -e "${YELLOW}ADB not installed in PATH.${RESET}"
fi

echo -e "${BOLD}${CYAN}========================================================${RESET}"
echo -e "💡 To start everything locally, run: ${BOLD}./how_to_run/start_localhost.sh${RESET}"
echo -e "💡 To start a tunnel for remote/mobile, run: ${BOLD}./how_to_run/start_tunnel.sh${RESET}"
echo -e "${BOLD}${CYAN}========================================================${RESET}"
