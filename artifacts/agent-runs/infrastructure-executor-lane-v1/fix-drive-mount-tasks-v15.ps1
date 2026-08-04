#Requires -Version 5.1
#Requires -RunAsAdministrator
<#
  One-shot v1.5 remediation: hidden tasks, dedupe LanRecheck, restore Startup + PreCursor-Logon.
#>
$ErrorActionPreference = 'Stop'

$PrivateRoot = 'C:\ProgramData\CapitalGlass\OfficeAdmin\PRIVATE'
$commonRoot = 'C:\Developer\repos\CapitalGlass-Office-Admin\scripts\devices\common'
$hiddenLib = Join-Path $commonRoot 'Register-OfficeHiddenScheduledTask.ps1'
if (-not (Test-Path -LiteralPath $hiddenLib)) {
    throw "Missing $hiddenLib"
}
. $hiddenLib

$computer = $env:COMPUTERNAME
$taskUser = "$computer\wesle"
$ensureScript = Join-Path $PrivateRoot 'Ensure-CgWesleyWorkDriveMounts.ps1'
$startupScript = Join-Path $PrivateRoot 'Invoke-CgWesleyWorkDriveMountStartup.ps1'
$gateScript = Join-Path $PrivateRoot 'Invoke-CgWesleyWorkPreCursorDriveGate.ps1'

foreach ($path in @($ensureScript, $startupScript, $gateScript)) {
    if (-not (Test-Path -LiteralPath $path)) {
        throw "Missing required script: $path"
    }
}

function Format-CgDelay([int]$TotalSeconds) {
    $mins = [int][math]::Floor($TotalSeconds / 60)
    $secs = [int]($TotalSeconds % 60)
    return $mins.ToString('0000') + ':' + $secs.ToString('00')
}

$purge = @(
    'CapitalGlass-WesleyWork-DriveMount-Logon',
    'CapitalGlass-WesleyWork-DriveMount-Startup',
    'CapitalGlass-WesleyWork-DriveMount-Health',
    'CapitalGlass-WesleyWork-DriveMount-Unlock',
    'CapitalGlass-WesleyWork-DriveMount-LanRecheck',
    'CapitalGlass-WesleyWork-DriveMount-User-Health',
    'CapitalGlass-WesleyWork-PreCursorDriveGate',
    'CapitalGlass-WesleyWork-PreCursorDriveGate-Unlock',
    'CapitalGlass-WesleyWork-PreCursorDriveGate-Logon'
)
foreach ($name in $purge) {
    Remove-OfficeScheduledTaskQuiet -TaskName $name
}

Register-OfficeHiddenScheduledTask `
    -TaskName 'CapitalGlass-WesleyWork-DriveMount-Logon' `
    -Command 'powershell.exe' `
    -Arguments "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$ensureScript`" -Mode Logon" `
    -TaskUser $taskUser `
    -TriggerType Logon `
    -Delay (Format-CgDelay 90)
Write-Host '[OK] Logon' -ForegroundColor Green

Register-OfficeHiddenScheduledTask `
    -TaskName 'CapitalGlass-WesleyWork-DriveMount-Startup' `
    -Command 'powershell.exe' `
    -Arguments "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$startupScript`" -StartupDelaySeconds 45" `
    -TriggerType Boot `
    -Delay (Format-CgDelay 45) `
    -RunLevel Highest
Write-Host '[OK] Startup' -ForegroundColor Green

Register-OfficeHiddenScheduledTask `
    -TaskName 'CapitalGlass-WesleyWork-DriveMount-Health' `
    -Command 'powershell.exe' `
    -Arguments "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$ensureScript`" -Mode Health" `
    -TaskUser $taskUser `
    -TriggerType Minute `
    -IntervalMinutes 5
Write-Host '[OK] Health' -ForegroundColor Green

Register-OfficeHiddenScheduledTask `
    -TaskName 'CapitalGlass-WesleyWork-DriveMount-Unlock' `
    -Command 'powershell.exe' `
    -Arguments "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$ensureScript`" -Mode Health" `
    -TaskUser $taskUser `
    -TriggerType Logon `
    -Delay (Format-CgDelay 30)
Write-Host '[OK] Unlock' -ForegroundColor Green

Register-OfficeHiddenScheduledTask `
    -TaskName 'CapitalGlass-WesleyWork-PreCursorDriveGate' `
    -Command 'powershell.exe' `
    -Arguments "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$gateScript`" -Action Remediate -Quiet" `
    -TaskUser $taskUser `
    -TriggerType Minute `
    -IntervalMinutes 1
Write-Host '[OK] PreCursor periodic' -ForegroundColor Green

Register-OfficeHiddenScheduledTask `
    -TaskName 'CapitalGlass-WesleyWork-PreCursorDriveGate-Unlock' `
    -Command 'powershell.exe' `
    -Arguments "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$gateScript`" -Action Remediate -Quiet" `
    -TaskUser $taskUser `
    -TriggerType SessionUnlock `
    -SessionUnlockUserId $taskUser
Write-Host '[OK] PreCursor unlock' -ForegroundColor Green

Register-OfficeHiddenScheduledTask `
    -TaskName 'CapitalGlass-WesleyWork-PreCursorDriveGate-Logon' `
    -Command 'powershell.exe' `
    -Arguments "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$gateScript`" -Action Remediate -Quiet" `
    -TaskUser $taskUser `
    -TriggerType Logon `
    -Delay '0000:00'
Write-Host '[OK] PreCursor logon' -ForegroundColor Green

Write-Host '[DONE] v1.5 hidden task remediation complete.' -ForegroundColor Cyan
