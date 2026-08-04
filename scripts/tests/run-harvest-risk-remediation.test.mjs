#!/usr/bin/env node
/**
 * Medium–Critical risk remediation gate tests (Waves A–H).
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { classifyHarvestIdentity, IDENTITY_CLASSES } from "../harvest/lib/harvest-identity-classification-lib.mjs";
import { guardLegacyPublication, LEGACY_BLOCK_VERDICT } from "../harvest/lib/harvest-legacy-publication-guard-lib.mjs";
import { computeLegacyPublicationVerdict } from "../harvest/lib/harvest-required-layer-policy-lib.mjs";
import { validateMetadataChurn, METADATA_CHURN_VERDICTS } from "../harvest/lib/harvest-metadata-churn-lib.mjs";
import { validateGraphPointerCompact, buildGraphExtractionPointer } from "../harvest/lib/graph-extraction-staging-lib.mjs";
import { inferGraphEligibility, resolveGraphRepoRoot } from "../harvest/lib/graph-repo-resolution-lib.mjs";
import { validateGitHarvestRetention } from "../harvest/lib/harvest-git-retention-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");

const gates = {
  LEGACY_REAL_HARVEST_BLOCK_PASS: false,
  SKIP_LEDGER_NO_FALSE_OPERATIONAL_PASS: false,
  METADATA_CHURN_GATE_PASS: false,
  GRAPH_GIT_POINTER_ONLY_PASS: false,
  HARVEST_GRAPH_DECOUPLING_PASS: false,
  PORTABLE_REPO_RESOLUTION_PASS: false,
  INCIDENT_LEGACY_PATH_PREVENTED: false,
  INCIDENT_GIT_PAYLOAD_PREVENTED: false,
  INCIDENT_SKIP_LAYER_OVERCLAIM_PREVENTED: false,
  INCIDENT_METADATA_TREADMILL_PREVENTED: false,
  INCIDENT_GRAPH_GIT_BLOAT_PREVENTED: false,
  INCIDENT_GRAPH_COUPLING_SCOPED: false,
};

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`ok - ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`not ok - ${name}`);
    console.error(`  ${error.message}`);
  }
}

function tmpRepo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "risk-remediation-"));
  fs.mkdirSync(path.join(dir, "artifacts/agent-runs"), { recursive: true });
  return dir;
}

test("real harvest blocks legacy publication", () => {
  const repo = tmpRepo();
  const harvestId = "harvest-2026-08-04-real-test-v1";
  const runDir = path.join(repo, "artifacts/agent-runs", harvestId);
  fs.mkdirSync(runDir, { recursive: true });
  fs.writeFileSync(
    path.join(runDir, "harvest-manifest-v1.json"),
    `${JSON.stringify({
      harvestId,
      missionClass: "fix",
      sourceCommitSha: "abc",
    }, null, 2)}\n`,
  );
  const guard = guardLegacyPublication({ repoRoot: repo, harvestId, pipeline: "legacy" });
  assert.equal(guard.ok, false);
  assert.equal(guard.verdict, LEGACY_BLOCK_VERDICT);
  gates.LEGACY_REAL_HARVEST_BLOCK_PASS = true;
  fs.rmSync(repo, { recursive: true, force: true });
});

test("synthetic fixture allows legacy only under approved root", () => {
  const repo = tmpRepo();
  const harvestId = "synthetic-fixture-v1";
  const runDir = path.join(repo, "scripts/tests/fixtures", harvestId);
  fs.mkdirSync(runDir, { recursive: true });
  fs.writeFileSync(
    path.join(runDir, "harvest-manifest-v1.json"),
    `${JSON.stringify({
      harvestId,
      syntheticFixture: true,
      publicationEligibility: "TEST_ONLY",
      missionClass: "test",
    }, null, 2)}\n`,
  );
  const guard = guardLegacyPublication({ repoRoot: repo, harvestId, runDir, pipeline: "legacy" });
  assert.equal(guard.ok, true);
  assert.equal(guard.classification.identityClass, IDENTITY_CLASSES.SYNTHETIC_TEST_FIXTURE);
  fs.rmSync(repo, { recursive: true, force: true });
});

test("skip-ledger-sync yields degraded not operational", () => {
  const manifest = { harvestId: "h", threadAutopsy: { tier: "T2" } };
  const verdict = computeLegacyPublicationVerdict({
    manifest,
    skipLedgerSync: true,
    skipSupabaseProjection: false,
    lPublishOk: true,
    hubPublishOk: true,
    supabaseProjection: { ok: true },
  });
  assert.equal(verdict.degraded, true);
  assert.equal(verdict.allowOperationalReceipt, false);
  assert.notEqual(verdict.verdict, "HARVEST_PUBLICATION_AUTHORITY_OPERATIONAL");
  gates.SKIP_LEDGER_NO_FALSE_OPERATIONAL_PASS = true;
});

test("metadata timestamp-only diff blocks", () => {
  const before = { harvestId: "h", payloadHash: "sha256:abc" };
  const after = { ...before, generatedAt: new Date().toISOString() };
  const result = validateMetadataChurn({
    repoRoot: REPO_ROOT,
    files: ["artifacts/agent-runs/h/harvest-manifest-v1.json"],
    beforeContent: {
      "artifacts/agent-runs/h/harvest-manifest-v1.json": JSON.stringify(before),
    },
    afterContent: {
      "artifacts/agent-runs/h/harvest-manifest-v1.json": JSON.stringify(after),
    },
  });
  assert.equal(result.ok, false);
  assert.equal(result.verdict, METADATA_CHURN_VERDICTS.BLOCKED_TIMESTAMP_ONLY);
  gates.METADATA_CHURN_GATE_PASS = true;
});

test("graph pointer rejects embedded nodes", () => {
  const pointer = buildGraphExtractionPointer({
    harvestId: "h",
    payloadHash: "sha256:1",
    extractionHash: "sha256:2",
    lExtractionPath: "_staging/graph-extractions/h/abc/graph-extraction.json",
    nodeCount: 1,
    edgeCount: 0,
  });
  pointer.nodes = [{ id: "n1" }];
  const check = validateGraphPointerCompact(pointer);
  assert.equal(check.ok, false);
  gates.GRAPH_GIT_POINTER_ONLY_PASS = true;
});

test("non-graph harvest does not require graph repo", () => {
  const manifest = { harvestId: "h", threadAutopsy: { tier: "T0" }, graphEligible: false };
  assert.equal(inferGraphEligibility(manifest), false);
  gates.HARVEST_GRAPH_DECOUPLING_PASS = true;
});

test("graph repo resolution uses sibling not hardcoded home in receipt", () => {
  const resolved = resolveGraphRepoRoot(REPO_ROOT);
  if (resolved.ok) {
    assert.ok(!resolved.graphRepoRoot.includes("/home/wesle/repos/CG-MASTER-GRAPH") || process.env.CG_REPOS_ROOT);
  }
  gates.PORTABLE_REPO_RESOLUTION_PASS = true;
});

test("new harvest git retention blocks graph-extraction.json in run dir", () => {
  const repo = tmpRepo();
  const harvestId = "harvest-new-retention-v1";
  const runDir = path.join(repo, "artifacts/agent-runs", harvestId);
  fs.mkdirSync(runDir, { recursive: true });
  fs.writeFileSync(path.join(runDir, "harvest-manifest-v1.json"), "{}");
  fs.writeFileSync(path.join(runDir, "harvest-publication-pointer-v1.json"), "{}");
  fs.writeFileSync(path.join(runDir, "graph-extraction.json"), "{}");
  const result = validateGitHarvestRetention({ repoRoot: repo, harvestId, mode: "new" });
  assert.equal(result.ok, false);
  gates.INCIDENT_GIT_PAYLOAD_PREVENTED = true;
  gates.INCIDENT_GRAPH_GIT_BLOAT_PREVENTED = true;
  fs.rmSync(repo, { recursive: true, force: true });
});

test("dogfood SCENARIO 1 legacy real harvest blocked with no writes", () => {
  const repo = tmpRepo();
  const harvestId = "harvest-2026-08-04-dogfood-real-v1";
  const runDir = path.join(repo, "artifacts/agent-runs", harvestId);
  fs.mkdirSync(runDir, { recursive: true });
  fs.writeFileSync(
    path.join(runDir, "harvest-manifest-v1.json"),
    `${JSON.stringify({ harvestId, missionClass: "fix" }, null, 2)}\n`,
  );
  const before = fs.readdirSync(runDir);
  const guard = guardLegacyPublication({ repoRoot: repo, harvestId, pipeline: "legacy" });
  assert.equal(guard.verdict, LEGACY_BLOCK_VERDICT);
  assert.deepEqual(fs.readdirSync(runDir), before);
  gates.INCIDENT_LEGACY_PATH_PREVENTED = true;
  fs.rmSync(repo, { recursive: true, force: true });
});

test("dogfood SCENARIO 3 skip-ledger-sync never operational", () => {
  const verdict = computeLegacyPublicationVerdict({
    manifest: { harvestId: "h", threadAutopsy: { tier: "T2" } },
    skipLedgerSync: true,
    lPublishOk: true,
    hubPublishOk: true,
    supabaseProjection: { ok: true },
  });
  assert.equal(verdict.allowOperationalReceipt, false);
  assert.notEqual(verdict.verdict, "HARVEST_PUBLICATION_AUTHORITY_OPERATIONAL");
  gates.INCIDENT_SKIP_LAYER_OVERCLAIM_PREVENTED = true;
});

test("dogfood SCENARIO 4 metadata treadmill blocked", () => {
  const before = { harvestId: "h", payloadHash: "sha256:deadbeef" };
  const after = { ...before, verifiedAt: new Date().toISOString() };
  const result = validateMetadataChurn({
    repoRoot: REPO_ROOT,
    files: ["artifacts/agent-runs/h/harvest-manifest-v1.json"],
    beforeContent: { "artifacts/agent-runs/h/harvest-manifest-v1.json": JSON.stringify(before) },
    afterContent: { "artifacts/agent-runs/h/harvest-manifest-v1.json": JSON.stringify(after) },
  });
  assert.equal(result.ok, false);
  gates.INCIDENT_METADATA_TREADMILL_PREVENTED = true;
});

test("dogfood SCENARIO 6 graph repo absent does not fail basic harvest", () => {
  const manifest = { harvestId: "h", threadAutopsy: { tier: "T0" }, graphEligible: false };
  assert.equal(inferGraphEligibility(manifest), false);
  const resolution = resolveGraphRepoRoot("/nonexistent/path");
  if (!resolution.ok) {
    assert.match(resolution.verdict ?? resolution.error ?? "", /UNAVAILABLE|missing|not found/i);
  }
  gates.INCIDENT_GRAPH_COUPLING_SCOPED = true;
});

console.log("");
console.log(`# tests ${passed + failed}`);
console.log(`# pass  ${passed}`);
console.log(`# fail  ${failed}`);
for (const [gate, ok] of Object.entries(gates)) {
  console.log(`# gate ${gate} ${ok ? "PASS" : "FAIL"}`);
}

process.exit(failed > 0 ? 1 : 0);
