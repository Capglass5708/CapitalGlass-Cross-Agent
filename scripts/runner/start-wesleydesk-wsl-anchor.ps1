# Ensures the long-running WSL anchor scheduled task is active.
$ErrorActionPreference = 'Stop'
$AnchorTask = 'CapitalGlass-WESLEYDESK-WSL-Runner-Anchor-Process'
$state = (& wsl.exe -l -v 2>&1 | Out-String)
if ($state -match 'Ubuntu-24.04\s+Running') {
  Write-Host 'WSL Running'
  exit 0
}
Write-Host 'WSL not Running; starting anchor task'
$t = Get-ScheduledTask -TaskName $AnchorTask -ErrorAction SilentlyContinue
if (-not $t) {
  Write-Error "Missing scheduled task: $AnchorTask"
  exit 1
}
Start-ScheduledTask -TaskName $AnchorTask
Start-Sleep -Seconds 4
& wsl.exe -l -v
