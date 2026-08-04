#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { bundleLayout, publishLDurableBundle, stageLDurableBundle } from "../harvest/lib/l-durable-bundle-lib.mjs";
import {
  COORDINATION_INDEX_VERDICTS,
  evaluateHarvestContentFreshness,
  HARVEST_FRESHNESS_VERDICTS,
  TARGET_VERDICT,
} from "../harvest/lib/harvest-content-freshness-lib.mjs";
import {
  QUALITY_RECEIPT_FILENAME,
  validateKnowledgeQuality,
  writeKnowledgeQualityReceipt,
} from "../harvest/lib/knowledge-quality-gate-lib.mjs";
import {
  createDefaultLDurablePublisher,
  createDefaultLayerVerifier,
  createDefaultOperationWriter,
  createDefaultSupabaseProjector,
  createDefaultZPublisher,
  runPhaseBPublication,
} from "../harvest/lib/phase-b-publication-orchestrator-lib.mjs";
import { materializePhaseCPointer } from "../harvest/lib/phase-c-pointer-materialization-lib.mjs";
import { clearSupabaseProjectionMemory } from "../harvest/lib/supabase-projection-adapter-lib.mjs";
import { PHASE_B_VERDICTS } from "../harvest/lib/publication-layer-verdict-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const PASS_FIXTURE = path.join(REPO_ROOT, "scripts/tests/fixtures/harvest-knowledge-quality-pass-v1/source");
const WAVE2_FIXTURE = path.join(REPO_ROOT, "scripts/tests/fixtures/harvest-l-durable-publisher-v1/source");
const HARVEST_ID = "harvest-knowledge-quality-pass-v1";
const WAVE2_ID = "harvest-wave2-l-durable-fixture-v1";

const gateProofs = {
  CONTENT_HASH_FRESHNESS_PASS: false,
  HEAD_INDEPENDENCE_PASS: false,
  POINTER_COMMIT_NO_LOOP_PASS: false,
  INDEX_SEPARATION_PASS: false,
  DERIVED_LAYER_DEGRADATION_PASS: false,
  L_AUTHORITY_FAILURE_PASS: false,
  SUPERSESSION_FRESHNESS_PASS: false,
  NOOP_FRESHNESS_PASS: false,
  NO_GIT_MUTATION_PASS: false,
  NO_AUTOMATIC_REPUBLICATION_PASS: false,
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

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function copyFixtureToTemp(sourceDir) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "harvest-fresh-run-"));
  fs.cpSync(sourceDir, tempDir, { recursive: true });
  return tempDir;
}

function initTempGitRepo() {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), "harvest-fresh-git-"));
  fs.mkdirSync(path.join(repoRoot, "artifacts/agent-runs"), { recursive: true });
  fs.writeFileSync(path.join(repoRoot, "README.md"), "# freshness temp repo\n");
  execFileSync("git", ["init"], { cwd: repoRoot });
  execFileSync("git", ["config", "user.email", "freshness@test.local"], { cwd: repoRoot });
  execFileSync("git", ["config", "user.name", "Freshness Test"], { cwd: repoRoot });
  execFileSync("git", ["add", "."], { cwd: repoRoot });
  execFileSync("git", ["commit", "-m", "init"], { cwd: repoRoot });
  return repoRoot;
}

function gitHead(repoRoot) {
  return execFileSync("git", ["-C", repoRoot, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
}

function gitPorcelain(repoRoot) {
  return execFileSync("git", ["-C", repoRoot, "status", "--porcelain"], { encoding: "utf8" });
}

function seedCoordinationIndex(hubRoot, sourceCommitSha) {
  const dir = path.join(hubRoot, "00-master-index", "active-work-ledger");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, "LATEST.json"),
    `${JSON.stringify({ sourceCommitSha, updatedAt: new Date().toISOString() }, null, 2)}\n`,
  );
}

function prepareFullLifecycle(hubRoot, zCacheRoot, repoRoot) {
  const runDir = copyFixtureToTemp(PASS_FIXTURE);
  const manifest = readJson(path.join(runDir, "harvest-manifest-v1.json"));
  const qualityReceipt = validateKnowledgeQuality({ manifest, runDir });
  writeKnowledgeQualityReceipt(runDir, qualityReceipt);
  const staged = stageLDurableBundle({ hubRoot, sourceRunDir: runDir, harvestId: HARVEST_ID });
  const phaseB = runPhaseBPublication({
    hubRoot,
    harvestId: HARVEST_ID,
    payloadHash: staged.payloadHash,
    lDurablePublisher: createDefaultLDurablePublisher(),
    zPublisher: createDefaultZPublisher({ zCacheRoot }),
    supabaseProjector: createDefaultSupabaseProjector({ hubRoot, useMemoryStore: true }),
    layerVerifier: createDefaultLayerVerifier(),
    operationWriter: createDefaultOperationWriter(),
  });
  materializePhaseCPointer({
    hubRoot,
    harvestId: HARVEST_ID,
    payloadHash: staged.payloadHash,
    repoRoot,
    apply: true,
    env: { PHASE_C_POINTER_APPROVED: "1" },
  });
  return { payloadHash: staged.payloadHash, phaseB };
}

function withLifecycle(fn) {
  const hubRoot = fs.mkdtempSync(path.join(os.tmpdir(), "harvest-fresh-hub-"));
  const zCacheRoot = fs.mkdtempSync(path.join(os.tmpdir(), "harvest-fresh-z-"));
  const repoRoot = initTempGitRepo();
  seedCoordinationIndex(hubRoot, gitHead(repoRoot));
  try {
    return fn({ hubRoot, zCacheRoot, repoRoot });
  } finally {
    fs.rmSync(hubRoot, { recursive: true, force: true });
    fs.rmSync(zCacheRoot, { recursive: true, force: true });
    fs.rmSync(repoRoot, { recursive: true, force: true });
    clearSupabaseProjectionMemory();
  }
}

test("synthetic lifecycle complete after Phase C yields HARVEST_CURRENT", () => {
  withLifecycle(({ hubRoot, zCacheRoot, repoRoot }) => {
    const { payloadHash } = prepareFullLifecycle(hubRoot, zCacheRoot, repoRoot);
    const receipt = evaluateHarvestContentFreshness({
      hubRoot,
      harvestId: HARVEST_ID,
      repoRoot,
      zCacheRoot,
    });
    assert.equal(receipt.harvestVerdict, HARVEST_FRESHNESS_VERDICTS.CURRENT);
    assert.equal(receipt.targetVerdict, TARGET_VERDICT);
    assert.equal(receipt.layerAlignment.lDurablePayloadHash, payloadHash);
    assert.equal(receipt.layerAlignment.zSourcePayloadHash, payloadHash);
    assert.equal(receipt.layerAlignment.supabaseSourcePayloadHash, payloadHash);
    assert.equal(receipt.layerAlignment.gitPointerPayloadHash, payloadHash);
    gateProofs.CONTENT_HASH_FRESHNESS_PASS = true;
    gateProofs.POINTER_COMMIT_NO_LOOP_PASS = true;
  });
});

test("unrelated Git commit does not change harvest freshness", () => {
  withLifecycle(({ hubRoot, zCacheRoot, repoRoot }) => {
    prepareFullLifecycle(hubRoot, zCacheRoot, repoRoot);
    const before = evaluateHarvestContentFreshness({
      hubRoot,
      harvestId: HARVEST_ID,
      repoRoot,
      zCacheRoot,
    });
    const headBefore = gitHead(repoRoot);
    fs.writeFileSync(path.join(repoRoot, "unrelated.txt"), "noise\n");
    execFileSync("git", ["-C", repoRoot, "add", "unrelated.txt"]);
    execFileSync("git", ["-C", repoRoot, "commit", "-m", "unrelated"]);
    const headAfter = gitHead(repoRoot);
    assert.notEqual(headBefore, headAfter);
    const after = evaluateHarvestContentFreshness({
      hubRoot,
      harvestId: HARVEST_ID,
      repoRoot,
      zCacheRoot,
    });
    assert.equal(after.harvestVerdict, HARVEST_FRESHNESS_VERDICTS.CURRENT);
    assert.equal(before.harvestVerdict, after.harvestVerdict);
    assert.equal(before.layerAlignment.lDurablePayloadHash, after.layerAlignment.lDurablePayloadHash);
    gateProofs.HEAD_INDEPENDENCE_PASS = true;
  });
});

test("stale coordination index does not invalidate harvest freshness", () => {
  withLifecycle(({ hubRoot, zCacheRoot, repoRoot }) => {
    prepareFullLifecycle(hubRoot, zCacheRoot, repoRoot);
    seedCoordinationIndex(hubRoot, "0000000000000000000000000000000000999999");
    const receipt = evaluateHarvestContentFreshness({
      hubRoot,
      harvestId: HARVEST_ID,
      repoRoot,
      zCacheRoot,
    });
    assert.equal(receipt.harvestVerdict, HARVEST_FRESHNESS_VERDICTS.CURRENT);
    assert.equal(receipt.coordinationIndexVerdict, COORDINATION_INDEX_VERDICTS.STALE);
    gateProofs.INDEX_SEPARATION_PASS = true;
  });
});

test("altered Z sourcePayloadHash yields HARVEST_DERIVED_LAYER_DEGRADED", () => {
  withLifecycle(({ hubRoot, zCacheRoot, repoRoot }) => {
    const { payloadHash } = prepareFullLifecycle(hubRoot, zCacheRoot, repoRoot);
    const hashDir = payloadHash.replace(/^sha256:/, "");
    const zReceiptPath = path.join(
      zCacheRoot,
      "harvest-cache",
      HARVEST_ID,
      hashDir,
      "z-cache-publication-receipt.json",
    );
    const zReceipt = readJson(zReceiptPath);
    zReceipt.payloadHash = "sha256:00000000000000000000000000000000000000000000000000000000000000ff";
    fs.writeFileSync(zReceiptPath, `${JSON.stringify(zReceipt, null, 2)}\n`);
    const degraded = evaluateHarvestContentFreshness({
      hubRoot,
      harvestId: HARVEST_ID,
      repoRoot,
      zCacheRoot,
    });
    assert.equal(degraded.harvestVerdict, HARVEST_FRESHNESS_VERDICTS.DERIVED_LAYER_DEGRADED);
    zReceipt.payloadHash = payloadHash;
    fs.writeFileSync(zReceiptPath, `${JSON.stringify(zReceipt, null, 2)}\n`);
    const restored = evaluateHarvestContentFreshness({
      hubRoot,
      harvestId: HARVEST_ID,
      repoRoot,
      zCacheRoot,
    });
    assert.equal(restored.harvestVerdict, HARVEST_FRESHNESS_VERDICTS.CURRENT);
    gateProofs.DERIVED_LAYER_DEGRADATION_PASS = true;
  });
});

test("altered L durable bundle yields HARVEST_DURABILITY_FAILED", () => {
  withLifecycle(({ hubRoot, zCacheRoot, repoRoot }) => {
    const { payloadHash } = prepareFullLifecycle(hubRoot, zCacheRoot, repoRoot);
    const layout = bundleLayout(hubRoot, HARVEST_ID, payloadHash);
    const completeMarker = path.join(layout.catalogRoot, "PUBLICATION_COMPLETE.json");
    fs.rmSync(completeMarker);
    const failed = evaluateHarvestContentFreshness({
      hubRoot,
      harvestId: HARVEST_ID,
      repoRoot,
      zCacheRoot,
    });
    assert.equal(failed.harvestVerdict, HARVEST_FRESHNESS_VERDICTS.DURABILITY_FAILED);
    gateProofs.L_AUTHORITY_FAILURE_PASS = true;
  });
});

test("restore L and unchanged Phase B rerun stays NOOP_CURRENT and HARVEST_CURRENT", () => {
  withLifecycle(({ hubRoot, zCacheRoot, repoRoot }) => {
    const { payloadHash } = prepareFullLifecycle(hubRoot, zCacheRoot, repoRoot);
    const rerun = runPhaseBPublication({
      hubRoot,
      harvestId: HARVEST_ID,
      payloadHash,
      lDurablePublisher: createDefaultLDurablePublisher(),
      zPublisher: createDefaultZPublisher({ zCacheRoot }),
      supabaseProjector: createDefaultSupabaseProjector({ hubRoot, useMemoryStore: true }),
      layerVerifier: createDefaultLayerVerifier(),
      operationWriter: createDefaultOperationWriter(),
    });
    assert.equal(rerun.phaseBVerdict, PHASE_B_VERDICTS.NOOP);
    const receipt = evaluateHarvestContentFreshness({
      hubRoot,
      harvestId: HARVEST_ID,
      repoRoot,
      zCacheRoot,
    });
    assert.equal(receipt.harvestVerdict, HARVEST_FRESHNESS_VERDICTS.CURRENT);
    gateProofs.NOOP_FRESHNESS_PASS = true;
  });
});

test("valid supersession advances current payload and retains prior bundle", () => {
  const hubRoot = fs.mkdtempSync(path.join(os.tmpdir(), "harvest-fresh-super-"));
  const zCacheRoot = fs.mkdtempSync(path.join(os.tmpdir(), "harvest-fresh-super-z-"));
  const repoRoot = initTempGitRepo();
  try {
    const firstStage = stageLDurableBundle({
      hubRoot,
      sourceRunDir: WAVE2_FIXTURE,
      harvestId: WAVE2_ID,
    });
    publishLDurableBundle({
      hubRoot,
      harvestId: WAVE2_ID,
      payloadHash: firstStage.payloadHash,
    });
    const mutatedSource = copyFixtureToTemp(WAVE2_FIXTURE);
    fs.appendFileSync(path.join(mutatedSource, "thread-autopsy-bundle.json"), "\n");
    const secondStage = stageLDurableBundle({
      hubRoot,
      sourceRunDir: mutatedSource,
      harvestId: WAVE2_ID,
      options: {
        supersedes: [
          {
            id: WAVE2_ID,
            priorHash: firstStage.payloadHash,
            reason: "freshness supersession test",
          },
        ],
      },
    });
    publishLDurableBundle({
      hubRoot,
      harvestId: WAVE2_ID,
      payloadHash: secondStage.payloadHash,
    });
    runPhaseBPublication({
      hubRoot,
      harvestId: WAVE2_ID,
      payloadHash: secondStage.payloadHash,
      lDurablePublisher: createDefaultLDurablePublisher(),
      zPublisher: createDefaultZPublisher({ zCacheRoot }),
      supabaseProjector: createDefaultSupabaseProjector({ hubRoot, useMemoryStore: true }),
      layerVerifier: createDefaultLayerVerifier(),
      operationWriter: createDefaultOperationWriter(),
    });
    const receipt = evaluateHarvestContentFreshness({
      hubRoot,
      harvestId: WAVE2_ID,
      repoRoot,
      zCacheRoot,
    });
    assert.equal(receipt.layerAlignment.lDurablePayloadHash, secondStage.payloadHash);
    assert.equal(receipt.harvestVerdict, HARVEST_FRESHNESS_VERDICTS.POINTER_PENDING);
    const firstLayout = bundleLayout(hubRoot, WAVE2_ID, firstStage.payloadHash);
    const secondLayout = bundleLayout(hubRoot, WAVE2_ID, secondStage.payloadHash);
    assert.ok(fs.existsSync(path.join(firstLayout.catalogRoot, "PUBLICATION_COMPLETE.json")));
    assert.ok(fs.existsSync(path.join(secondLayout.catalogRoot, "PUBLICATION_COMPLETE.json")));
    gateProofs.SUPERSESSION_FRESHNESS_PASS = true;
  } finally {
    fs.rmSync(hubRoot, { recursive: true, force: true });
    fs.rmSync(zCacheRoot, { recursive: true, force: true });
    fs.rmSync(repoRoot, { recursive: true, force: true });
    clearSupabaseProjectionMemory();
  }
});

test("Phase B before Phase C yields HARVEST_POINTER_PENDING not HEAD-based stale", () => {
  withLifecycle(({ hubRoot, zCacheRoot, repoRoot }) => {
    const runDir = copyFixtureToTemp(PASS_FIXTURE);
    const manifest = readJson(path.join(runDir, "harvest-manifest-v1.json"));
    const qualityReceipt = validateKnowledgeQuality({ manifest, runDir });
    writeKnowledgeQualityReceipt(runDir, qualityReceipt);
    const staged = stageLDurableBundle({ hubRoot, sourceRunDir: runDir, harvestId: HARVEST_ID });
    runPhaseBPublication({
      hubRoot,
      harvestId: HARVEST_ID,
      payloadHash: staged.payloadHash,
      lDurablePublisher: createDefaultLDurablePublisher(),
      zPublisher: createDefaultZPublisher({ zCacheRoot }),
      supabaseProjector: createDefaultSupabaseProjector({ hubRoot, useMemoryStore: true }),
      layerVerifier: createDefaultLayerVerifier(),
      operationWriter: createDefaultOperationWriter(),
    });
    const receipt = evaluateHarvestContentFreshness({
      hubRoot,
      harvestId: HARVEST_ID,
      repoRoot,
      zCacheRoot,
    });
    assert.equal(receipt.harvestVerdict, HARVEST_FRESHNESS_VERDICTS.POINTER_PENDING);
    assert.equal(receipt.layers.gitPointer.status, "MISSING");
    assert.equal(receipt.layers.zCache.ok, true);
    assert.equal(receipt.layers.supabase.ok, true);
  });
});

test("freshness evaluation does not mutate Git porcelain", () => {
  withLifecycle(({ hubRoot, zCacheRoot, repoRoot }) => {
    prepareFullLifecycle(hubRoot, zCacheRoot, repoRoot);
    const before = gitPorcelain(repoRoot);
    evaluateHarvestContentFreshness({
      hubRoot,
      harvestId: HARVEST_ID,
      repoRoot,
      zCacheRoot,
    });
    assert.equal(gitPorcelain(repoRoot), before);
    gateProofs.NO_GIT_MUTATION_PASS = true;
    gateProofs.NO_AUTOMATIC_REPUBLICATION_PASS = true;
  });
});

test("Cross-Agent worktree porcelain unchanged by freshness tests", () => {
  const before = execFileSync("git", ["-C", REPO_ROOT, "status", "--porcelain"], { encoding: "utf8" });
  withLifecycle(() => {});
  const after = execFileSync("git", ["-C", REPO_ROOT, "status", "--porcelain"], { encoding: "utf8" });
  assert.equal(before, after);
});

test("all Wave 6 acceptance gates proven across suite", () => {
  const missing = Object.entries(gateProofs)
    .filter(([, proven]) => !proven)
    .map(([gate]) => gate);
  assert.deepEqual(missing, [], `unproven gates: ${missing.join(", ")}`);
});

console.log(`\n# harvest-content-freshness: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
}
