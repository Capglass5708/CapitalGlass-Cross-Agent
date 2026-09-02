#Requires -Version 5.1
$VaultRoot = 'D:\Admin Keys\Capital-Glass-IT-Vault'
. (Join-Path $VaultRoot 'tools\CapitalGlass-VaultCrypto.ps1')
$plain = Read-CapitalGlassVaultSecretFile -VaultRoot $VaultRoot -RelativePath '02-Secrets/02-Network-Storage/synology-dsm-admin.vault'
$meta = @{}; foreach ($line in ($plain -split "`r?`n")) { if ($line -match '^([^=]+)=(.*)$') { $meta[$Matches[1].Trim()] = $Matches[2].Trim() } }
Import-Module (Join-Path $VaultRoot 'tools\Posh-SSH\Posh-SSH.psd1') -Force
$sec = ConvertTo-SecureString $meta['ADMIN_PASS'] -AsPlainText -Force
$cred = New-Object PSCredential($meta['ADMIN_USER'], $sec)
$session = New-SSHSession -ComputerName $meta['HOSTNAME'] -Credential $cred -AcceptKey
$ea = $meta['ADMIN_PASS'].Replace("'", "'\\''")
$b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes((Join-Path $PSScriptRoot 'sync-authkeys-remote.sh')))
$cmd = "echo '$ea' | sudo -S sh -c 'echo $b64 | base64 -d > /tmp/sync-authkeys.sh && sh /tmp/sync-authkeys.sh'"
$r = Invoke-SSHCommand -SessionId $session.SessionId -Command $cmd -TimeOut 60
Write-Output (($r.Output) -join "`n")
Remove-SSHSession -SessionId $session.SessionId | Out-Null
