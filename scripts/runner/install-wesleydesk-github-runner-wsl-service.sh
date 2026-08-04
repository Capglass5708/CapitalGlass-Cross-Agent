#!/usr/bin/env bash
# Install GitHub Actions self-hosted runner for Cross-Agent index publication (WESLEYDESK WSL2 only).
set -euo pipefail

RUNNER_VERSION="${RUNNER_VERSION:-2.336.0}"
RUNNER_USER="${RUNNER_USER:-$USER}"
RUNNER_HOME="${RUNNER_HOME:-$HOME/actions-runner-cross-agent}"
REPO_URL="${REPO_URL:-https://github.com/Capglass5708/CapitalGlass-Cross-Agent}"
LABELS="${LABELS:-self-hosted,wesleydesk,wsl2}"
DRY_RUN=0
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

usage() {
  cat <<'EOF'
Usage: install-wesleydesk-github-runner-wsl-service.sh [--dry-run]

Installs the CapitalGlass-Cross-Agent index-publication self-hosted runner on WESLEYDESK WSL2.
Registration token is short-lived — obtain at install time only.

Environment:
  RUNNER_VERSION, RUNNER_HOME, REPO_URL, LABELS, REGISTRATION_TOKEN

Operator flow:
  1. On WESLEYDESK WSL: npm run runner:preflight
  2. GitHub → CapitalGlass-Cross-Agent → Settings → Actions → Runners → New self-hosted runner
     OR: gh api -X POST repos/Capglass5708/CapitalGlass-Cross-Agent/actions/runners/registration-token
  3. export REGISTRATION_TOKEN=<short-lived-token>
  4. bash scripts/runner/install-wesleydesk-github-runner-wsl-service.sh
  5. gh workflow run runner-smoke.yml --repo Capglass5708/CapitalGlass-Cross-Agent
EOF
}

for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown arg: $arg" >&2; usage; exit 1 ;;
  esac
done

log() { echo "[wesleydesk-cross-agent-runner] $*"; }

# Host gate — must be WESLEYDESK
WIN_NAME="$(cmd.exe /c "echo %COMPUTERNAME%" 2>/dev/null | tr -d '\r' || true)"
case "${WIN_NAME^^}" in
  WESLEYDESK|CG-WESLEYDESK-01|WESLEYDESK*)
    log "host gate PASS: $WIN_NAME"
    ;;
  *)
    log "host gate FAIL: expected WESLEYDESK, got '${WIN_NAME:-unknown}'"
    log "This runner serves index-publication.yml — install only on CG-WESLEYDESK-01 WSL."
    exit 1
    ;;
esac

for tool in curl tar systemctl node; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    log "missing required tool: $tool"
    exit 1
  fi
done

if command -v gh >/dev/null 2>&1; then
  VIS="$(gh repo view Capglass5708/CapitalGlass-Cross-Agent --json visibility -q .visibility 2>/dev/null || true)"
  if [[ "$VIS" == "PUBLIC" ]]; then
    log "SECURITY GATE FAIL: CapitalGlass-Cross-Agent is PUBLIC — runner registration forbidden"
    exit 1
  fi
  log "repository visibility: ${VIS:-unknown}"
fi

log "user=$RUNNER_USER home=$RUNNER_HOME repo=$REPO_URL"
log "labels=$LABELS version=$RUNNER_VERSION"

if [[ "$DRY_RUN" -eq 1 ]]; then
  log "DRY RUN — no download, registration, or service mutation"
  node "$SCRIPT_DIR/wesleydesk-index-publication-preflight.mjs" || true
  log "Next: export REGISTRATION_TOKEN then re-run without --dry-run"
  exit 0
fi

if [[ -z "${REGISTRATION_TOKEN:-}" ]]; then
  if command -v gh >/dev/null 2>&1; then
    log "REGISTRATION_TOKEN not set — requesting short-lived token via gh api"
    REGISTRATION_TOKEN="$(gh api -X POST "repos/Capglass5708/CapitalGlass-Cross-Agent/actions/runners/registration-token" -q .token)"
  fi
fi

if [[ -z "${REGISTRATION_TOKEN:-}" ]]; then
  log "REGISTRATION_TOKEN is required for live install."
  exit 1
fi

node "$SCRIPT_DIR/wesleydesk-index-publication-preflight.mjs"

mkdir -p "$RUNNER_HOME"
cd "$RUNNER_HOME"

if [[ ! -f ./config.sh ]]; then
  ARCH="x64"
  TARBALL="actions-runner-linux-${ARCH}-${RUNNER_VERSION}.tar.gz"
  curl -fsSL -o "$TARBALL" "https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/${TARBALL}"
  tar xzf "$TARBALL"
  rm -f "$TARBALL"
fi

./config.sh \
  --url "$REPO_URL" \
  --token "$REGISTRATION_TOKEN" \
  --name "wesleydesk-wsl2-$(hostname -s)-cross-agent" \
  --labels "$LABELS" \
  --unattended \
  --replace

unset REGISTRATION_TOKEN

sudo ./svc.sh install "$RUNNER_USER"
sudo ./svc.sh start
sudo ./svc.sh status || true

log "If sudo prompts for a password, install the service as root instead:"
log "  wsl.exe -d Ubuntu-24.04 -u root bash -lc 'cd $RUNNER_HOME && ./svc.sh install $RUNNER_USER && ./svc.sh start'"
log "Persist WSL DNS (once per machine, as root): bash $SCRIPT_DIR/configure-wesleydesk-wsl-network.sh"

log "install complete — runner labels: $LABELS"
log "verify: gh workflow run runner-smoke.yml --repo Capglass5708/CapitalGlass-Cross-Agent"
log "then dispatch index-publication.yml to clear queued publication jobs"
log "uninstall: cd $RUNNER_HOME && sudo ./svc.sh stop && sudo ./svc.sh uninstall && ./config.sh remove --token <remove-token>"
