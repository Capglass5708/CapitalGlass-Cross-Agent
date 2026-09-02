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
$cmds = @(
    "echo '$ea' | sudo -S cat /usr/syno/etc/user.data.conf/app_priv.config 2>&1",
    "echo '$ea' | sudo -S cat /usr/syno/etc/user.data.conf/actionpriv.config 2>&1 | head -40"
)
foreach ($c in $cmds) {
    $r = Invoke-SSHCommand -SessionId $session.SessionId -Command $c -TimeOut 60
    Write-Output '==='
    Write-Output (($r.Output) -join "`n")
}
Remove-SSHSession -SessionId $session.SessionId | Out-Null
