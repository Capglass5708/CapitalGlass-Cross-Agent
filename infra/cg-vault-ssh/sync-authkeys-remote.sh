#!/bin/sh
set -eu
AK='command="/volume1/docker/cg-vault-ssh/bin/cg-vault-run.sh",no-port-forwarding,no-agent-forwarding,no-X11-forwarding,no-pty ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIB/ihipX6Clkyoj0ux8/ETqIWgPbzr6+PuawVINl1j66 cg-context-ledger@CG-NIMO-01 (context-ledger replication worker)'
printf '%s\n' "$AK" > /var/services/homes/cg-context-ledger/.ssh/authorized_keys
chown cg-context-ledger:users /var/services/homes/cg-context-ledger/.ssh/authorized_keys
chmod 600 /var/services/homes/cg-context-ledger/.ssh/authorized_keys
cp /var/services/homes/cg-context-ledger/.ssh/authorized_keys /volume1/docker/cg-vault-ssh/authorized_keys
chmod 600 /volume1/docker/cg-vault-ssh/authorized_keys
chown root:root /volume1/docker/cg-vault-ssh/authorized_keys
chmod 755 /volume1/docker/cg-vault-ssh
chown root:root /volume1/docker/cg-vault-ssh
sudo -u cg-context-ledger env SSH_ORIGINAL_COMMAND=VAULT_SSH_PROBE /volume1/docker/cg-vault-ssh/bin/cg-vault-run.sh
