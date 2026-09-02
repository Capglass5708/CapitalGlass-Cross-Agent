#!/bin/sh
set -eu
REMOTE_DIR=/volume1/docker/cg-vault-ssh
mkdir -p "$REMOTE_DIR/bin" "$REMOTE_DIR/ssh-keys"
cp "$REMOTE_DIR/sshd_config.native" "$REMOTE_DIR/sshd_config"
cp "$REMOTE_DIR/authorized_keys.native" "$REMOTE_DIR/authorized_keys"
cp "$REMOTE_DIR/cg-vault-dispatch.py" "$REMOTE_DIR/bin/cg-vault-dispatch.py"
cp "$REMOTE_DIR/cg-vault-run.sh" "$REMOTE_DIR/bin/cg-vault-run.sh"
chmod 755 "$REMOTE_DIR/bin/cg-vault-run.sh" "$REMOTE_DIR/bin/cg-vault-dispatch.py"
chmod 600 "$REMOTE_DIR/authorized_keys"
if [ ! -f "$REMOTE_DIR/ssh-keys/ssh_host_ed25519_key" ]; then
  /usr/bin/ssh-keygen -t ed25519 -f "$REMOTE_DIR/ssh-keys/ssh_host_ed25519_key" -N ''
  /usr/bin/ssh-keygen -t rsa -b 4096 -f "$REMOTE_DIR/ssh-keys/ssh_host_rsa_key" -N ''
fi
chmod 600 "$REMOTE_DIR/ssh-keys/"*
if [ -f "$REMOTE_DIR/sshd.pid" ]; then
  OLD_PID=$(cat "$REMOTE_DIR/sshd.pid")
  kill "$OLD_PID" 2>/dev/null || true
  rm -f "$REMOTE_DIR/sshd.pid"
fi
/usr/bin/sshd -f "$REMOTE_DIR/sshd_config"
sleep 1
if [ -f "$REMOTE_DIR/sshd.pid" ]; then
  echo CG_VAULT_SSHD_STARTED=1
else
  echo CG_VAULT_SSHD_STARTED=0
fi
ss -lntp 2>/dev/null | grep 22222 || netstat -lntp 2>/dev/null | grep 22222 || true
cp "$REMOTE_DIR/rc.cg-vault-ssh.sh" /usr/local/etc/rc.d/cg-vault-ssh.sh
chmod 755 /usr/local/etc/rc.d/cg-vault-ssh.sh
