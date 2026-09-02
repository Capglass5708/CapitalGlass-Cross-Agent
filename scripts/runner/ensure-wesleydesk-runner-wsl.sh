#!/usr/bin/env bash
# Idempotent WESLEYDESK runner + DNS + listener recovery (root inside Ubuntu-24.04 WSL).
# Invoked by install-wesleydesk-runner-autostart.ps1 watchdog (every 5m) and manual recovery.
set -euo pipefail

NAMESERVER="${WESLEYDESK_WSL_NAMESERVER:-192.168.1.254}"
RUNNER_HOME="${RUNNER_HOME:-/home/wesley/actions-runner-cross-agent}"
RUNNER_USER="${RUNNER_USER:-wesley}"
RUNNER_UNIT="actions.runner.Capglass5708-CapitalGlass-Cross-Agent.wesleydesk-wsl2-cross-agent.service"
RECEIPT_DIR="${CG_RUNNER_ENSURE_RECEIPT_DIR:-/var/log/cg-wesleydesk-runner}"
DNS_ATTEMPTS="${CG_RUNNER_DNS_ATTEMPTS:-8}"
LISTENER_ATTEMPTS="${CG_RUNNER_LISTENER_ATTEMPTS:-8}"
LISTENER_SLEEP_SEC="${CG_RUNNER_LISTENER_SLEEP_SEC:-8}"

log() {
  printf '[%s] %s\n' "$(date -Iseconds)" "$*"
}

if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
  echo "Run as root (wsl.exe -d Ubuntu-24.04 -u root)" >&2
  exit 1
fi

mkdir -p "$RECEIPT_DIR"

cat >/etc/wsl.conf <<'EOF'
[boot]
systemd=true

[network]
generateResolvConf = false
EOF

cat >/etc/systemd/system/cg-wesleydesk-resolv.service <<'UNITEOF'
[Unit]
Description=Capital Glass WESLEYDESK WSL DNS
DefaultDependencies=no
Before=network-online.target
After=local-fs.target

[Service]
Type=oneshot
ExecStart=/bin/sh -c 'printf "nameserver NAMESERVER_PLACEHOLDER\n" > /etc/resolv.conf && chmod 644 /etc/resolv.conf'
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
UNITEOF
sed -i "s/NAMESERVER_PLACEHOLDER/${NAMESERVER}/" /etc/systemd/system/cg-wesleydesk-resolv.service

KEEPALIVE_UNIT=/etc/systemd/system/cg-wesleydesk-wsl-keepalive.service
if [[ -f "${RUNNER_HOME%/actions-runner-cross-agent}/repos/CapitalGlass-Cross-Agent/scripts/runner/cg-wesleydesk-wsl-keepalive.service" ]]; then
  cp "${RUNNER_HOME%/actions-runner-cross-agent}/repos/CapitalGlass-Cross-Agent/scripts/runner/cg-wesleydesk-wsl-keepalive.service" "$KEEPALIVE_UNIT"
elif [[ -f /home/wesley/repos/CapitalGlass-Cross-Agent/scripts/runner/cg-wesleydesk-wsl-keepalive.service ]]; then
  cp /home/wesley/repos/CapitalGlass-Cross-Agent/scripts/runner/cg-wesleydesk-wsl-keepalive.service "$KEEPALIVE_UNIT"
fi
if [[ -f "$KEEPALIVE_UNIT" ]]; then
  systemctl daemon-reload
  systemctl enable cg-wesleydesk-wsl-keepalive.service >/dev/null 2>&1 || true
  systemctl start cg-wesleydesk-wsl-keepalive.service >/dev/null 2>&1 || true
fi

systemctl daemon-reload
systemctl enable cg-wesleydesk-resolv.service >/dev/null 2>&1 || true
systemctl start cg-wesleydesk-resolv.service

dns_ok=0
for attempt in $(seq 1 "$DNS_ATTEMPTS"); do
  if getent hosts github.com >/dev/null 2>&1; then
    log "DNS probe PASS (attempt ${attempt})"
    dns_ok=1
    break
  fi
  log "DNS probe waiting (attempt ${attempt}/${DNS_ATTEMPTS})"
  sleep 2
done
if [[ "$dns_ok" -ne 1 ]]; then
  log "DNS probe FAIL (nameserver ${NAMESERVER})"
  exit 1
fi

if [[ ! -d "$RUNNER_HOME" ]]; then
  log "Runner home missing: ${RUNNER_HOME}"
  exit 1
fi

cd "$RUNNER_HOME"
if [[ ! -f /etc/systemd/system/${RUNNER_UNIT} ]]; then
  log "Installing runner systemd unit"
  ./svc.sh install "$RUNNER_USER"
fi
systemctl enable "$RUNNER_UNIT" >/dev/null 2>&1 || true
systemctl start "$RUNNER_UNIT" || true

listener_ok=0
for attempt in $(seq 1 "$LISTENER_ATTEMPTS"); do
  if pgrep -u "$RUNNER_USER" -f '[R]unner.Listener' >/dev/null; then
    log "Runner.Listener PASS (attempt ${attempt})"
    listener_ok=1
    break
  fi
  log "Runner.Listener not running (attempt ${attempt}/${LISTENER_ATTEMPTS})"
  systemctl start "$RUNNER_UNIT" 2>/dev/null || true
  sleep "$LISTENER_SLEEP_SEC"
done

if [[ "$listener_ok" -ne 1 ]]; then
  log "Runner.Listener FAIL after ${LISTENER_ATTEMPTS} attempts"
  systemctl status "$RUNNER_UNIT" --no-pager || true
  exit 1
fi

unit_state="$(systemctl is-active "$RUNNER_UNIT")"
log "systemd unit ${RUNNER_UNIT}: ${unit_state}"
log "WESLEYDESK runner ensure PASS"

cat >"${RECEIPT_DIR}/latest-ensure.json" <<EOF
{"schemaVersion":"wesleydesk-runner-ensure-v2@1.0.0","verdict":"PASS","at":"$(date -Iseconds)","runnerUnit":"${RUNNER_UNIT}","unitState":"${unit_state}","runnerHome":"${RUNNER_HOME}"}
EOF
