#!/bin/sh
set -eu

VAULT_UID="${CG_VAULT_UID:-1031}"
VAULT_GID="${CG_VAULT_GID:-100}"

if [ ! -d /vault ]; then
  echo "FATAL: /vault mount missing" >&2
  exit 1
fi

if [ ! -f /etc/ssh/ssh_host_ed25519_key ]; then
  ssh-keygen -A
fi

mkdir -p /home/vault/.ssh
chmod 700 /home/vault/.ssh
if [ -f /run/secrets/authorized_keys ]; then
  cp /run/secrets/authorized_keys /home/vault/.ssh/authorized_keys
elif [ -f /config/authorized_keys ]; then
  cp /config/authorized_keys /home/vault/.ssh/authorized_keys
else
  echo "FATAL: authorized_keys not mounted" >&2
  exit 1
fi
chmod 600 /home/vault/.ssh/authorized_keys
chown -R "${VAULT_UID}:${VAULT_GID}" /home/vault

# Alpine locks passwordless accounts; pubkey-only SSH still requires an unlocked entry.
usermod -p '*' vault 2>/dev/null || true
chsh -s /bin/sh vault 2>/dev/null || true

exec /usr/sbin/sshd -D -e
