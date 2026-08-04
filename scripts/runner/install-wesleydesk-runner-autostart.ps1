# Install Windows logon task to wake WSL and start the Cross-Agent runner on WESLEYDESK.
# Run from elevated PowerShell on CG-WESLEYDESK-01 (or via SSH as cgremoteadmin if permitted).
$ErrorActionPreference = 'Stop'

$TaskName = 'CapitalGlass-WESLEYDESK-WSL-Runner-Autostart'
$WslDistro = 'Ubuntu-24.04'
$EnsureScript = '/home/wesley/repos/CapitalGlass-Cross-Agent/scripts/runner/ensure-wesleydesk-runner-wsl.sh'
$TaskCommand = "wsl.exe -d $WslDistro -u root bash -lc `"$EnsureScript`""

$hostName = $env:COMPUTERNAME
if ($hostName -notmatch '^(WESLEYDESK|CG-WESLEYDESK)') {
  throw "Host gate FAIL: expected WESLEYDESK, got $hostName"
}

$action = New-ScheduledTaskAction -Execute 'wsl.exe' -Argument "-d $WslDistro -u root bash -lc `"$EnsureScript`""
$trigger = New-ScheduledTaskTrigger -AtLogOn
$principal = New-ScheduledTaskPrincipal -UserId 'SYSTEM' -LogonType ServiceAccount -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Force | Out-Null
Write-Host "Scheduled task installed: $TaskName"
Write-Host "Command: $TaskCommand"

# Immediate ensure
& wsl.exe -d $WslDistro -u root bash -lc $EnsureScript
