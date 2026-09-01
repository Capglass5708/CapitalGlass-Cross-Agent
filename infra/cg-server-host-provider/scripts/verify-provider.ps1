#Requires -Version 5.1
param(
    [string]$SshKey = "$env:USERPROFILE\.ssh\cg-context-ledger_ed25519",
    [string]$HostIp = '100.112.81.50',
    [int]$Port = 22222,
    [string]$User = 'cg-context-ledger'
)

$ErrorActionPreference = 'Continue'
Write-Output "HOST_PROVIDER_DIAGNOSTIC_PROBE:"
$probe = & ssh -i $SshKey -p $Port -o BatchMode=yes -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new "${User}@${HostIp}" VAULT_SSH_PROBE 2>&1
Write-Output $probe
if ($probe -match 'VAULT_SSH_OK') {
    Write-Output 'HOST_PROVIDER_DIAGNOSTIC=PASS'
} else {
    Write-Output 'HOST_PROVIDER_DIAGNOSTIC=FAIL'
}

Write-Output "ARBITRARY_COMMAND_REFUSAL:"
$arbitrary = & ssh -i $SshKey -p $Port -o BatchMode=yes -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new "${User}@${HostIp}" "id" 2>&1
Write-Output $arbitrary
if ($arbitrary -match 'REFUSED' -or $LASTEXITCODE -ne 0) {
    Write-Output 'ARBITRARY_COMMAND_EXECUTION=REFUSED'
} else {
    Write-Output 'ARBITRARY_COMMAND_EXECUTION=ALLOWED'
    exit 2
}

Write-Output @"
STORAGE_BINDING:
  machineIdentity: CG-SERVER
  storageAuthorityId: capital-glass-immutable-context-vault-v1
  hostPath: /volume1/Capital Glass/Capital-Glass-AI-Evidence-Vault
  containerPath: /vault
  executionProvider: container-dispatch
"@
