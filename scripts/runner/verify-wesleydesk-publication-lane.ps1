# Read-only verification of WESLEYDESK index-publication lane (run on WESLEYDESK or via SSH).
$ErrorActionPreference = 'Stop'
$WslDistro = 'Ubuntu-24.04'
$Repo = 'Capglass5708/CapitalGlass-Cross-Agent'

$wslState = (& wsl.exe -l -v 2>&1 | Out-String)
$runnerJson = gh api "repos/$Repo/actions/runners" --jq '.runners[] | select(.name|contains("cross-agent")) | {name,status,busy}' 2>&1
$tasks = schtasks /Query /TN 'CapitalGlass-WESLEYDESK-WSL-Runner-Watchdog' /FO LIST 2>&1

Write-Host '=== WSL ==='
Write-Host $wslState
Write-Host '=== GitHub runner ==='
Write-Host $runnerJson
Write-Host '=== Watchdog task ==='
Write-Host $tasks

$online = $runnerJson -match '"status":"online"'
$running = $wslState -match 'Running'
if ($online -and $running) {
  Write-Host 'VERDICT: PUBLICATION_LANE_READY'
  exit 0
}
Write-Host 'VERDICT: PUBLICATION_LANE_NOT_READY'
exit 1
