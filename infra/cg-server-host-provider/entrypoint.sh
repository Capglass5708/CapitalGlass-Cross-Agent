#!/bin/sh
set -eu

SERVICE_UID="${CG_VAULT_UID:-1031}"
SERVICE_GID="${CG_VAULT_GID:-100}"

if [ ! -d /vault ]; then
  echo "FATAL: /vault mount missing" >&2
  exit 1
fi

if [ ! -f /etc/ssh/ssh_host_ed25519_key ]; then
  ssh-keygen -A
fi

mkdir -p /home/cg-context-ledger/.ssh
chmod 700 /home/cg-context-ledger/.ssh
if [ -f /config/authorized_keys ]; then
  cp /config/authorized_keys /home/cg-context-ledger/.ssh/authorized_keys
else
  echo "FATAL: authorized_keys not mounted" >&2
  exit 1
fi
chmod 600 /home/cg-context-ledger/.ssh/authorized_keys
chown -R "${SERVICE_UID}:${SERVICE_GID}" /home/cg-context-ledger

exec /usr/sbin/sshd -D -e
