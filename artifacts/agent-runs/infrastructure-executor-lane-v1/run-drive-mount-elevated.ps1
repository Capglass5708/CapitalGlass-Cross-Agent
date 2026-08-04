$ErrorActionPreference = 'Stop'
$log = 'C:\ProgramData\CapitalGlass\OfficeAdmin\PRIVATE\cg-temp-drive-install.log'
$install = 'C:\Developer\repos\CapitalGlass-Office-Admin\scripts\devices\CG-WESLEYWORK-01\Install-CgWesleyWorkDriveMountPersistence.ps1'
$verifier = 'C:\Developer\repos\CapitalGlass-Office-Admin\scripts\devices\CG-WESLEYWORK-01\Test-CgWesleyWorkDriveMountTaskRegistration.ps1'
try {
  & $install *>&1 | Tee-Object -FilePath $log
  & $verifier -ExpectRegistered *>&1 | Tee-Object -FilePath $log -Append
  exit $LASTEXITCODE
} catch {
  $_ | Out-File -FilePath $log -Append
  exit 1
}
