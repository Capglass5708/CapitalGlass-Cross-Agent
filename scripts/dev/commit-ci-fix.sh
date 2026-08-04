#!/usr/bin/env bash
set -euo pipefail
cd /home/wesle/repos/CapitalGlass-Cross-Agent

git add \
  package.json \
  .github/workflows/harvest-risk-gates.yml \
  scripts/harvest/check-metadata-churn.mjs \
  scripts/harvest/check-pr-governance.mjs \
  scripts/harvest/lib/harvest-pr-diff-lib.mjs \
  scripts/harvest/lib/harvest-pr-governance-lib.mjs \
  scripts/harvest/sync-derived.mjs \
  scripts/tests/run-harvest-git-retention.test.mjs \
  scripts/tests/run-harvest-pr-governance.test.mjs \
  artifacts/agent-runs/cross-agent-medium-critical-risk-remediation-v1/

git commit -m "$(cat <<'EOF'
fix(harvest): repair CI gates and PR-diff enforcement

Configure git identity for retention fixture tests in CI, run harvest-risk-gates
on every pull request with fetch-depth 0, add PR-diff governance and metadata
churn modes, fix sync-derived receipt/hash drift after graph projection writes,
and record base-vs-head test classification receipt.
EOF
)"

THREE_WAY_PUSH_APPROVED=YES git push origin feat/cross-agent-risk-remediation-v1
