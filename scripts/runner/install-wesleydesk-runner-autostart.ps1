# Install Windows tasks to keep WSL + Cross-Agent runner online on WESLEYDESK.
# Run from elevated PowerShell on CG-WESLEYDESK-01.
$ErrorActionPreference = 'Stop'

$TaskPrefix = 'CapitalGlass-WESLEYDESK-WSL-Runner'
$WslDistro = 'Ubuntu-24.04'
$EnsureScript = '/home/wesley/repos/CapitalGlass-Cross-Agent/scripts/runner/ensure-wesleydesk-runner-wsl.sh'

$hostName = $env:COMPUTERNAME
if ($hostName -notmatch '^(WESLEYDESK|CG-WESLEYDESK)') {
  throw "Host gate FAIL: expected WESLEYDESK, got $hostName"
}

$action = New-ScheduledTaskAction -Execute 'wsl.exe' -Argument "-d $WslDistro -u root bash $EnsureScript"
$principal = New-ScheduledTaskPrincipal -UserId 'SYSTEM' -LogonType ServiceAccount -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -MultipleInstances IgnoreNew

Register-ScheduledTask -TaskName "$TaskPrefix-Autostart" -Action $action -Trigger (New-ScheduledTaskTrigger -AtLogOn) -Principal $principal -Settings $settings -Force | Out-Null
Register-ScheduledTask -TaskName "$TaskPrefix-Startup" -Action $action -Trigger (New-ScheduledTaskTrigger -AtStartup) -Principal $principal -Settings $settings -Force | Out-Null
$watchdogTrigger = New-ScheduledTaskTrigger -Once -At (Get-Date).Date -RepetitionInterval (New-TimeSpan -Minutes 5) -RepetitionDuration ([TimeSpan]::MaxValue)
Register-ScheduledTask -TaskName "$TaskPrefix-Watchdog" -Action $action -Trigger $watchdogTrigger -Principal $principal -Settings $settings -Force | Out-Null

Write-Host "Installed: ${TaskPrefix}-Autostart, -Startup, -Watchdog (5m)"
& wsl.exe -d $WslDistro -u root bash $EnsureScript
