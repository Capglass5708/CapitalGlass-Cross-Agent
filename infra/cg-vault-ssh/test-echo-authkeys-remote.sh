#!/bin/sh
set -eu
AK='command="echo VAULT_SSH_OK",no-port-forwarding,no-agent-forwarding,no-X11-forwarding,no-pty ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIB/ihipX6Clkyoj0ux8/ETqIWgPbzr6+PuawVINl1j66 cg-context-ledger@CG-NIMO-01'
printf '%s\n' "$AK" > /var/services/homes/cg-context-ledger/.ssh/authorized_keys
chmod 600 /var/services/homes/cg-context-ledger/.ssh/authorized_keys
chown cg-context-ledger:users /var/services/homes/cg-context-ledger/.ssh/authorized_keys
