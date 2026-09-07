#!/usr/bin/env bash
# ==============================================================================
# MEND - X | Interactive Hub Menu (macOS & Linux)
# Team: DIMENSITY LABS [VH26-37] - VCET HackC++thon 2026
# ==============================================================================

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$DIR/.." && pwd)"

while true; do
    clear 2>/dev/null || true
    echo "========================================================"
    echo " 🛠  MEND - X | TEAMMATE LAUNCHPAD"
    echo "========================================================"
    echo " [1] 🏠 Start Localhost Stack (DB + Redis + Backend + Frontend)"
    echo " [2] 🌐 Start Cloudflare Tunnel for Backend (Port 8000)"
    echo " [3] 📱 Connect Android Phone via USB (ADB Reverse Tunnel)"
    echo " [4] 🔍 Check System Health & Running Services"
    echo " [5] 📚 Ingest Sample OEM Manuals (RAG Knowledge Base)"
    echo " [6] 🛑 Kill Any Processes on Ports 8000 & 3000"
    echo " [0] 🚪 Exit"
    echo "========================================================"
    read -p " Select an option [0-6]: " OPTION

    case "$OPTION" in
        1)
            echo ""
            "$DIR/start_localhost.sh"
            ;;
        2)
            echo ""
            "$DIR/start_tunnel.sh"
            ;;
        3)
            echo ""
            "$DIR/connect_phone.sh"
            read -p "Press Enter to continue..."
            ;;
        4)
            echo ""
            "$DIR/check_system.sh"
            read -p "Press Enter to continue..."
            ;;
        5)
            echo ""
            echo "Processing manuals..."
            cd "$REPO_ROOT"
            backend/.venv/bin/python ingest.py --pdf sinamics_g120.pdf --machine_id sinamics_g120 --manual_name "Siemens SINAMICS G120" || true
            backend/.venv/bin/python ingest.py --pdf sinamics_s120.pdf --machine_id sinamics_s120 --manual_name "Siemens SINAMICS S120" || true
            backend/.venv/bin/python ingest.py --pdf powerflex_755.pdf --machine_id powerflex_755 --manual_name "Allen-Bradley PowerFlex 755" || true
            read -p "Press Enter to continue..."
            ;;
        6)
            echo ""
            echo "🧹 Clearing ports 8000 and 3000..."
            kill -9 $(lsof -ti :8000) 2>/dev/null || echo "Port 8000 was free."
            kill -9 $(lsof -ti :3000) 2>/dev/null || echo "Port 3000 was free."
            echo "✅ Done."
            read -p "Press Enter to continue..."
            ;;
        0|q|Q)
            echo "Goodbye!"
            exit 0
            ;;
        *)
            echo "Invalid option. Please choose 0-6."
            sleep 1
            ;;
    esac
done
