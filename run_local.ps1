# Master Start Script for Techwell LMS

Write-Host "Starting Techwell LMS Setup..." -ForegroundColor Cyan

# 1. Check for Node.js
$npmCommand = Get-Command npm.cmd -ErrorAction SilentlyContinue
if (-not $npmCommand) {
    Write-Host "Error: npm.cmd not found. Please install Node.js." -ForegroundColor Red
    exit
}

# 2. Check for PostgreSQL (Common service names)
$pgService = Get-Service | Where-Object { $_.Name -like "*postgres*" }
if ($pgService) {
    if ($pgService.Status -ne 'Running') {
        Write-Host "Starting PostgreSQL service ($($pgService.Name))..." -ForegroundColor Yellow
        Start-Service $pgService.Name -ErrorAction SilentlyContinue
    } else {
        Write-Host "PostgreSQL service ($($pgService.Name)) is running." -ForegroundColor Green
    }
} else {
    Write-Host "Warning: PostgreSQL service not found. Ensure it is running manually." -ForegroundColor Yellow
}

# 3. Setup Backend
Write-Host "Installing Backend Dependencies..." -ForegroundColor Cyan
Push-Location backend
& $npmCommand.Source install
Write-Host "Preparing Database (Prisma)..." -ForegroundColor Cyan
& $npmCommand.Source run db:prepare
Pop-Location

# 4. Install Frontend Dependencies
Write-Host "Installing Frontend Dependencies..." -ForegroundColor Cyan
Push-Location frontend
& $npmCommand.Source install
Pop-Location

# 5. Start Servers in new windows
Write-Host "Starting Servers..." -ForegroundColor Green

# Start Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\backend'; npm.cmd run dev" -WindowStyle Normal
Write-Host "Backend starting in a new window..." -ForegroundColor Gray

# Start Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\frontend'; npm.cmd run dev" -WindowStyle Normal
Write-Host "Frontend starting in a new window..." -ForegroundColor Gray

Write-Host ""
Write-Host "Techwell LMS is initializing!" -ForegroundColor Green
Write-Host "Backend:  http://localhost:5000"
Write-Host "Frontend: http://localhost:3000"
Write-Host ""
Write-Host "Please wait a few seconds for the build to complete." -ForegroundColor Gray
