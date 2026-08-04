#!/usr/bin/env bash
# Persist WSL DNS on WESLEYDESK (run as root or via: wsl.exe -d Ubuntu-24.04 -u root bash configure-wesleydesk-wsl-network.sh)
set -euo pipefail

WSL_CONF=/etc/wsl.conf
RESOLV_CONF=/etc/resolv.conf
NAMESERVER="${WESLEYDESK_WSL_NAMESERVER:-192.168.1.254}"

if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
  echo "Run as root (sudo or wsl.exe -u root)" >&2
  exit 1
fi

WIN_NAME="$(cmd.exe /c "echo %COMPUTERNAME%" 2>/dev/null | tr -d '\r' || true)"
case "${WIN_NAME^^}" in
  WESLEYDESK|CG-WESLEYDESK-01|WESLEYDESK*) ;;
  *)
    echo "host gate FAIL: expected WESLEYDESK, got '${WIN_NAME:-unknown}'" >&2
    exit 1
    ;;
esac

mkdir -p /etc
cat >"$WSL_CONF" <<'EOF'
[boot]
systemd=true

[network]
generateResolvConf = false
EOF

printf 'nameserver %s\n' "$NAMESERVER" >"$RESOLV_CONF"
chmod 644 "$RESOLV_CONF"

if ! getent hosts github.com >/dev/null 2>&1; then
  echo "DNS probe failed after configure (nameserver $NAMESERVER)" >&2
  exit 1
fi

echo "WESLEYDESK WSL DNS configured: nameserver=$NAMESERVER"
