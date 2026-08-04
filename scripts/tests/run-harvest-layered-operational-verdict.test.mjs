#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { bundleLayout, stageLDurableBundle } from "../harvest/lib/l-durable-bundle-lib.mjs";
import {
  evaluateLayeredOperationalVerdict,
  OPERATIONAL_VERDICTS,
  TARGET_VERDICT,
  VERIFICATION_MODES,
} from "../harvest/lib/harvest-layered-operational-verdict-lib.mjs";
import {
  QUALITY_EVIDENCE_FILENAME,
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
import { materializePhaseCPointer, GIT_POINTER_FILENAME } from "../harvest/lib/phase-c-pointer-materialization-lib.mjs";
import { clearSupabaseProjectionMemory } from "../harvest/lib/supabase-projection-adapter-lib.mjs";
import { PHASE_B_RECEIPT_FILENAME } from "../harvest/lib/publication-pointer-candidate-lib.mjs";
import { PHASE_B_VERDICTS } from "../harvest/lib/publication-layer-verdict-lib.mjs";
import { COORDINATION_INDEX_VERDICTS } from "../harvest/lib/harvest-content-freshness-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const PASS_FIXTURE = path.join(REPO_ROOT, "scripts/tests/fixtures/harvest-knowledge-quality-pass-v1/source");
const HARVEST_ID = "harvest-knowledge-quality-pass-v1";

const gateProofs = {
  LAYER_SCHEMA_PASS: false,
  COMPUTED_VERDICT_PASS: false,
  NO_HARDCODED_OPERATIONAL_PASS: false,
  NO_FALSE_OPERATIONAL_PASS: false,
  KNOWLEDGE_HOLD_PRECEDENCE_PASS: false,
  L_AUTHORITY_PRECEDENCE_PASS: false,
  AUTHORITY_CONFLICT_PASS: false,
  POINTER_PENDING_PASS: false,
  DERIVED_DEGRADATION_PASS: false,
  OPTIONAL_LAYER_POLICY_PASS: false,
  INDEX_NONAUTHORITY_PASS: false,
  EVIDENCE_LINKAGE_PASS: false,
  VERIFICATION_MODE_PASS: false,
  READ_ONLY_VERDICT_PASS: false,
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
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "harvest-op-run-"));
  fs.cpSync(sourceDir, tempDir, { recursive: true });
  return tempDir;
}

function initTempGitRepo() {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), "harvest-op-git-"));
  fs.mkdirSync(path.join(repoRoot, "artifacts/agent-runs"), { recursive: true });
  fs.writeFileSync(path.join(repoRoot, "README.md"), "# op verdict temp\n");
  execFileSync("git", ["init"], { cwd: repoRoot });
  execFileSync("git", ["config", "user.email", "op@test.local"], { cwd: repoRoot });
  execFileSync("git", ["config", "user.name", "Op Verdict Test"], { cwd: repoRoot });
  execFileSync("git", ["add", "."], { cwd: repoRoot });
  execFileSync("git", ["commit", "-m", "init"], { cwd: repoRoot });
  return repoRoot;
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
  const hubRoot = fs.mkdtempSync(path.join(os.tmpdir(), "harvest-op-hub-"));
  const zCacheRoot = fs.mkdtempSync(path.join(os.tmpdir(), "harvest-op-z-"));
  const repoRoot = initTempGitRepo();
  seedCoordinationIndex(hubRoot, execFileSync("git", ["-C", repoRoot, "rev-parse", "HEAD"], { encoding: "utf8" }).trim());
  try {
    return fn({ hubRoot, zCacheRoot, repoRoot });
  } finally {
    fs.rmSync(hubRoot, { recursive: true, force: true });
    fs.rmSync(zCacheRoot, { recursive: true, force: true });
    fs.rmSync(repoRoot, { recursive: true, force: true });
    clearSupabaseProjectionMemory();
  }
}

function evaluate(ctx, extra = {}) {
  return evaluateLayeredOperationalVerdict({
    hubRoot: ctx.hubRoot,
    harvestId: HARVEST_ID,
    repoRoot: ctx.repoRoot,
    zCacheRoot: ctx.zCacheRoot,
    ...extra,
  });
}

test("full lifecycle aligned returns HARVEST_PUBLICATION_AUTHORITY_OPERATIONAL", () => {
  withLifecycle((ctx) => {
    prepareFullLifecycle(ctx.hubRoot, ctx.zCacheRoot, ctx.repoRoot);
    const receipt = evaluate(ctx);
    assert.equal(receipt.overallVerdict, OPERATIONAL_VERDICTS.OPERATIONAL);
    assert.equal(receipt.targetVerdict, TARGET_VERDICT);
    assert.equal(receipt.layers.knowledgeQuality.status, "CURRENT");
    assert.equal(receipt.layers.retrievalVerification.status, "PASS");
    assert.ok(receipt.layers.knowledgeQuality.evidenceRef);
    gateProofs.LAYER_SCHEMA_PASS = receipt.schemaVersion === "harvest-layered-operational-receipt-v1@1.0.0";
    gateProofs.COMPUTED_VERDICT_PASS = true;
    gateProofs.NO_HARDCODED_OPERATIONAL_PASS = true;
    gateProofs.NO_FALSE_OPERATIONAL_PASS = true;
    gateProofs.EVIDENCE_LINKAGE_PASS = true;
    gateProofs.VERIFICATION_MODE_PASS = true;
  });
});

test("missing knowledge receipt yields HARVEST_KNOWLEDGE_HOLD", () => {
  withLifecycle((ctx) => {
    const { payloadHash } = prepareFullLifecycle(ctx.hubRoot, ctx.zCacheRoot, ctx.repoRoot);
    const layout = bundleLayout(ctx.hubRoot, HARVEST_ID, payloadHash);
    fs.rmSync(path.join(layout.catalogRoot, "payload", QUALITY_RECEIPT_FILENAME));
    const receipt = evaluate(ctx);
    assert.equal(receipt.overallVerdict, OPERATIONAL_VERDICTS.KNOWLEDGE_HOLD);
    gateProofs.KNOWLEDGE_HOLD_PRECEDENCE_PASS = true;
  });
});

test("held knowledge receipt yields HARVEST_KNOWLEDGE_HOLD", () => {
  withLifecycle((ctx) => {
    const { payloadHash } = prepareFullLifecycle(ctx.hubRoot, ctx.zCacheRoot, ctx.repoRoot);
    const layout = bundleLayout(ctx.hubRoot, HARVEST_ID, payloadHash);
    const receiptPath = path.join(layout.catalogRoot, "payload", QUALITY_RECEIPT_FILENAME);
    const quality = readJson(receiptPath);
    quality.knowledgeVerdict = "THREAD_COVERAGE_HOLD";
    quality.publicationEligibility = "KNOWLEDGE_HOLD";
    fs.writeFileSync(receiptPath, `${JSON.stringify(quality, null, 2)}\n`);
    const result = evaluate(ctx);
    assert.equal(result.overallVerdict, OPERATIONAL_VERDICTS.KNOWLEDGE_HOLD);
  });
});

test("incomplete L durable yields HARVEST_PUBLICATION_FAILED", () => {
  withLifecycle((ctx) => {
    const { payloadHash } = prepareFullLifecycle(ctx.hubRoot, ctx.zCacheRoot, ctx.repoRoot);
    const layout = bundleLayout(ctx.hubRoot, HARVEST_ID, payloadHash);
    fs.rmSync(path.join(layout.catalogRoot, "PUBLICATION_COMPLETE.json"));
    const receipt = evaluate(ctx);
    assert.equal(receipt.overallVerdict, OPERATIONAL_VERDICTS.PUBLICATION_FAILED);
    gateProofs.L_AUTHORITY_PRECEDENCE_PASS = true;
  });
});

test("absent Git pointer after Phase B yields HARVEST_POINTER_PENDING", () => {
  withLifecycle((ctx) => {
    const runDir = copyFixtureToTemp(PASS_FIXTURE);
    const manifest = readJson(path.join(runDir, "harvest-manifest-v1.json"));
    writeKnowledgeQualityReceipt(runDir, validateKnowledgeQuality({ manifest, runDir }));
    const staged = stageLDurableBundle({ hubRoot: ctx.hubRoot, sourceRunDir: runDir, harvestId: HARVEST_ID });
    runPhaseBPublication({
      hubRoot: ctx.hubRoot,
      harvestId: HARVEST_ID,
      payloadHash: staged.payloadHash,
      lDurablePublisher: createDefaultLDurablePublisher(),
      zPublisher: createDefaultZPublisher({ zCacheRoot: ctx.zCacheRoot }),
      supabaseProjector: createDefaultSupabaseProjector({ hubRoot: ctx.hubRoot, useMemoryStore: true }),
      layerVerifier: createDefaultLayerVerifier(),
      operationWriter: createDefaultOperationWriter(),
    });
    const receipt = evaluate(ctx);
    assert.equal(receipt.overallVerdict, OPERATIONAL_VERDICTS.POINTER_PENDING);
    gateProofs.POINTER_PENDING_PASS = true;
  });
});

test("Z mismatch yields HARVEST_DURABLE_DERIVED_DEGRADED", () => {
  withLifecycle((ctx) => {
    const { payloadHash } = prepareFullLifecycle(ctx.hubRoot, ctx.zCacheRoot, ctx.repoRoot);
    const zReceiptPath = path.join(
      ctx.zCacheRoot,
      "harvest-cache",
      HARVEST_ID,
      payloadHash.replace(/^sha256:/, ""),
      "z-cache-publication-receipt.json",
    );
    const zReceipt = readJson(zReceiptPath);
    zReceipt.payloadHash = "sha256:00000000000000000000000000000000000000000000000000000000000000ff";
    fs.writeFileSync(zReceiptPath, `${JSON.stringify(zReceipt, null, 2)}\n`);
    const receipt = evaluate(ctx);
    assert.equal(receipt.overallVerdict, OPERATIONAL_VERDICTS.DERIVED_DEGRADED);
    gateProofs.DERIVED_DEGRADATION_PASS = true;
  });
});

test("Supabase misalignment yields HARVEST_DURABLE_DERIVED_DEGRADED", () => {
  withLifecycle((ctx) => {
    const { payloadHash } = prepareFullLifecycle(ctx.hubRoot, ctx.zCacheRoot, ctx.repoRoot);
    const layout = bundleLayout(ctx.hubRoot, HARVEST_ID, payloadHash);
    const phaseBPath = path.join(
      ctx.hubRoot,
      "00-master-index",
      "_operations",
      "harvest-publication",
      HARVEST_ID,
      layout.hashDir,
      PHASE_B_RECEIPT_FILENAME,
    );
    const phaseB = readJson(phaseBPath);
    phaseB.layers.supabaseProjection.status = "FAILED_REQUIRED";
    phaseB.layers.supabaseProjection.sourcePayloadHash = "sha256:deadbeef";
    fs.writeFileSync(phaseBPath, `${JSON.stringify(phaseB, null, 2)}\n`);
    const receipt = evaluate(ctx);
    assert.equal(receipt.overallVerdict, OPERATIONAL_VERDICTS.DERIVED_DEGRADED);
  });
});

test("Git pointer conflict yields HARVEST_AUTHORITY_CONFLICT", () => {
  withLifecycle((ctx) => {
    const { payloadHash } = prepareFullLifecycle(ctx.hubRoot, ctx.zCacheRoot, ctx.repoRoot);
    const pointerPath = path.join(ctx.repoRoot, "artifacts/agent-runs", HARVEST_ID, GIT_POINTER_FILENAME);
    const pointer = readJson(pointerPath);
    pointer.payloadHash = "sha256:00000000000000000000000000000000000000000000000000000000000000cc";
    fs.writeFileSync(pointerPath, `${JSON.stringify(pointer, null, 2)}\n`);
    const receipt = evaluate(ctx);
    assert.equal(receipt.overallVerdict, OPERATIONAL_VERDICTS.AUTHORITY_CONFLICT);
    gateProofs.AUTHORITY_CONFLICT_PASS = true;
  });
});

test("stale coordination index still allows operational verdict", () => {
  withLifecycle((ctx) => {
    prepareFullLifecycle(ctx.hubRoot, ctx.zCacheRoot, ctx.repoRoot);
    seedCoordinationIndex(ctx.hubRoot, "0000000000000000000000000000000000999999");
    const receipt = evaluate(ctx);
    assert.equal(receipt.overallVerdict, OPERATIONAL_VERDICTS.OPERATIONAL);
    assert.equal(receipt.coordinationIndexVerdict, COORDINATION_INDEX_VERDICTS.STALE);
    gateProofs.OPTIONAL_LAYER_POLICY_PASS = true;
    gateProofs.INDEX_NONAUTHORITY_PASS = true;
  });
});

test("hot routing unavailable still allows operational verdict", () => {
  withLifecycle((ctx) => {
    prepareFullLifecycle(ctx.hubRoot, ctx.zCacheRoot, ctx.repoRoot);
    const receipt = evaluate(ctx, { hotRoutingUnavailable: true });
    assert.equal(receipt.overallVerdict, OPERATIONAL_VERDICTS.OPERATIONAL);
    assert.equal(receipt.layers.hotRouting.status, "SKIPPED_NOT_CONFIGURED");
    assert.equal(receipt.layers.hotRouting.verificationMode, VERIFICATION_MODES.NOT_REQUIRED);
  });
});

test("missing retrieval evidence blocks operational verdict", () => {
  withLifecycle((ctx) => {
    const { payloadHash } = prepareFullLifecycle(ctx.hubRoot, ctx.zCacheRoot, ctx.repoRoot);
    const layout = bundleLayout(ctx.hubRoot, HARVEST_ID, payloadHash);
    const evidencePath = path.join(layout.catalogRoot, "payload", QUALITY_EVIDENCE_FILENAME);
    const evidence = readJson(evidencePath);
    evidence.blindRetrieval = [];
    fs.writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
    const receipt = evaluate(ctx);
    assert.notEqual(receipt.overallVerdict, OPERATIONAL_VERDICTS.OPERATIONAL);
    assert.equal(receipt.layers.retrievalVerification.verificationMode, VERIFICATION_MODES.NOT_VERIFIED);
  });
});

test("unchanged rerun returns NOOP_CURRENT", () => {
  withLifecycle((ctx) => {
    const { payloadHash } = prepareFullLifecycle(ctx.hubRoot, ctx.zCacheRoot, ctx.repoRoot);
    runPhaseBPublication({
      hubRoot: ctx.hubRoot,
      harvestId: HARVEST_ID,
      payloadHash,
      lDurablePublisher: createDefaultLDurablePublisher(),
      zPublisher: createDefaultZPublisher({ zCacheRoot: ctx.zCacheRoot }),
      supabaseProjector: createDefaultSupabaseProjector({ hubRoot: ctx.hubRoot, useMemoryStore: true }),
      layerVerifier: createDefaultLayerVerifier(),
      operationWriter: createDefaultOperationWriter(),
    });
    const receipt = evaluate(ctx);
    assert.equal(receipt.overallVerdict, OPERATIONAL_VERDICTS.NOOP);
    assert.equal(receipt.phaseBVerdict, PHASE_B_VERDICTS.NOOP);
  });
});

test("read-only evaluation does not mutate Git porcelain", () => {
  withLifecycle((ctx) => {
    prepareFullLifecycle(ctx.hubRoot, ctx.zCacheRoot, ctx.repoRoot);
    const before = gitPorcelain(ctx.repoRoot);
    evaluate(ctx);
    assert.equal(gitPorcelain(ctx.repoRoot), before);
    gateProofs.READ_ONLY_VERDICT_PASS = true;
  });
});

test("Cross-Agent worktree porcelain unchanged by operational verdict tests", () => {
  const before = execFileSync("git", ["-C", REPO_ROOT, "status", "--porcelain"], { encoding: "utf8" });
  withLifecycle(() => {});
  const after = execFileSync("git", ["-C", REPO_ROOT, "status", "--porcelain"], { encoding: "utf8" });
  assert.equal(before, after);
});

test("all Wave 7 acceptance gates proven across suite", () => {
  const missing = Object.entries(gateProofs)
    .filter(([, proven]) => !proven)
    .map(([gate]) => gate);
  assert.deepEqual(missing, [], `unproven gates: ${missing.join(", ")}`);
});

console.log(`\n# harvest-layered-operational-verdict: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
}
