#!/usr/bin/env bash
# Read-only WSL integration regression — no L:/Z: writes, no merge/cutover.
set -o pipefail
cd /home/wesle/repos/CapitalGlass-Cross-Agent

RECEIPT_DIR="artifacts/agent-runs/cross-agent-medium-critical-risk-remediation-v1"
RECEIPT="${RECEIPT_DIR}/wsl-integration-regression-receipt.json"
mkdir -p "$RECEIPT_DIR"

CROSS_AGENT_SHA=$(git rev-parse HEAD)
CROSS_AGENT_SHORT=$(git rev-parse --short HEAD)
APPBUILDER_SHA=$(git -C ../CG-AppBuilder-MCP rev-parse HEAD 2>/dev/null || echo "MISSING")
APPBUILDER_SHORT=$(git -C ../CG-AppBuilder-MCP rev-parse --short HEAD 2>/dev/null || echo "MISSING")
BASE_SHA=$(git merge-base HEAD origin/main)
L_MOUNT=$(test -d /mnt/l/Capital-Glass-Intelligence-Hub/00-master-index && echo true || echo false)
Z_MOUNT=$(test -d /mnt/z/Capital-Glass-Intelligence-Hub && echo true || echo false)

RESULTS_FILE=$(mktemp)
: > "$RESULTS_FILE"
FAIL=0

run_suite() {
  local name="$1"
  shift
  echo ""
  echo "===== $name ====="
  echo "CMD: $*"
  local out
  local ec=0
  out=$("$@" 2>&1) || ec=$?
  echo "$out" | tail -8
  if [ "$ec" -eq 0 ]; then
    echo "${name}=PASS" >> "$RESULTS_FILE"
  else
    echo "${name}=FAIL" >> "$RESULTS_FILE"
    FAIL=1
  fi
  echo "exit=$ec"
}

git checkout HEAD -- artifacts/agent-runs/harvest-2026-08-03-cross-thread-platform-state-v1/ 2>/dev/null || true

echo "=== WSL INTEGRATION REGRESSION ==="
echo "cross_agent=$CROSS_AGENT_SHA"
echo "appbuilder=$APPBUILDER_SHA"
echo "base=$BASE_SHA"

run_suite "test:harvest:risk-remediation" npm run test:harvest:risk-remediation
run_suite "test:harvest:git-retention" npm run test:harvest:git-retention
run_suite "test:harvest:identity" npm run test:harvest:identity
run_suite "test:harvest:pr-governance" npm run test:harvest:pr-governance
run_suite "harvest:check-pr-governance" node scripts/harvest/check-pr-governance.mjs --base-ref="$BASE_SHA" --json
run_suite "harvest:check-metadata-churn-pr-diff" node scripts/harvest/check-metadata-churn.mjs --mode=pr-diff --base-ref="$BASE_SHA" --head-ref=HEAD --json
run_suite "test:harvest:layered-verdict" npm run test:harvest:layered-verdict
run_suite "test:harvest:authority-dogfood" npm run test:harvest:authority-dogfood
run_suite "test:harvest:phase-c" npm run test:harvest:phase-c
run_suite "test:harvest:content-freshness" npm run test:harvest:content-freshness
run_suite "CG-AppBuilder-MCP:test:cross-agent-harvest-projection" npm --prefix ../CG-AppBuilder-MCP run test:cross-agent-harvest-projection

VERDICT="WSL_INTEGRATION_REGRESSION_FAIL"
if [ "$FAIL" -eq 0 ]; then
  VERDICT="CODE_READY_INTEGRATION_PASS_LIVE_STORAGE_PENDING"
fi

node --input-type=module <<NODE
import fs from "node:fs";
const results = Object.fromEntries(
  fs.readFileSync("${RESULTS_FILE}", "utf8")
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const i = line.indexOf("=");
      return [line.slice(0, i), line.slice(i + 1)];
    }),
);
const receipt = {
  schemaVersion: "cross-agent-wsl-integration-regression-receipt-v1@1.0.0",
  workPackageId: "cross-agent-medium-critical-risk-remediation-v1",
  generatedAt: new Date().toISOString(),
  verdict: "${VERDICT}",
  executionEnvironment: "WSL2_NATIVE",
  readOnly: true,
  noLWrites: true,
  noZWrites: true,
  lMount: ${L_MOUNT},
  zMount: ${Z_MOUNT},
  repositories: {
    crossAgent: {
      branch: "feat/cross-agent-risk-remediation-v1",
      headSha: "${CROSS_AGENT_SHA}",
      headShort: "${CROSS_AGENT_SHORT}",
    },
    appBuilder: {
      siblingPresent: "${APPBUILDER_SHA}" !== "MISSING",
      headSha: "${APPBUILDER_SHA}",
      headShort: "${APPBUILDER_SHORT}",
    },
  },
  mergeBaseWithMain: "${BASE_SHA}",
  suites: results,
  mergeReady: false,
  liveStorageGate: "PENDING",
  receiptPath: "${RECEIPT}",
};
fs.writeFileSync("${RECEIPT}", JSON.stringify(receipt, null, 2) + "\n");
console.log(JSON.stringify(receipt, null, 2));
NODE

rm -f "$RESULTS_FILE"
echo ""
echo "VERDICT=${VERDICT}"
echo "RECEIPT=${RECEIPT}"
exit "$FAIL"
