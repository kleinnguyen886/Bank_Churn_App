$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$pythonExe = Join-Path $projectRoot "..\.venv\Scripts\python.exe"
$frontendDir = Join-Path $projectRoot "Bank Retention Platform Design"

function Resolve-NpmCommand {
  $candidates = @("npm", "npm.cmd", "C:\Program Files\nodejs\npm.cmd", "C:\Program Files (x86)\nodejs\npm.cmd")
  foreach ($candidate in $candidates) {
    if (Test-Path $candidate) {
      return $candidate
    }
    $cmd = Get-Command $candidate -ErrorAction SilentlyContinue
    if ($cmd) {
      return $cmd.Source
    }
  }
  return $null
}

Write-Host "[1/5] Checking Python environment..."
if (-not (Test-Path $pythonExe)) {
  throw "Python executable not found at $pythonExe. Activate/create .venv first."
}

Write-Host "[2/5] Installing backend dependencies..."
& $pythonExe -m pip install -r (Join-Path $projectRoot "requirements.txt")

Write-Host "[3/5] Exporting reference frontend data..."
& $pythonExe (Join-Path $projectRoot "scripts\export_reference_data.py")

Write-Host "[4/5] Training model and generating artifacts..."
& $pythonExe (Join-Path $projectRoot "scripts\train_and_prepare.py")

Write-Host "[5/5] Installing frontend dependencies..."
Push-Location $frontendDir
$npmCmd = Resolve-NpmCommand
if (-not $npmCmd) {
  Write-Warning "npm was not found in this shell. Backend initialization finished, but frontend setup was skipped. If Node is already installed, restart VS Code/terminal to refresh PATH, then rerun this script."
} else {
  if (Test-Path (Join-Path $frontendDir "package-lock.json")) {
    & $npmCmd ci
  } else {
    & $npmCmd install
  }
}
Pop-Location

Write-Host "Initialization complete."
Write-Host "Run scripts/start_full_stack.ps1 to launch backend and frontend."
