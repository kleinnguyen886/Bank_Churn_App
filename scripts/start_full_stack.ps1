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

function Resolve-NodeCommand {
  $candidates = @("node", "node.exe", "C:\Program Files\nodejs\node.exe", "C:\Program Files (x86)\nodejs\node.exe")
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

if (-not (Test-Path $pythonExe)) {
  throw "Python executable not found at $pythonExe. Run scripts/init_full_stack.ps1 first."
}

Write-Host "Starting backend on http://127.0.0.1:5000 ..."
$backendCmd = "& '$pythonExe' '$projectRoot\app.py'"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd

$npmCmd = Resolve-NpmCommand
if (-not (Test-Path $frontendDir)) {
  Write-Warning "Frontend reference folder was not found at '$frontendDir'. Backend has been started. Download/extract frontend locally to enable UI dev server."
} elseif (-not $npmCmd) {
  Write-Warning "npm was not found in this shell. Frontend dev server was not started. If Node is already installed, restart VS Code/terminal to refresh PATH, then rerun this script."
} else {
  $nodeCmd = Resolve-NodeCommand
  if (-not $nodeCmd) {
    Write-Warning "npm was found but node.exe was not found. Frontend dev server was not started."
    Write-Host "Both services launched in new PowerShell windows."
    exit 0
  }

  $nodeDir = Split-Path -Parent $nodeCmd
  Write-Host "Starting frontend on http://127.0.0.1:5173 ..."
  $frontendCmd = "`$env:Path = '$nodeDir;' + `$env:Path; Set-Location '$frontendDir'; & '$npmCmd' run dev"
  Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd
}

Write-Host "Both services launched in new PowerShell windows."
