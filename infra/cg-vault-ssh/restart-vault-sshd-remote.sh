#!/bin/sh
set -eu
REMOTE_DIR=/volume1/docker/cg-vault-ssh
cp "$REMOTE_DIR/sshd_config.native" "$REMOTE_DIR/sshd_config"
if [ -f "$REMOTE_DIR/sshd.pid" ]; then
  kill "$(cat "$REMOTE_DIR/sshd.pid")" 2>/dev/null || true
  sleep 1
  rm -f "$REMOTE_DIR/sshd.pid"
fi
/usr/bin/sshd -f "$REMOTE_DIR/sshd_config"
sleep 1
ss -lntp | grep 22222 || true
