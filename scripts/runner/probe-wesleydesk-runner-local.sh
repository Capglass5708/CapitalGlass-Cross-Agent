#!/usr/bin/env bash
# Local runner health probe (WSL). Writes JSON receipt on L: when mounted.
set -euo pipefail

RUNNER_USER="${RUNNER_USER:-wesley}"
RUNNER_UNIT="actions.runner.Capglass5708-CapitalGlass-Cross-Agent.wesleydesk-wsl2-cross-agent.service"
L_ROOT="${CG_L_DRIVE_ROOT:-/mnt/l}"
OUT_DIR="${L_ROOT}/02-catalog/runner-health"
OUT_FILE="${OUT_DIR}/wesleydesk-cross-agent-latest.json"
HOST="$(hostname -s 2>/dev/null || hostname)"

listener_running="false"
unit_active="false"
dns_ok="false"
l_mounted="false"

if getent hosts github.com >/dev/null 2>&1; then dns_ok="true"; fi
if [[ -d "$L_ROOT" ]]; then l_mounted="true"; fi
if systemctl is-active --quiet "$RUNNER_UNIT"; then unit_active="true"; fi
if pgrep -u "$RUNNER_USER" -f '[R]unner.Listener' >/dev/null; then listener_running="true"; fi

verdict="RUNNER_LOCAL_PROBE_FAIL"
if [[ "$dns_ok" == "true" && "$listener_running" == "true" && "$unit_active" == "true" ]]; then
  verdict="RUNNER_LOCAL_PROBE_PASS"
fi

generated_at="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
json="$(cat <<EOF
{
  "schemaVersion": "wesleydesk-runner-local-probe-v1@1.0.0",
  "generatedAt": "${generated_at}",
  "host": "${HOST}",
  "runnerUnit": "${RUNNER_UNIT}",
  "checks": {
    "dnsOk": ${dns_ok},
    "lDriveMounted": ${l_mounted},
    "systemdUnitActive": ${unit_active},
    "listenerRunning": ${listener_running}
  },
  "verdict": "${verdict}"
}
EOF
)"

echo "$json"

if [[ "$l_mounted" == "true" ]]; then
  mkdir -p "$OUT_DIR"
  tmp="${OUT_FILE}.$$.tmp"
  printf '%s\n' "$json" >"$tmp"
  mv -f "$tmp" "$OUT_FILE"
fi

if [[ "$verdict" != "RUNNER_LOCAL_PROBE_PASS" ]]; then
  exit 1
fi
