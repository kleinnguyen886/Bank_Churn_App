$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$pythonExe = Join-Path $projectRoot "..\.venv\Scripts\python.exe"

if (-not (Test-Path $pythonExe)) {
  throw "Python executable not found at $pythonExe. Run scripts/init_full_stack.ps1 first."
}

Write-Host "Starting Flask app on http://127.0.0.1:5000 ..."
& $pythonExe (Join-Path $projectRoot "app.py")
