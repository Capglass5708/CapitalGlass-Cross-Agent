#!/usr/bin/env bash
# Adversarial VAULT_SHA256 refusal tests against CG Vault SSH.
set -euo pipefail
HOST="${CG_VAULT_SSH_HOST:-cg-server}"
PORT="${CG_VAULT_SSH_PORT:-22222}"
KEY="${CG_VAULT_SSH_KEY:-$HOME/.ssh/cg-context-ledger_ed25519}"
USER="${CG_VAULT_SSH_USER:-cg-context-ledger}"

ssh_cmd() {
  ssh -i "$KEY" -p "$PORT" -o BatchMode=yes -o IdentitiesOnly=yes \
    -o PasswordAuthentication=no "$USER@$HOST" "$@" 2>&1 || true
}

must_refuse() {
  local label="$1"; shift
  local out
  out=$(ssh_cmd "$@")
  if echo "$out" | grep -q 'REFUSED'; then
    echo "PASS refuse: $label"
  else
    echo "FAIL refuse: $label"
    echo "$out"
    exit 1
  fi
}

echo "=== probe ==="
out=$(ssh_cmd VAULT_SSH_PROBE)
echo "$out" | grep -q VAULT_SSH_OK

must_refuse '../etc/passwd' 'VAULT_SHA256 ../etc/passwd'
must_refuse 'absolute' 'VAULT_SHA256 /etc/passwd'
must_refuse 'traversal' 'VAULT_SHA256 ../../outside.txt'
must_refuse 'semicolon' 'VAULT_SHA256 foo;id'
must_refuse 'pipe' 'VAULT_SHA256 foo|id'
must_refuse 'shell' 'VAULT_SHA256 $(id)'
must_refuse 'arbitrary' id
must_refuse 'missing' 'VAULT_SHA256 does-not-exist-zzzz.txt'

echo "ALL_ADVERSARIAL_REFUSAL_TESTS=PASS"
