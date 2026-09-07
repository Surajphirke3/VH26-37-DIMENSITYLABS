@echo off
REM ==============================================================================
REM MEND - X | Start Full Localhost Stack (Windows)
REM Team: DIMENSITY LABS [VH26-37] - VCET HackC++thon 2026
REM ==============================================================================

setlocal enabledelayedexpansion
title MEND - X Localhost Stack

echo ========================================================
echo  [MEND - X] Starting Localhost Stack (Windows)
echo ========================================================

REM Find repository root
cd /d "%~dp0\.."

REM Check .env file
if not exist ".env" (
    if exist ".env.example" (
        echo [INFO] Creating .env from .env.example...
        copy .env.example .env >nul
    ) else (
        echo [ERROR] .env file not found. Please create one.
        pause
        exit /b 1
    )
)

REM Check Docker for DB & Redis
echo [INFO] Checking Docker containers for DB and Redis...
docker compose up -d db redis
if %errorlevel% neq 0 (
    echo [WARNING] Docker Compose had an issue or Docker is not running.
    echo Please make sure Docker Desktop is running!
)

REM Setup backend virtualenv if needed
if not exist "backend\.venv" (
    echo [INFO] Creating Python virtual environment in backend\.venv...
    python -m venv backend\.venv
    call backend\.venv\Scripts\activate.bat
    python -m pip install --upgrade pip
    pip install -r backend\requirements.txt
) else (
    call backend\.venv\Scripts\activate.bat
)

REM Check frontend node_modules
if not exist "frontend\node_modules" (
    echo [INFO] Installing frontend npm packages...
    cd frontend
    call npm install
    cd ..
)

echo.
echo ========================================================
echo  Launching FastAPI Backend in a new window...
echo ========================================================
start "MEND-X Backend (Port 8000)" cmd /k "cd backend && call .venv\Scripts\activate.bat && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo.
echo ========================================================
echo  Launching Next.js Frontend in a new window...
echo ========================================================
start "MEND-X Frontend (Port 3000)" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo  SUCCESS! Both Backend and Frontend are launching!
echo  - Frontend : http://localhost:3000
echo  - Backend  : http://localhost:8000
echo  - API Docs : http://localhost:8000/docs
echo ========================================================
echo.
pause
