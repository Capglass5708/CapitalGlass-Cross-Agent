#!/usr/bin/env bash
# Idempotent WESLEYDESK runner + DNS recovery (run as root inside Ubuntu-24.04 WSL).
set -euo pipefail

NAMESERVER="${WESLEYDESK_WSL_NAMESERVER:-192.168.1.254}"
RUNNER_HOME="${RUNNER_HOME:-/home/wesley/actions-runner-cross-agent}"
RUNNER_USER="${RUNNER_USER:-wesley}"
RUNNER_UNIT="actions.runner.Capglass5708-CapitalGlass-Cross-Agent.wesleydesk-wsl2-cross-agent.service"

if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
  echo "Run as root (wsl.exe -d Ubuntu-24.04 -u root)" >&2
  exit 1
fi

cat >/etc/wsl.conf <<'EOF'
[boot]
systemd=true

[network]
generateResolvConf = false
EOF

cat >/etc/systemd/system/cg-wesleydesk-resolv.service <<EOF
[Unit]
Description=Capital Glass WESLEYDESK WSL DNS
DefaultDependencies=no
Before=network-online.target
After=local-fs.target

[Service]
Type=oneshot
ExecStart=/bin/sh -c 'printf "nameserver ${NAMESERVER}\\n" > /etc/resolv.conf && chmod 644 /etc/resolv.conf'
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable cg-wesleydesk-resolv.service
systemctl start cg-wesleydesk-resolv.service

if ! getent hosts github.com >/dev/null 2>&1; then
  echo "DNS probe failed (nameserver ${NAMESERVER})" >&2
  exit 1
fi

if [[ -d "$RUNNER_HOME" ]]; then
  cd "$RUNNER_HOME"
  if [[ ! -f /etc/systemd/system/${RUNNER_UNIT} ]]; then
    ./svc.sh install "$RUNNER_USER"
  fi
  systemctl enable "$RUNNER_UNIT" 2>/dev/null || true
  systemctl start "$RUNNER_UNIT"
fi

sleep 3
if ! pgrep -u "$RUNNER_USER" -f '[R]unner.Listener' >/dev/null; then
  echo "Runner.Listener not running for user ${RUNNER_USER}" >&2
  systemctl status "$RUNNER_UNIT" --no-pager || true
  exit 1
fi

systemctl is-active "$RUNNER_UNIT"
echo "WESLEYDESK runner ensure PASS"
