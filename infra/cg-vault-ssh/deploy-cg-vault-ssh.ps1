#Requires -Version 5.1
$ErrorActionPreference = 'Stop'
$SrcDir = if ($env:CG_VAULT_SSH_SRC) { $env:CG_VAULT_SSH_SRC } else { Join-Path (Split-Path $PSScriptRoot -Parent -ErrorAction SilentlyContinue) 'cg-vault-ssh' }
if (-not (Test-Path $SrcDir)) {
    $SrcDir = 'C:\Users\wesle\AppData\Local\Temp\cg-vault-ssh-src'
}
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

$tarPath = Join-Path $env:TEMP 'cg-vault-ssh.tgz'
if (Test-Path $tarPath) { Remove-Item $tarPath -Force }
Push-Location $SrcDir
& tar czf $tarPath .
Pop-Location
$b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($tarPath))

$inner = @"
mkdir -p $RemoteDir && echo $b64 | base64 -d | tar xzf - -C $RemoteDir && ls -la $RemoteDir
DOCKER=`$(command -v docker 2>/dev/null || echo /usr/local/bin/docker)
cd $RemoteDir && `$DOCKER compose build 2>&1 | tail -8
cd $RemoteDir && `$DOCKER compose up -d 2>&1
`$DOCKER ps --filter name=cg-vault-ssh
"@

$cmd = "echo '$ea' | sudo -S sh -c '" + ($inner -replace "'", "'\\''") + "'"
$r = Invoke-SSHCommand -SessionId $session.SessionId -Command $cmd -TimeOut 900
Write-Output (($r.Output) -join "`n")
Remove-SSHSession -SessionId $session.SessionId | Out-Null
