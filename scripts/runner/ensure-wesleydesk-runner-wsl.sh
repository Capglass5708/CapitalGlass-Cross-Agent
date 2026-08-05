#!/usr/bin/env bash
# Idempotent WESLEYDESK runner + DNS recovery (run as root inside Ubuntu-24.04 WSL).
set -euo pipefail

NAMESERVER="${WESLEYDESK_WSL_NAMESERVER:-192.168.1.254}"
RUNNER_HOME="${RUNNER_HOME:-/home/wesley/actions-runner-cross-agent}"
RUNNER_USER="${RUNNER_USER:-wesley}"
RUNNER_UNIT="actions.runner.Capglass5708-CapitalGlass-Cross-Agent.wesleydesk-wsl2-cross-agent.service"
LOG_FILE="${CG_WESLEYDESK_RUNNER_ENSURE_LOG:-/var/log/cg-wesleydesk-runner-ensure.log}"
MAX_ATTEMPTS="${CG_WESLEYDESK_RUNNER_ENSURE_ATTEMPTS:-5}"
RETRY_SLEEP_SEC="${CG_WESLEYDESK_RUNNER_ENSURE_RETRY_SLEEP:-8}"

log() {
  local line="[$(date -Is)] $*"
  echo "$line"
  echo "$line" >>"$LOG_FILE"
}

if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
  echo "Run as root (wsl.exe -d Ubuntu-24.04 -u root)" >&2
  exit 1
fi

touch "$LOG_FILE"
chmod 644 "$LOG_FILE"

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

dns_ok() {
  getent hosts github.com >/dev/null 2>&1
}

attempt=1
while [[ "$attempt" -le "$MAX_ATTEMPTS" ]]; do
  if dns_ok; then
    log "DNS probe PASS (attempt ${attempt})"
    break
  fi
  log "DNS probe FAIL (attempt ${attempt}/${MAX_ATTEMPTS}) nameserver=${NAMESERVER}"
  systemctl start cg-wesleydesk-resolv.service || true
  sleep "$RETRY_SLEEP_SEC"
  attempt=$((attempt + 1))
done

if ! dns_ok; then
  log "DNS probe failed after ${MAX_ATTEMPTS} attempts"
  exit 1
fi

if [[ -d "$RUNNER_HOME" ]]; then
  cd "$RUNNER_HOME"
  if [[ ! -f /etc/systemd/system/${RUNNER_UNIT} ]]; then
    log "Installing runner systemd unit"
    ./svc.sh install "$RUNNER_USER"
  fi
  systemctl enable "$RUNNER_UNIT" 2>/dev/null || true
  systemctl start "$RUNNER_UNIT" || true
else
  log "RUNNER_HOME missing: ${RUNNER_HOME}"
  exit 1
fi

listener_ok() {
  pgrep -u "$RUNNER_USER" -f '[R]unner.Listener' >/dev/null
}

attempt=1
while [[ "$attempt" -le "$MAX_ATTEMPTS" ]]; do
  if listener_ok; then
    log "Runner.Listener PASS (attempt ${attempt})"
    break
  fi
  log "Runner.Listener not running (attempt ${attempt}/${MAX_ATTEMPTS})"
  systemctl restart "$RUNNER_UNIT" || true
  sleep "$RETRY_SLEEP_SEC"
  attempt=$((attempt + 1))
done

if ! listener_ok; then
  log "Runner.Listener failed after ${MAX_ATTEMPTS} attempts"
  systemctl status "$RUNNER_UNIT" --no-pager || true
  exit 1
fi

systemctl is-active "$RUNNER_UNIT"
log "WESLEYDESK runner ensure PASS"
