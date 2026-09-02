# WESLEYDESK WSL + Cross-Agent runner persistence (elevated PowerShell on CG-WESLEYDESK-01).
# Installs: .wslconfig idle disable, scheduled tasks (logon/startup/5m watchdog), immediate ensure.
$ErrorActionPreference = 'Stop'

$TaskPrefix = 'CapitalGlass-WESLEYDESK-WSL-Runner'
$WslDistro = 'Ubuntu-24.04'
$RepoRoot = if ($env:CG_CROSS_AGENT_REPO) { $env:CG_CROSS_AGENT_REPO } else { Join-Path $env:USERPROFILE 'repos\CapitalGlass-Cross-Agent' }
$EnsureScript = '/home/wesley/repos/CapitalGlass-Cross-Agent/scripts/runner/ensure-wesleydesk-runner-wsl.sh'

$hostName = $env:COMPUTERNAME
if ($hostName -notmatch '^(WESLEYDESK|CG-WESLEYDESK)') {
  throw "Host gate FAIL: expected WESLEYDESK, got $hostName"
}

function Write-WslConfig {
  param([string]$Path)
  $dir = Split-Path -Parent $Path
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  @'
[wsl2]
# Prevent WSL VM shutdown while idle - required for long index-publication jobs.
vmIdleTimeout=-1
# Use default NAT if mirrored networking destabilizes the distro on this host.
# networkingMode=mirrored
'@ | Set-Content -Path $Path -Encoding utf8
  Write-Host "Wrote $Path"
}

# Per-user and SYSTEM profiles (scheduled tasks run as SYSTEM).
Write-WslConfig (Join-Path $env:USERPROFILE '.wslconfig')
$systemProfile = 'C:\Windows\System32\config\systemprofile\.wslconfig'
Write-WslConfig $systemProfile

$ensureAction = New-ScheduledTaskAction -Execute 'wsl.exe' -Argument "-d $WslDistro -u root bash $EnsureScript"
$pingAction = New-ScheduledTaskAction -Execute 'wsl.exe' -Argument "-d $WslDistro -u root -- true"
$principal = New-ScheduledTaskPrincipal -UserId 'SYSTEM' -LogonType ServiceAccount -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -StartWhenAvailable `
  -MultipleInstances IgnoreNew `
  -ExecutionTimeLimit (New-TimeSpan -Hours 1)
$anchorSettings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -StartWhenAvailable `
  -MultipleInstances IgnoreNew `
  -ExecutionTimeLimit ([TimeSpan]::Zero)

Register-ScheduledTask -TaskName "$TaskPrefix-Autostart" -Action $ensureAction -Trigger (New-ScheduledTaskTrigger -AtLogOn) -Principal $principal -Settings $settings -Force | Out-Null
Register-ScheduledTask -TaskName "$TaskPrefix-Startup" -Action $ensureAction -Trigger (New-ScheduledTaskTrigger -AtStartup) -Principal $principal -Settings $settings -Force | Out-Null
# Apply .wslconfig changes - one-time shutdown only when operator sets CG_WSL_CONFIG_REFRESH=true.
if ($env:CG_WSL_CONFIG_REFRESH -eq 'true') {
  Write-Host 'CG_WSL_CONFIG_REFRESH=true - applying wsl shutdown'
  & wsl.exe --shutdown 2>$null
  Start-Sleep -Seconds 3
}

$anchorProcessAction = New-ScheduledTaskAction -Execute 'wsl.exe' -Argument "-d $WslDistro -u root -- sleep infinity"
$anchorProcessSettings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -StartWhenAvailable `
  -MultipleInstances IgnoreNew `
  -ExecutionTimeLimit (New-TimeSpan -Days 3650)
Register-ScheduledTask -TaskName "$TaskPrefix-Anchor-Process" -Action $anchorProcessAction -Trigger (New-ScheduledTaskTrigger -AtStartup) -Principal $principal -Settings $anchorProcessSettings -Force | Out-Null

$AnchorScript = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) 'start-wesleydesk-wsl-anchor.ps1'
$anchorArg = '-NoProfile -ExecutionPolicy Bypass -File ' + [char]34 + $AnchorScript + [char]34
$anchorAction = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument $anchorArg
Register-ScheduledTask -TaskName "$TaskPrefix-Anchor" -Action $anchorAction -Trigger (New-ScheduledTaskTrigger -AtStartup) -Principal $principal -Settings $anchorSettings -Force | Out-Null
$anchorWatchTrigger = New-ScheduledTaskTrigger -Once -At (Get-Date).Date -RepetitionInterval (New-TimeSpan -Minutes 1) -RepetitionDuration (New-TimeSpan -Days 3650)
Register-ScheduledTask -TaskName "$TaskPrefix-Anchor-Watchdog" -Action $anchorAction -Trigger $anchorWatchTrigger -Principal $principal -Settings (New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Minutes 3)) -Force | Out-Null

$watchdogTrigger = New-ScheduledTaskTrigger -Once -At (Get-Date).Date -RepetitionInterval (New-TimeSpan -Minutes 1) -RepetitionDuration (New-TimeSpan -Days 3650)
Register-ScheduledTask -TaskName "$TaskPrefix-Watchdog" -Action $ensureAction -Trigger $watchdogTrigger -Principal $principal -Settings $settings -Force | Out-Null
$pingTrigger = New-ScheduledTaskTrigger -Once -At (Get-Date).Date -RepetitionInterval (New-TimeSpan -Minutes 1) -RepetitionDuration (New-TimeSpan -Days 3650)
Register-ScheduledTask -TaskName "$TaskPrefix-Keepalive" -Action $pingAction -Trigger $pingTrigger -Principal $principal -Settings (New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Minutes 2)) -Force | Out-Null

Write-Host "Installed tasks: ${TaskPrefix}-Autostart, -Startup, -Anchor-Process (sleep infinity), -Anchor, -Watchdog (1m), -Keepalive (1m)"

Write-Host "Starting WSL anchor (keeps distro Running)..."
Start-ScheduledTask -TaskName "$TaskPrefix-Anchor-Process" -ErrorAction Stop
Start-Sleep -Seconds 5
& wsl.exe -d $WslDistro -u root bash $EnsureScript
if ($LASTEXITCODE -ne 0) { throw "post-anchor ensure failed with exit $LASTEXITCODE" }
$wslState = (& wsl.exe -l -v 2>&1 | Out-String)
Write-Host $wslState

$receipt = @{
  schemaVersion = 'wesleydesk-wsl-persistence-v1@1.0.0'
  verdict       = 'PASS'
  at            = (Get-Date).ToUniversalTime().ToString('o')
  host          = $hostName
  wslDistro     = $WslDistro
  tasks         = @("${TaskPrefix}-Autostart", "${TaskPrefix}-Startup", "${TaskPrefix}-Anchor-Process", "${TaskPrefix}-Anchor", "${TaskPrefix}-Anchor-Watchdog", "${TaskPrefix}-Watchdog", "${TaskPrefix}-Keepalive")
}
$receiptPath = Join-Path $RepoRoot 'runtime\runner\wesleydesk-wsl-persistence-receipt.json'
$receiptDir = Split-Path -Parent $receiptPath
if (-not (Test-Path $receiptDir)) { New-Item -ItemType Directory -Force -Path $receiptDir | Out-Null }
$receipt | ConvertTo-Json -Depth 4 | Set-Content -Path $receiptPath -Encoding utf8
Write-Host "Receipt: $receiptPath"
