@echo off
REM ==============================================================================
REM MEND - X | Cloudflare Tunnel Runner for Backend (Windows)
REM Team: DIMENSITY LABS [VH26-37] - VCET HackC++thon 2026
REM ==============================================================================

setlocal enabledelayedexpansion
title MEND - X Cloudflare Tunnel

echo ========================================================
echo  [MEND - X] Cloudflare Tunnel for Backend (Port 8000)
echo ========================================================

REM Find repository root
cd /d "%~dp0\.."

REM Check if cloudflared is installed
where cloudflared >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] 'cloudflared' command was not found.
    echo.
    echo To install cloudflared on Windows via winget:
    echo   winget install Cloudflare.cloudflared
    echo.
    echo Or download directly from:
    echo   https://github.com/cloudflare/cloudflared/releases/latest
    echo.
    pause
    exit /b 1
)

echo [INFO] Starting Cloudflare Tunnel to http://localhost:8000...
echo.
echo ========================================================
echo  Look below for the generated URL:
echo  https://xxxx-xxxx-xxxx.trycloudflare.com
echo.
echo  1. Add this URL to Vercel Environment Variables:
echo     NEXT_PUBLIC_API_URL = https://your-tunnel.trycloudflare.com
echo     INTERNAL_API_URL    = https://your-tunnel.trycloudflare.com
echo.
echo  2. Add to CORS_ORIGINS in .env
echo ========================================================
echo.

cloudflared tunnel --url http://localhost:8000
pause
