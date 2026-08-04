$ErrorActionPreference = 'Stop'
$installScript = 'C:\Developer\repos\CapitalGlass-Office-Admin\scripts\devices\CG-WESLEYWORK-01\Install-CgWesleyWorkDriveMountPersistence.ps1'
$verifierScript = 'C:\Developer\repos\CapitalGlass-Office-Admin\scripts\devices\CG-WESLEYWORK-01\Test-CgWesleyWorkDriveMountTaskRegistration.ps1'
$taskName = 'CG-Temp-DriveMountInstall-v1'

$action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$installScript`""
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -RunLevel Highest
Register-ScheduledTask -TaskName $taskName -Action $action -Principal $principal -Force | Out-Null
Start-ScheduledTask -TaskName $taskName
Start-Sleep -Seconds 20
$info = Get-ScheduledTaskInfo -TaskName $taskName
Write-Output "InstallTask LastTaskResult=$($info.LastTaskResult) LastRunTime=$($info.LastRunTime)"
Unregister-ScheduledTask -TaskName $taskName -Confirm:$false

& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $verifierScript -ExpectRegistered
exit $LASTEXITCODE
