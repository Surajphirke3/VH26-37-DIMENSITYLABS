@echo off
REM ==============================================================================
REM MEND - X | Interactive Hub Menu (Windows)
REM Team: DIMENSITY LABS [VH26-37] - VCET HackC++thon 2026
REM ==============================================================================

setlocal enabledelayedexpansion
title MEND - X Teammate Launchpad

:MENU
cls
echo ========================================================
echo  [MEND - X] TEAMMATE LAUNCHPAD (Windows)
echo ========================================================
echo  [1] Start Localhost Stack (DB + Redis + Backend + Frontend)
echo  [2] Start Cloudflare Tunnel for Backend (Port 8000)
echo  [3] Connect Android Phone via USB (ADB Reverse Tunnel)
echo  [4] Ingest Sample OEM Manuals (RAG Knowledge Base)
echo  [5] Kill Any Processes on Port 8000
echo  [0] Exit
echo ========================================================
set /p OPTION="Select an option [0-5]: "

if "%OPTION%"=="1" (
    call "%~dp0start_localhost.bat"
    goto MENU
)
if "%OPTION%"=="2" (
    call "%~dp0start_tunnel.bat"
    goto MENU
)
if "%OPTION%"=="3" (
    call "%~dp0connect_phone.bat"
    goto MENU
)
if "%OPTION%"=="4" (
    cd /d "%~dp0\.."
    backend\.venv\Scripts\python ingest.py --pdf sinamics_g120.pdf --machine_id sinamics_g120 --manual_name "Siemens SINAMICS G120"
    pause
    goto MENU
)
if "%OPTION%"=="5" (
    for /f "tokens=5" %%a in ('netstat -aon ^| find ":8000" ^| find "LISTENING"') do taskkill /f /pid %%a
    echo Port 8000 freed!
    pause
    goto MENU
)
if "%OPTION%"=="0" exit /b 0

goto MENU
