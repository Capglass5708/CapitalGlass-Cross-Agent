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
    "echo '$ea' | sudo -S ls -ld /volume1 /volume1/docker /volume1/docker/cg-vault-ssh /volume1/docker/cg-vault-ssh/authorized_keys",
    "echo '$ea' | sudo -S /usr/bin/sshd -T -f /volume1/docker/cg-vault-ssh/sshd_config 2>&1 | grep strictmodes",
    "echo '$ea' | sudo -S grep -i '22222\\|Connection closed\\|publickey\\|cg-context' /var/log/messages 2>/dev/null | tail -15"
)
foreach ($c in $cmds) {
    $r = Invoke-SSHCommand -SessionId $session.SessionId -Command $c -TimeOut 60
    Write-Output '==='
    Write-Output (($r.Output) -join "`n")
}
Remove-SSHSession -SessionId $session.SessionId | Out-Null
