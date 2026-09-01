#Requires -Version 5.1
$ErrorActionPreference = 'Stop'
$SrcDir = $PSScriptRoot | Split-Path -Parent
$VaultRoot = 'D:\Admin Keys\Capital-Glass-IT-Vault'
$RemoteDir = '/volume1/docker/cg-server-host-provider'
$CanonicalHostPath = '/volume1/Capital Glass/Capital-Glass-AI-Evidence-Vault'

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

$pre = @"
echo '$ea' | sudo -S /usr/syno/bin/synopkg status ContainerManager 2>&1
echo '$ea' | sudo -S test -d '$CanonicalHostPath' && echo HOST_PATH_OK || echo HOST_PATH_MISSING
"@
$r0 = Invoke-SSHCommand -SessionId $session.SessionId -Command $pre -TimeOut 120
Write-Output (($r0.Output) -join "`n")
if ((($r0.Output) -join "`n") -notmatch 'HOST_PATH_OK') {
    throw "STORAGE_AUTHORITY_CONFLICTED: canonical host path missing"
}

$tarPath = Join-Path $env:TEMP 'cg-server-host-provider.tgz'
if (Test-Path $tarPath) { Remove-Item $tarPath -Force }
Push-Location $SrcDir
& tar czf $tarPath .
Pop-Location
$b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($tarPath))

$inner = @"
mkdir -p $RemoteDir && echo $b64 | base64 -d | tar xzf - -C $RemoteDir && ls -la $RemoteDir
DOCKER=`$(command -v docker 2>/dev/null || echo /var/packages/ContainerManager/target/usr/bin/docker)
cd $RemoteDir && `$DOCKER compose -f compose.yaml build 2>&1 | tail -12
cd $RemoteDir && `$DOCKER compose -f compose.yaml up -d 2>&1
`$DOCKER ps --filter name=cg-server-host-provider
"@

$cmd = "echo '$ea' | sudo -S sh -c '" + ($inner -replace "'", "'\\''") + "'"
$r = Invoke-SSHCommand -SessionId $session.SessionId -Command $cmd -TimeOut 900
Write-Output (($r.Output) -join "`n")
Remove-SSHSession -SessionId $session.SessionId | Out-Null
