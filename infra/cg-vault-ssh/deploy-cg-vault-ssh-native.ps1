#Requires -Version 5.1
# Windows admin context only — requires D:\Admin Keys\Capital-Glass-IT-Vault mounted.
# Not runnable from WSL (/mnt/d is empty unless the drive is mounted in Windows first).
$ErrorActionPreference = 'Stop'
$SrcDir = if ($env:CG_VAULT_SSH_SRC) { $env:CG_VAULT_SSH_SRC } else { $PSScriptRoot }
$VaultRoot = 'D:\Admin Keys\Capital-Glass-IT-Vault'
$RemoteDir = '/volume1/docker/cg-vault-ssh'

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

$tarPath = Join-Path $env:TEMP 'cg-vault-ssh-native.tgz'
if (Test-Path $tarPath) { Remove-Item $tarPath -Force }
Push-Location $SrcDir
& tar czf $tarPath cg-vault-dispatch.py cg-vault-run.sh sshd_config.native authorized_keys.native rc.cg-vault-ssh.sh install-native-remote.sh test-adversarial-hash.sh
Pop-Location
$b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($tarPath))

$remote = "mkdir -p $RemoteDir && echo $b64 | base64 -d | tar xzf - -C $RemoteDir && sh $RemoteDir/install-native-remote.sh"
$cmd = "echo '$ea' | sudo -S sh -c '" + ($remote -replace "'", "'\\''") + "'"
$r = Invoke-SSHCommand -SessionId $session.SessionId -Command $cmd -TimeOut 300
Write-Output (($r.Output) -join "`n")
if ($r.Error) { Write-Output (($r.Error) -join "`n") }
Remove-SSHSession -SessionId $session.SessionId | Out-Null
