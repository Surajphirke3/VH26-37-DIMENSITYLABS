# ==============================================================================
# MEND - X | Android USB Cable Simulator / Device Helper
# Team: DIMENSITY LABS [VH26-37] - VCET HackC++thon 2026
# ==============================================================================

$adb = "C:\Users\Suraj\AppData\Local\Android\Sdk\platform-tools\adb.exe"
if (-not (Test-Path $adb)) {
    $adb = "adb"
}

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " 📱 Android USB Device Connector" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

Write-Host "🔍 Checking connected Android devices via ADB..." -ForegroundColor Yellow
$devices = & $adb devices

$deviceLines = $devices | Where-Object { $_ -match "\t(device|unauthorized|offline)" }

if (-not $deviceLines) {
    Write-Host ""
    Write-Host "❌ No Android device detected over USB cable." -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check these 4 steps on your phone:" -ForegroundColor Yellow
    Write-Host "  1. Settings -> About Phone -> Tap 'Build number' 7 times"
    Write-Host "  2. Settings -> Developer Options -> Turn ON 'USB Debugging'"
    Write-Host "  3. Change USB mode notification from 'Charging' to 'File Transfer (MTP)'"
    Write-Host "  4. Unlock your phone and tap 'Allow USB debugging' (Check 'Always allow')"
    Write-Host ""
    Write-Host "Then run this script again!" -ForegroundColor Cyan
    exit 1
}

if ($deviceLines -match "unauthorized") {
    Write-Host ""
    Write-Host "⚠️  Device detected but UNAUTHORIZED." -ForegroundColor Yellow
    Write-Host "   👉 Unlock your phone screen and tap 'Allow' on the USB Debugging popup!" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

Write-Host "✅ Android device connected and authorized!" -ForegroundColor Green
$deviceLines | ForEach-Object { Write-Host "   Device: $_" -ForegroundColor Green }

Write-Host ""
Write-Host "🔄 Setting up USB port forwarding (Reverse Tunneling)..." -ForegroundColor Yellow
& $adb reverse tcp:8081 tcp:8081
& $adb reverse tcp:8000 tcp:8000
Write-Host "   - Port 8081 (Expo Metro Bundler) -> Forwarded ✅" -ForegroundColor Green
Write-Host "   - Port 8000 (FastAPI Backend)     -> Forwarded ✅" -ForegroundColor Green

Write-Host ""
Write-Host "🚀 Ready! Now in your Expo terminal (running 'npx expo start'), simply press 'a' to open the app on your phone." -ForegroundColor Cyan
