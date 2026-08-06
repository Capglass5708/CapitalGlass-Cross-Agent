#!/usr/bin/env node
/** Write Phase 0 milestone artifacts for harvest-publication-reliability-and-roi-hardening-v1 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = path.join(REPO_ROOT, "artifacts/agent-runs/harvest-publication-reliability-and-roi-hardening-v1");

function sha(repo) {
  return execSync("git rev-parse HEAD", { cwd: repo, encoding: "utf8" }).trim();
}

function write(name, value) {
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, name), `${JSON.stringify(value, null, 2)}\n`);
}

const repos = {
  "CapitalGlass-Cross-Agent": { path: REPO_ROOT, head: sha(REPO_ROOT) },
  "Data-Extraction": { path: "/home/wesley/repos/Data-Extraction", head: sha("/home/wesley/repos/Data-Extraction") },
  "CG-AppBuilder-MCP": { path: "/home/wesley/repos/CG-AppBuilder-MCP", head: sha("/home/wesley/repos/CG-AppBuilder-MCP") },
  "CG-Platform-Governance-MCP": {
    path: "/home/wesley/repos/CG-Platform-Governance-MCP",
    head: sha("/home/wesley/repos/CG-Platform-Governance-MCP"),
  },
};

write("baseline.json", {
  schema: "harvest-publication-hardening-baseline-v1@1.0.0",
  milestoneId: "harvest-publication-reliability-and-roi-hardening-v1",
  waveId: "harvest-publication-top10-roi-hardening-wave-v1",
  generatedAt: new Date().toISOString(),
  retrieval: { code: "INDEX_HIT", cache: "CACHE_MISS", rawScanRequired: false },
  repositories: repos,
  priorReceipts: [
    "artifacts/agent-runs/harvest-2026-08-06-harvest-protocol-self-learning-lane-closeout-v1/operational-publication-receipt.json",
  ],
});

write("current-publication-flow.json", {
  orchestrator: "scripts/harvest/lib/publish-intelligence-full-lib.mjs",
  hardenedWrapper: "scripts/harvest/lib/publication-hardening-orchestrator.mjs",
  phases: [
    "sync-derived",
    "z-mirror",
    "duplication-preflight",
    "validate",
    "compile-seed-packets",
    "blind-retrieval",
    "publish-hub-seed",
    "ledger-sync",
    "hot-routing",
    "optional-supabase",
    "consolidated-closeout",
  ],
  idempotency: "transaction-state.json per runId",
  authorityGuard: "z-mirror-authority-guard.mjs",
});

write("shared-publication-contract.json", {
  schema: "harvest-publication-run-v1@1.0.0",
  module: "scripts/harvest/lib/publication-run-contract.mjs",
});

write("test-matrix.json", {
  scenarios: [
    { id: "healthy-host", expected: "CLOSED_GO" },
    { id: "supabase-optional-unavailable", expected: "GO_WITH_WARN" },
    { id: "z-stale-overwrite", expected: "BLOCKED" },
    { id: "integrity-protocol-regression", expected: "INTEGRITY_FAIL" },
  ],
});

console.log(`Wrote milestone artifacts to ${OUT}`);
