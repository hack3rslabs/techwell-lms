$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $repoRoot 'backend'
$postgresServiceName = 'postgresql-x64-18'
$dbHost = 'localhost'
$dbPort = 5432

function Write-Step([string]$Message) {
    Write-Host "[TechWell] $Message" -ForegroundColor Cyan
}

function Fail([string]$Message) {
    Write-Host "[TechWell] $Message" -ForegroundColor Red
    exit 1
}

function Test-IsAdmin {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($identity)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

if (-not (Test-Path $backendDir)) {
    Fail "Backend folder not found at $backendDir"
}

try {
    $service = Get-Service -Name $postgresServiceName -ErrorAction Stop
} catch {
    Fail "PostgreSQL service '$postgresServiceName' was not found. Install PostgreSQL or update the service name in start-techwell-backend.ps1."
}

if ($service.Status -ne 'Running') {
    if (-not (Test-IsAdmin)) {
        Write-Step "PostgreSQL is stopped. Windows will ask for administrator permission so I can start '$postgresServiceName'."
        try {
            Start-Process -FilePath "powershell.exe" `
                -Verb RunAs `
                -WorkingDirectory $repoRoot `
                -ArgumentList @(
                    "-ExecutionPolicy",
                    "Bypass",
                    "-File",
                    "`"$PSCommandPath`""
                )
            exit 0
        } catch {
            Fail "Administrator permission was not granted. Re-run .\start-techwell-backend.ps1 and accept the Windows prompt."
        }
    }

    Set-Service -Name $postgresServiceName -StartupType Automatic
    Write-Step "Starting PostgreSQL service '$postgresServiceName'..."
    Start-Service -Name $postgresServiceName
    Start-Sleep -Seconds 2
    $service.Refresh()

    if ($service.Status -ne 'Running') {
        Fail "PostgreSQL service '$postgresServiceName' did not start successfully."
    }
}

Write-Step "Waiting for PostgreSQL on $dbHost`:$dbPort..."
$deadline = (Get-Date).AddSeconds(30)
$dbReady = $false

while ((Get-Date) -lt $deadline) {
    $connection = Test-NetConnection -ComputerName $dbHost -Port $dbPort -WarningAction SilentlyContinue
    if ($connection.TcpTestSucceeded) {
        $dbReady = $true
        break
    }
    Start-Sleep -Seconds 1
}

if (-not $dbReady) {
    Fail "PostgreSQL is not accepting connections on $dbHost`:$dbPort."
}

Push-Location $backendDir
try {
    Write-Step "Generating Prisma client..."
    npm run db:generate
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    Write-Step "Applying Prisma schema..."
    npm run db:push
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    Write-Step "Seeding baseline users and courses..."
    npm run db:seed
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    Write-Step "Starting backend on http://localhost:5000 ..."
    npm run dev
} finally {
    Pop-Location
}
