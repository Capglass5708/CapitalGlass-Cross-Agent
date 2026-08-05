# Install Windows tasks to keep WSL + Cross-Agent runner online on WESLEYDESK.
# Run from elevated PowerShell on CG-WESLEYDESK-01.
$ErrorActionPreference = 'Stop'

$TaskPrefix = 'CapitalGlass-WESLEYDESK-WSL-Runner'
$WslDistro = 'Ubuntu-24.04'
$SourceStack = Join-Path $PSScriptRoot 'ensure-wesleydesk-runner-stack.ps1'
$DeployDir = 'C:\ProgramData\CapitalGlass\runner'
$StackScript = Join-Path $DeployDir 'ensure-wesleydesk-runner-stack.ps1'

$hostName = $env:COMPUTERNAME
if ($hostName -notmatch '^(WESLEYDESK|CG-WESLEYDESK)') {
  throw "Host gate FAIL: expected WESLEYDESK, got $hostName"
}

if (-not (Test-Path $SourceStack)) {
  throw "Missing stack script: $SourceStack"
}

if (-not (Test-Path $DeployDir)) { New-Item -ItemType Directory -Path $DeployDir -Force | Out-Null }
Copy-Item -Path $SourceStack -Destination $StackScript -Force

$action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$StackScript`""
$principal = New-ScheduledTaskPrincipal -UserId 'SYSTEM' -LogonType ServiceAccount -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -StartWhenAvailable `
  -MultipleInstances IgnoreNew `
  -ExecutionTimeLimit (New-TimeSpan -Minutes 20)

$startupTrigger = New-ScheduledTaskTrigger -AtStartup
$startupTrigger.Delay = 'PT3M'

Register-ScheduledTask -TaskName "$TaskPrefix-Autostart" -Action $action -Trigger (New-ScheduledTaskTrigger -AtLogOn) -Principal $principal -Settings $settings -Force | Out-Null
Register-ScheduledTask -TaskName "$TaskPrefix-Startup" -Action $action -Trigger $startupTrigger -Principal $principal -Settings $settings -Force | Out-Null

$watchdogTrigger = New-ScheduledTaskTrigger -Once -At (Get-Date).Date -RepetitionInterval (New-TimeSpan -Minutes 5) -RepetitionDuration ([TimeSpan]::MaxValue)
Register-ScheduledTask -TaskName "$TaskPrefix-Watchdog" -Action $action -Trigger $watchdogTrigger -Principal $principal -Settings $settings -Force | Out-Null

Write-Host "Installed: ${TaskPrefix}-Autostart, -Startup (PT3M delay), -Watchdog (5m)"
Write-Host "Stack script: $StackScript"
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $StackScript
