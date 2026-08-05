# Windows orchestration: optional drive mounts → WSL ensure → local probe.
# Run elevated on WESLEYDESK (also invoked by scheduled tasks as SYSTEM).
$ErrorActionPreference = 'Continue'

$TaskPrefix = 'CapitalGlass-WESLEYDESK-WSL-Runner'
$WslDistro = 'Ubuntu-24.04'
$RepoRoot = 'C:\Users\wesley\repos\CapitalGlass-Cross-Agent'
$EnsureScriptWsl = '/home/wesley/repos/CapitalGlass-Cross-Agent/scripts/runner/ensure-wesleydesk-runner-wsl.sh'
$ProbeScriptWsl = '/home/wesley/repos/CapitalGlass-Cross-Agent/scripts/runner/probe-wesleydesk-runner-local.sh'
$LogDir = 'C:\ProgramData\CapitalGlass\runner-health'
$LogFile = Join-Path $LogDir 'wesleydesk-runner-stack.log'

function Write-Log([string]$Message) {
  $line = "[{0}] {1}" -f (Get-Date -Format 'o'), $Message
  if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }
  Add-Content -Path $LogFile -Value $line
  Write-Host $line
}

$hostName = $env:COMPUTERNAME
if ($hostName -notmatch '^(WESLEYDESK|CG-WESLEYDESK)') {
  Write-Log "host gate FAIL: expected WESLEYDESK, got $hostName"
  exit 1
}

Write-Log "stack start user=$env:USERNAME"

foreach ($driveTask in @(
    'CapitalGlass-EnsureDeskDriveMounts-Periodic',
    'CapitalGlass-EnsureDeskDriveMounts-Logon'
  )) {
  $task = Get-ScheduledTask -TaskName $driveTask -ErrorAction SilentlyContinue
  if ($null -eq $task) { continue }
  Write-Log "trigger drive task: $driveTask"
  try {
    Start-ScheduledTask -TaskName $driveTask -ErrorAction Stop
    Start-Sleep -Seconds 3
    $info = Get-ScheduledTaskInfo -TaskName $driveTask
    Write-Log "drive task $driveTask LastTaskResult=$($info.LastTaskResult)"
  } catch {
    Write-Log "drive task $driveTask failed: $($_.Exception.Message)"
  }
}

$ensureExit = 0
try {
  & wsl.exe -d $WslDistro -u root -- bash -lc "chmod +x '$EnsureScriptWsl' '$ProbeScriptWsl' 2>/dev/null; bash '$EnsureScriptWsl'"
  $ensureExit = $LASTEXITCODE
} catch {
  Write-Log "wsl ensure exception: $($_.Exception.Message)"
  $ensureExit = 1
}
Write-Log "wsl ensure exit=$ensureExit"

$probeExit = 0
try {
  & wsl.exe -d $WslDistro -u root -- bash -lc "bash '$ProbeScriptWsl'" | Out-Null
  $probeExit = $LASTEXITCODE
} catch {
  Write-Log "wsl probe exception: $($_.Exception.Message)"
  $probeExit = 1
}
Write-Log "wsl probe exit=$probeExit"

if ($ensureExit -ne 0) { exit $ensureExit }
if ($probeExit -ne 0) { exit $probeExit }
Write-Log "stack PASS"
exit 0
