#!/usr/bin/env bash
# ==============================================================================
# MEND - X | Android USB Phone Connector & Port Forwarder (macOS & Linux)
# Team: DIMENSITY LABS [VH26-37] - VCET HackC++thon 2026
# ==============================================================================

# Search for ADB binary
ADB=""
if command -v adb >/dev/null 2>&1; then
    ADB="$(command -v adb)"
elif [ -x "$HOME/Library/Android/sdk/platform-tools/adb" ]; then
    ADB="$HOME/Library/Android/sdk/platform-tools/adb"
elif [ -x "/opt/homebrew/bin/adb" ]; then
    ADB="/opt/homebrew/bin/adb"
elif [ -x "/usr/local/bin/adb" ]; then
    ADB="/usr/local/bin/adb"
fi

echo "========================================================"
echo " 📱 MEND - X | ANDROID USB PHONE CONNECTOR"
echo "========================================================"

if [ -z "$ADB" ]; then
    echo "❌ ADB (Android Debug Bridge) is not installed."
    echo ""
    echo "To install ADB on macOS via Homebrew, run:"
    echo "   brew install --cask android-platform-tools"
    echo ""
    echo "To install ADB on Linux (Ubuntu/Debian):"
    echo "   sudo apt-get install android-tools-adb"
    echo ""
    exit 1
fi

echo "🔍 Using ADB at: $ADB"
echo "🔍 Checking connected Android devices..."
echo ""

DEVICES_OUTPUT="$("$ADB" devices)"
echo "$DEVICES_OUTPUT"

# Filter device lines
DEVICE_LINES=$(echo "$DEVICES_OUTPUT" | grep -E '\b(device|unauthorized|offline)\b')

if [ -z "$DEVICE_LINES" ]; then
    echo ""
    echo "❌ No Android device detected over USB cable."
    echo ""
    echo "Please check these 4 quick steps on your phone:"
    echo "  1. Settings -> About Phone -> Tap 'Build number' 7 times (Enables Developer Options)"
    echo "  2. Settings -> Developer Options -> Turn ON 'USB Debugging'"
    echo "  3. Change USB notification mode from 'Charging' to 'File Transfer (MTP)'"
    echo "  4. Unlock your phone screen and tap 'Allow USB debugging' (Check 'Always allow')"
    echo ""
    echo "Then run this script again!"
    exit 1
fi

if echo "$DEVICE_LINES" | grep -q "unauthorized"; then
    echo ""
    echo "⚠️  Device detected but UNAUTHORIZED."
    echo "   👉 Unlock your phone screen and tap 'Allow' on the USB Debugging popup!"
    echo ""
    exit 1
fi

echo ""
echo "✅ Android device connected and authorized!"
echo ""
echo "🔄 Setting up USB reverse port forwarding..."
"$ADB" reverse tcp:8081 tcp:8081
"$ADB" reverse tcp:8000 tcp:8000
echo "   - Port 8081 (Expo Metro Bundler) -> Forwarded to phone ✅"
echo "   - Port 8000 (FastAPI Backend)     -> Forwarded to phone ✅"
echo ""
echo "========================================================"
echo " 🚀 READY FOR MOBILE TESTING!"
echo " In another terminal, run:"
echo "   cd mobile && npx expo start"
echo " Then press 'a' in your terminal to open the app on your phone!"
echo "========================================================"
