$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$pythonExe = Join-Path $projectRoot "..\.venv\Scripts\python.exe"

Write-Host "[1/4] Checking Python environment..."
if (-not (Test-Path $pythonExe)) {
  throw "Python executable not found at $pythonExe. Create and activate .venv first."
}

Write-Host "[2/4] Installing backend dependencies..."
& $pythonExe -m pip install -r (Join-Path $projectRoot "requirements.txt")

Write-Host "[3/4] Exporting reference data..."
& $pythonExe (Join-Path $projectRoot "scripts\export_reference_data.py")

Write-Host "[4/4] Training model and generating artifacts..."
& $pythonExe (Join-Path $projectRoot "scripts\train_and_prepare.py")

Write-Host "Initialization complete."
Write-Host "Run scripts/start_full_stack.ps1 to launch the Flask app."
