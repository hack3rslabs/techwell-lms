
# ============================================================
#  TechWell LMS - AUTO SAVE SCRIPT
#  Run this anytime: Right-click -> Run with PowerShell
#  OR in terminal: .\save.ps1
#  Saves ALL local changes to GitHub (beta + test1)
# ============================================================

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TECHWELL LMS - AUTO SAVE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $root

# ---- Step 1: Make sure we are on beta ----
$branch = git rev-parse --abbrev-ref HEAD
Write-Host "Current branch: $branch" -ForegroundColor Yellow

if ($branch -ne "beta") {
    Write-Host "Switching to beta branch..." -ForegroundColor Yellow
    git checkout beta
}

# ---- Step 2: Show what will be saved ----
$status = git status --porcelain
$untracked = git ls-files --others --exclude-standard

if (-not $status -and -not $untracked) {
    Write-Host "Nothing new to save. Already up to date!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Files to be saved:" -ForegroundColor White
    git status --short
    Write-Host ""
}

# ---- Step 3: Stage ALL changes ----
git add -A

# ---- Step 4: Create commit with timestamp ----
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
$commitMsg = "chore: auto-save local work [$timestamp]"

$hasStagedChanges = git diff --cached --quiet; $staged = $LASTEXITCODE
if ($staged -ne 0) {
    Write-Host "Committing: $commitMsg" -ForegroundColor Green
    git commit -m $commitMsg
} else {
    Write-Host "Nothing new to commit." -ForegroundColor Gray
}

# ---- Step 5: Push to beta ----
Write-Host ""
Write-Host "Pushing to beta..." -ForegroundColor Yellow
git push origin beta
Write-Host "beta: DONE" -ForegroundColor Green

# ---- Step 6: Sync test1 with beta and push ----
Write-Host "Pushing to test1..." -ForegroundColor Yellow
git push origin beta:test1
Write-Host "test1: DONE" -ForegroundColor Green

# ---- Step 7: Final confirmation ----
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ALL WORK SAVED TO GITHUB!" -ForegroundColor Green
Write-Host "  beta  -> UPDATED" -ForegroundColor Green
Write-Host "  test1 -> UPDATED" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Last save: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host ""

Read-Host "Press Enter to close"
