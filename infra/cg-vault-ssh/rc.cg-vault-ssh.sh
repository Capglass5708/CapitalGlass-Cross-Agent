#!/bin/sh
# Synology boot hook — start CG Vault SSH (dedicated port 22222).
case "$1" in
start)
  CFG=/volume1/docker/cg-vault-ssh/sshd_config
  PIDF=/volume1/docker/cg-vault-ssh/sshd.pid
  if [ ! -f "$CFG" ]; then
    exit 0
  fi
  if [ -f "$PIDF" ] && kill -0 "$(cat "$PIDF")" 2>/dev/null; then
    exit 0
  fi
  /usr/bin/sshd -f "$CFG"
  ;;
stop)
  PIDF=/volume1/docker/cg-vault-ssh/sshd.pid
  if [ -f "$PIDF" ]; then
    kill "$(cat "$PIDF")" 2>/dev/null || true
    rm -f "$PIDF"
  fi
  ;;
*)
  echo "Usage: $0 {start|stop}"
  exit 1
  ;;
esac
