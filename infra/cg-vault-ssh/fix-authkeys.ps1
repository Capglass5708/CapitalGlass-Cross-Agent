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
$ak = 'command="/volume1/docker/cg-vault-ssh/bin/cg-vault-run.sh",no-port-forwarding,no-agent-forwarding,no-X11-forwarding,no-pty ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIB/ihipX6Clkyoj0ux8/ETqIWgPbzr6+PuawVINl1j66 cg-context-ledger@CG-NIMO-01 (context-ledger replication worker)'
$akEsc = $ak.Replace("'", "'\\''")
$cmds = @(
    "echo '$ea' | sudo -S -u cg-context-ledger env SSH_ORIGINAL_COMMAND=VAULT_SSH_PROBE $RemoteDir/bin/cg-vault-run.sh".Replace('$RemoteDir', '/volume1/docker/cg-vault-ssh'),
    "echo '$ea' | sudo -S sh -c 'printf %s\\n ''$akEsc'' > /var/services/homes/cg-context-ledger/.ssh/authorized_keys && chown cg-context-ledger:users /var/services/homes/cg-context-ledger/.ssh/authorized_keys && chmod 600 /var/services/homes/cg-context-ledger/.ssh/authorized_keys && cp /var/services/homes/cg-context-ledger/.ssh/authorized_keys /volume1/docker/cg-vault-ssh/authorized_keys && chmod 600 /volume1/docker/cg-vault-ssh/authorized_keys && chown root:root /volume1/docker/cg-vault-ssh/authorized_keys && chmod 755 /volume1/docker/cg-vault-ssh && chown root:root /volume1/docker/cg-vault-ssh'",
    "echo '$ea' | sudo -S grep -i '22222\\|Failed\\|publickey\\|cg-context' /var/log/auth.log 2>/dev/null | tail -20"
)
foreach ($c in $cmds) {
    $r = Invoke-SSHCommand -SessionId $session.SessionId -Command $c -TimeOut 60
    Write-Output '==='
    Write-Output (($r.Output) -join "`n")
    if ($r.Error) { Write-Output (($r.Error) -join "`n") }
}
Remove-SSHSession -SessionId $session.SessionId | Out-Null
