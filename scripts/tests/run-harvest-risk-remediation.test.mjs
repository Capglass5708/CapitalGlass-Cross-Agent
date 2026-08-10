#!/usr/bin/env node
/**
 * Architecture reconciliation risk guards — modernized from PR #6 capability set.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { classifyHarvestIdentity, IDENTITY_CLASSES } from "../harvest/lib/harvest-identity-classification-lib.mjs";
import { guardLegacyPublication, LEGACY_BLOCK_VERDICT } from "../harvest/lib/harvest-legacy-publication-guard-lib.mjs";
import { computeLegacyPublicationVerdict, REQUIRED_LAYER_VERDICTS } from "../harvest/lib/harvest-required-layer-policy-lib.mjs";
import { validateMetadataChurn, METADATA_CHURN_VERDICTS } from "../harvest/lib/harvest-metadata-churn-lib.mjs";
import { resolveGraphRepoRoot } from "../harvest/lib/graph-repo-resolution-lib.mjs";
import { validateGitHarvestRetention } from "../harvest/lib/harvest-git-retention-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");

function withTempRun(fn) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "xa-risk-"));
  try {
    return fn(tmp);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

function writeManifest(runDir, harvestId, extra = {}) {
  fs.mkdirSync(runDir, { recursive: true });
  const manifest = {
    harvestId,
    missionClass: "thread-autopsy",
    threadAutopsy: { tier: "T2" },
    ...extra,
  };
  fs.writeFileSync(path.join(runDir, "harvest-manifest-v1.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

// --- identity / legacy guard ---
withTempRun((tmp) => {
  const harvestId = "harvest-risk-real-v1";
  const runDir = path.join(tmp, "artifacts/agent-runs", harvestId);
  writeManifest(runDir, harvestId);
  const classification = classifyHarvestIdentity({ repoRoot: tmp, harvestId, runDir });
  assert.equal(classification.identityClass, IDENTITY_CLASSES.REAL_HARVEST);
  const blocked = guardLegacyPublication({ repoRoot: tmp, harvestId, runDir, pipeline: "legacy" });
  assert.equal(blocked.ok, false);
  assert.equal(blocked.verdict, LEGACY_BLOCK_VERDICT);
});

withTempRun((tmp) => {
  const harvestId = "harvest-risk-synth-v1";
  const runDir = path.join(tmp, "scripts/tests/fixtures", harvestId);
  writeManifest(runDir, harvestId, { syntheticFixture: true, publicationEligibility: "TEST_ONLY" });
  const allowed = guardLegacyPublication({ repoRoot: tmp, harvestId, runDir, pipeline: "legacy" });
  assert.equal(allowed.ok, true);
  assert.equal(allowed.verdict, "LEGACY_SYNTHETIC_ALLOWED");
});

// --- required layer truth ---
{
  const degraded = computeLegacyPublicationVerdict({
    manifest: { harvestId: "h1", threadAutopsy: { tier: "T2" } },
    skipLedgerSync: true,
    skipSupabaseProjection: true,
    lPublishOk: true,
    hubPublishOk: true,
  });
  assert.equal(degraded.degraded, true);
  assert.equal(degraded.verdict, REQUIRED_LAYER_VERDICTS.DEGRADED);
  assert.equal(degraded.allowOperationalReceipt, false);

  const operational = computeLegacyPublicationVerdict({
    manifest: { harvestId: "h1", threadAutopsy: { tier: "T1" } },
    skipLedgerSync: false,
    skipSupabaseProjection: false,
    lPublishOk: true,
    hubPublishOk: true,
    supabaseProjection: { ok: true },
  });
  assert.equal(operational.verdict, REQUIRED_LAYER_VERDICTS.OPERATIONAL);
  assert.equal(operational.allowOperationalReceipt, true);
}

// --- metadata churn ---
{
  const before = { harvestId: "h1", generatedAt: "2026-01-01T00:00:00Z", value: 1 };
  const after = { harvestId: "h1", generatedAt: "2026-01-02T00:00:00Z", value: 1 };
  const churn = validateMetadataChurn({
    files: ["artifacts/agent-runs/h1/harvest-manifest-v1.json"],
    beforeContent: { "artifacts/agent-runs/h1/harvest-manifest-v1.json": before },
    afterContent: { "artifacts/agent-runs/h1/harvest-manifest-v1.json": after },
  });
  assert.equal(churn.ok, false);
  assert.equal(churn.verdict, METADATA_CHURN_VERDICTS.BLOCKED_TIMESTAMP_ONLY);

  const receiptBlock = validateMetadataChurn({
    files: ["artifacts/agent-runs/h1/operational-publication-receipt.json"],
  });
  assert.equal(receiptBlock.ok, false);
  assert.equal(receiptBlock.verdict, METADATA_CHURN_VERDICTS.BLOCKED_RUNTIME_RECEIPT);
}

// --- portable graph resolution ---
{
  const unavailable = resolveGraphRepoRoot(REPO_ROOT, { graphRepoRoot: path.join(os.tmpdir(), "no-such-graph") });
  assert.equal(unavailable.ok, false);
  assert.equal(unavailable.verdict, "GRAPH_AUTHORITY_UNAVAILABLE");

  const sibling = resolveGraphRepoRoot(REPO_ROOT);
  // Sibling may or may not exist in CI; just ensure API shape.
  assert.equal(typeof sibling.ok, "boolean");
  assert.ok(sibling.resolution);
}

// --- git retention forbids graph / operational payloads ---
withTempRun((tmp) => {
  const harvestId = "harvest-retention-graph-v1";
  const runDir = path.join(tmp, "artifacts/agent-runs", harvestId);
  fs.mkdirSync(runDir, { recursive: true });
  fs.writeFileSync(
    path.join(runDir, "harvest-manifest-v1.json"),
    `${JSON.stringify({ harvestId, sourceCommitSha: "a".repeat(40), payloadHash: "sha256:abc" }, null, 2)}\n`,
  );
  fs.writeFileSync(
    path.join(runDir, "harvest-publication-pointer-v1.json"),
    `${JSON.stringify({ harvestId, payloadHash: "sha256:abc", sourceCommitSha: "a".repeat(40) }, null, 2)}\n`,
  );
  fs.writeFileSync(path.join(runDir, "graph-extraction.json"), `${JSON.stringify({ nodes: [] }, null, 2)}\n`);

  const result = validateGitHarvestRetention({
    repoRoot: tmp,
    harvestId,
    mode: "new",
  });
  assert.equal(result.ok, false);
  assert.ok(
    (result.failures ?? []).some((f) => String(f).includes("graph-extraction.json")),
    `expected graph-extraction forbidden, got ${JSON.stringify(result)}`,
  );
});

console.log("run-harvest-risk-remediation.test.mjs: PASS");
