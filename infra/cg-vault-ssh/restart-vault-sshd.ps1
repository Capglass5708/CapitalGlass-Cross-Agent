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
$src = Join-Path $PSScriptRoot 'sshd_config.native'
$b64cfg = [Convert]::ToBase64String([IO.File]::ReadAllBytes($src))
$b64rst = [Convert]::ToBase64String([IO.File]::ReadAllBytes((Join-Path $PSScriptRoot 'restart-vault-sshd-remote.sh')))
$cmd = "echo '$ea' | sudo -S sh -c 'echo $b64cfg | base64 -d > /volume1/docker/cg-vault-ssh/sshd_config.native && cp /volume1/docker/cg-vault-ssh/sshd_config.native /volume1/docker/cg-vault-ssh/sshd_config && echo $b64rst | base64 -d > /tmp/restart-vault.sh && sh /tmp/restart-vault.sh'"
$r = Invoke-SSHCommand -SessionId $session.SessionId -Command $cmd -TimeOut 120
Write-Output (($r.Output) -join "`n")
Remove-SSHSession -SessionId $session.SessionId | Out-Null
