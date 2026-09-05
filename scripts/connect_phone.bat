@echo off
REM ==============================================================================
REM MEND - X | Android USB Device Connector (Batch)
REM Team: DIMENSITY LABS [VH26-37] - VCET HackC++thon 2026
REM ==============================================================================

set "ADB=C:\Users\Suraj\AppData\Local\Android\Sdk\platform-tools\adb.exe"

echo ========================================================
echo  Android USB Device Connector
echo ========================================================

"%ADB%" devices

echo.
echo Forwarding ports over USB...
"%ADB%" reverse tcp:8081 tcp:8081
"%ADB%" reverse tcp:8000 tcp:8000

echo.
echo If your device showed up above, press 'a' in your Expo terminal!
pause
