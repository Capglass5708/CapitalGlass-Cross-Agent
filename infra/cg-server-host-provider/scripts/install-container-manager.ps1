#Requires -Version 5.1
<#
.SYNOPSIS
  Idempotent Container Manager install check for CG-SERVER.
  Uses IT Vault for DSM admin credentials only — never commits secrets.
#>
$ErrorActionPreference = 'Continue'
$VaultRoot = 'D:\Admin Keys\Capital-Glass-IT-Vault'
. (Join-Path $VaultRoot 'tools\CapitalGlass-VaultCrypto.ps1')
$plain = Read-CapitalGlassVaultSecretFile -VaultRoot $VaultRoot -RelativePath '02-Secrets/02-Network-Storage/synology-dsm-admin.vault'
$meta = @{}
foreach ($line in ($plain -split "`r?`n")) {
    if ($line -match '^([^=]+)=(.*)$') { $meta[$Matches[1].Trim()] = $Matches[2].Trim() }
}
Import-Module (Join-Path $VaultRoot 'tools\Posh-SSH\Posh-SSH.psd1') -Force
$sec = ConvertTo-SecureString $meta['ADMIN_PASS'] -AsPlainText -Force
$cred = New-Object PSCredential($meta['ADMIN_USER'], $sec)
$session = New-SSHSession -ComputerName $meta['HOSTNAME'] -Credential $cred -AcceptKey
$ea = $meta['ADMIN_PASS'].Replace("'", "'\\''")

$statusCmd = "echo '$ea' | sudo -S /usr/syno/bin/synopkg status ContainerManager 2>&1"
$status = Invoke-SSHCommand -SessionId $session.SessionId -Command $statusCmd -TimeOut 120
$statusText = ($status.Output) -join "`n"
Write-Output "CONTAINER_MANAGER_STATUS:"
Write-Output $statusText

if ($statusText -match '"status":"start"' -or $statusText -match 'is running') {
    Write-Output 'CONTAINER_MANAGER_PRESENT=PASS'
    Remove-SSHSession -SessionId $session.SessionId | Out-Null
    exit 0
}

if ($statusText -match 'install_corruption' -or $statusText -match '"status":"broken"') {
    Write-Output 'CONTAINER_MANAGER_STATE=BROKEN'
    Write-Output 'OPERATOR_ACTION=DSM Package Center -> Container Manager -> Repair or Uninstall then Install'
    Remove-SSHSession -SessionId $session.SessionId | Out-Null
    exit 2
}

if ($statusText -match 'non_installed' -or $statusText -match 'No such package') {
    $installCmd = "echo '$ea' | sudo -S /usr/syno/bin/synopkg install_from_server ContainerManager 2>&1"
    $install = Invoke-SSHCommand -SessionId $session.SessionId -Command $installCmd -TimeOut 900
    Write-Output (($install.Output) -join "`n")
    $startCmd = "echo '$ea' | sudo -S /usr/syno/bin/synopkg start ContainerManager 2>&1"
    $start = Invoke-SSHCommand -SessionId $session.SessionId -Command $startCmd -TimeOut 300
    Write-Output (($start.Output) -join "`n")
}

$status2 = Invoke-SSHCommand -SessionId $session.SessionId -Command $statusCmd -TimeOut 120
Write-Output (($status2.Output) -join "`n")
Remove-SSHSession -SessionId $session.SessionId | Out-Null
