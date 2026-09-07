@echo off
REM ==============================================================================
REM MEND - X | Android USB Phone Connector (Windows)
REM Team: DIMENSITY LABS [VH26-37] - VCET HackC++thon 2026
REM ==============================================================================

setlocal enabledelayedexpansion
title MEND - X Android Phone Connector

set "ADB=adb"
where adb >nul 2>nul
if %errorlevel% neq 0 (
    if exist "%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" (
        set "ADB=%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe"
    ) else (
        echo [ERROR] ADB is not found in PATH or standard Android SDK location.
        echo Please install Android platform-tools or run:
        echo   winget install Google.PlatformTools
        pause
        exit /b 1
    )
)

echo ========================================================
echo  [MEND - X] Android USB Device Connector
echo ========================================================

"%ADB%" devices

echo.
echo [INFO] Forwarding ports over USB reverse tunnel...
"%ADB%" reverse tcp:8081 tcp:8081
"%ADB%" reverse tcp:8000 tcp:8000
echo  - Port 8081 (Expo)    -^> Forwarded!
echo  - Port 8000 (Backend) -^> Forwarded!

echo.
echo If your device showed up above, in your Expo terminal press 'a'!
echo.
pause
