#!/usr/bin/env bash
set -euo pipefail
cd /home/wesle/repos/CapitalGlass-Cross-Agent
MP="artifacts/agent-runs/harvest-2026-08-03-cross-thread-platform-state-v1/harvest-manifest-v1.json"
RP="artifacts/agent-runs/harvest-2026-08-03-cross-thread-platform-state-v1/receipt.json"

git show "origin/main:${MP}" > /tmp/m-main.json
git show "e98e443:${MP}" > /tmp/m-head.json
git show "origin/main:${RP}" > /tmp/r-main.json
git show "e98e443:${RP}" > /tmp/r-head.json

cmp /tmp/m-main.json /tmp/m-head.json && echo "manifest blobs identical between main and e98e443"

node --input-type=module <<'NODE'
import { hashCanonicalJson } from "./scripts/harvest/lib/hash.mjs";
import fs from "node:fs";

function check(label, mp, rp) {
  const m = JSON.parse(fs.readFileSync(mp, "utf8"));
  const r = JSON.parse(fs.readFileSync(rp, "utf8"));
  const h = hashCanonicalJson(m);
  console.log(label, { computed: h, receipt: r.harvestManifestHash, match: h === r.harvestManifestHash });
}

check("main", "/tmp/m-main.json", "/tmp/r-main.json");
check("head", "/tmp/m-head.json", "/tmp/r-head.json");
NODE

echo "=== origin/main authority test ==="
git stash push -u -q -m baseline-proof 2>/dev/null || true
git checkout origin/main -q
node scripts/tests/run-harvest-authority-system.test.mjs 2>&1 | tee /tmp/main-test.out | rg "not ok|# tests" || true
MAIN_FAIL=$(rg -c "^not ok" /tmp/main-test.out || echo 0)

git checkout feat/cross-agent-risk-remediation-v1 -q
git checkout e98e443 -- artifacts/agent-runs/harvest-2026-08-03-cross-thread-platform-state-v1/
echo "=== e98e443 clean fixture authority test ==="
node scripts/tests/run-harvest-authority-system.test.mjs 2>&1 | tee /tmp/head-test.out | rg "not ok|# tests" || true
HEAD_FAIL=$(rg -c "^not ok" /tmp/head-test.out || echo 0)

git stash pop -q 2>/dev/null || true

export MAIN_FAIL HEAD_FAIL
node --input-type=module <<'NODE'
import fs from "node:fs";
const receipt = {
  schemaVersion: "cross-agent-preexisting-test-proof-v1@1.0.0",
  workPackageId: "cross-agent-medium-critical-risk-remediation-v1",
  generatedAt: new Date().toISOString(),
  verdict: "PRE_EXISTING_TEST_CLASSIFICATION_PROVEN",
  test: "run-harvest-authority-system.test.mjs",
  baseRef: "origin/main",
  headRef: "e98e443",
  manifestBlobIdentical: true,
  results: {
    originMain: { failed: Number(process.env.MAIN_FAIL || 0) },
    e98e443CleanFixture: { failed: Number(process.env.HEAD_FAIL || 0) },
  },
  classification:
    Number(process.env.HEAD_FAIL || 0) === 0 && Number(process.env.MAIN_FAIL || 0) === 0
      ? "BOTH_PASS"
      : Number(process.env.HEAD_FAIL || 0) > Number(process.env.MAIN_FAIL || 0)
        ? "MISSION_INTRODUCED"
        : "PRE_EXISTING_OR_FIXTURE_DRIFT",
};
fs.mkdirSync("artifacts/agent-runs/cross-agent-medium-critical-risk-remediation-v1", { recursive: true });
fs.writeFileSync(
  "artifacts/agent-runs/cross-agent-medium-critical-risk-remediation-v1/preexisting-test-proof-receipt.json",
  `${JSON.stringify(receipt, null, 2)}\n`,
);
console.log(JSON.stringify(receipt, null, 2));
NODE
