# The Gilded Fork - Joint Runner Script (Windows PowerShell)
# Launches both Next.js and the WebSocket socket-service concurrently

# Make sure we are in the root directory
$ProjectDir = Resolve-Path "$PSScriptRoot\.."
Set-Location $ProjectDir

Write-Host "==========================================" -ForegroundColor Emerald
Write-Host "   THE GILDED FORK RUNNER SYSTEM" -ForegroundColor Emerald
Write-Host "==========================================" -ForegroundColor Emerald
Write-Host ""

# Step 1: Install root dependencies if node_modules is missing
if (-not (Test-Path "node_modules")) {
    Write-Host "[Installer] Root node_modules not found. Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Step 2: Ensure database is generated/pushed
Write-Host "[Database] Aligning Prisma client schema..." -ForegroundColor Cyan
npx prisma generate

# Step 3: Start socket service in a separate window
Write-Host "[Socket] Launching WebSocket Server on port 3003 (in new console window)..." -ForegroundColor Cyan
$SocketServiceDir = Join-Path $ProjectDir "mini-services\socket-service"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "
    Write-Host '=== THE GILDED FORK: WebSocket Server ===' -ForegroundColor Magenta;
    cd '$SocketServiceDir';
    if (-not (Test-Path 'node_modules')) {
        Write-Host '[Installer] Installing socket-service dependencies...' -ForegroundColor Yellow;
        npm install;
    }
    Write-Host '[Socket] Running npx tsx index.ts...' -ForegroundColor Cyan;
    npm run dev:node;
"

# Step 4: Start Next.js development server in the current window
Write-Host "[Next.js] Launching Next.js Development Server on http://0.0.0.0:3000 (accessible on local network)..." -ForegroundColor Emerald
npx next dev -H 0.0.0.0 -p 3000
