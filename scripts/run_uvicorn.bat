@echo off
REM ==============================================================================
REM MEND - X | Local FastAPI / Uvicorn Server (Windows Batch)
REM Team: DIMENSITY LABS [VH26-37] - VCET HackC++thon 2026
REM ==============================================================================

setlocal enabledelayedexpansion

set "REPO_ROOT=%~dp0.."
set "BACKEND_DIR=%REPO_ROOT%\backend"
set "VENV_DIR=%BACKEND_DIR%\.venv"

echo ========================================================
echo  FastAPI / Uvicorn Server (Windows)
echo ========================================================

cd /d "%BACKEND_DIR%"

if not exist "%VENV_DIR%\Scripts\python.exe" (
    echo [ERROR] Virtual environment not found in %VENV_DIR%
    pause
    exit /b 1
)

echo [*] Running database migrations...
"%VENV_DIR%\Scripts\alembic.exe" upgrade head

echo.
echo [*] Starting Uvicorn on http://0.0.0.0:8000...
echo [*] Swagger API Docs: http://localhost:8000/docs
echo [*] Health Check    : http://localhost:8000/api/v1/health
echo.

"%VENV_DIR%\Scripts\uvicorn.exe" app.main:app --reload --host 0.0.0.0 --port 8000
