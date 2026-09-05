# ==============================================================================
# MEND - X | Local FastAPI / Uvicorn Development Server (PowerShell)
# Team: DIMENSITY LABS [VH26-37] - VCET HackC++thon 2026
# ==============================================================================

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent $ScriptDir
$BackendDir = Join-Path $RepoRoot "backend"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " 🚀 MEND - X FastAPI / Uvicorn Server" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

# 1. Environment check
if (-not (Test-Path "$RepoRoot\.env") -and (Test-Path "$RepoRoot\.env.example")) {
    Write-Host "⚠️  .env not found in root! Creating from .env.example..." -ForegroundColor Yellow
    Copy-Item "$RepoRoot\.env.example" "$RepoRoot\.env"
}

# 2. Virtual environment setup
$VenvDir = Join-Path $BackendDir ".venv"
$PythonExe = Join-Path $VenvDir "Scripts\python.exe"
$UvicornExe = Join-Path $VenvDir "Scripts\uvicorn.exe"

if (-not (Test-Path $PythonExe)) {
    Write-Host "📦 Creating backend Python virtual environment in backend\.venv..." -ForegroundColor Yellow
    python -m venv $VenvDir
    Write-Host "📥 Installing dependencies from requirements.txt..." -ForegroundColor Yellow
    & $PythonExe -m pip install --upgrade pip
    & $PythonExe -m pip install -r "$BackendDir\requirements.txt"
}

# 3. Check Docker containers
$dockerRunning = docker compose ps --status running -q db 2>$null
if (-not $dockerRunning) {
    Write-Host "🐘 PostgreSQL/Redis containers are not running. Starting via docker compose..." -ForegroundColor Yellow
    Push-Location $RepoRoot
    docker compose up -d db redis
    Pop-Location
}

# 4. Check if port 8000 is already running
$portActive = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($portActive) {
    $existingPid = ($portActive | Select-Object -First 1).OwningProcess
    Write-Host "⚠️  Port 8000 is already in use by process ID: $existingPid." -ForegroundColor Yellow
    Write-Host "   If you want to restart, kill it with: Stop-Process -Id $existingPid -Force" -ForegroundColor Yellow
}

Set-Location $BackendDir

Write-Host "🔄 Running Alembic migrations..." -ForegroundColor Green
& $VenvDir\Scripts\alembic.exe upgrade head

$Port = if ($env:PORT) { $env:PORT } else { "8000" }
$HostAddr = if ($env:HOST) { $env:HOST } else { "0.0.0.0" }

Write-Host ""
Write-Host "📡 Server Address : http://${HostAddr}:${Port}" -ForegroundColor Green
Write-Host "📖 Swagger API Docs: http://localhost:$Port/docs" -ForegroundColor Green
Write-Host "📖 ReDoc Docs      : http://localhost:$Port/redoc" -ForegroundColor Green
Write-Host "🔄 Hot Reloading   : Enabled" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server." -ForegroundColor Gray
Write-Host "--------------------------------------------------------" -ForegroundColor Gray

& $UvicornExe app.main:app --host $HostAddr --port $Port --reload
