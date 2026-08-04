#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { bundleLayout, stageLDurableBundle } from "../harvest/lib/l-durable-bundle-lib.mjs";
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
import {
  GIT_POINTER_FILENAME,
  materializePhaseCPointer,
  readPhaseCReceipt,
  validatePhaseCInputs,
} from "../harvest/lib/phase-c-pointer-materialization-lib.mjs";
import { clearSupabaseProjectionMemory } from "../harvest/lib/supabase-projection-adapter-lib.mjs";
import { PHASE_B_VERDICTS } from "../harvest/lib/publication-layer-verdict-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const PASS_FIXTURE = path.join(REPO_ROOT, "scripts/tests/fixtures/harvest-knowledge-quality-pass-v1/source");
const SYNTHETIC_FIXTURE = path.join(REPO_ROOT, "scripts/tests/fixtures/harvest-l-durable-publisher-v1/source");
const HARVEST_ID = "harvest-knowledge-quality-pass-v1";

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
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "harvest-phase-c-run-"));
  fs.cpSync(sourceDir, tempDir, { recursive: true });
  return tempDir;
}

function initTempGitRepo() {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), "harvest-phase-c-git-"));
  fs.mkdirSync(path.join(repoRoot, "artifacts/agent-runs"), { recursive: true });
  fs.writeFileSync(path.join(repoRoot, "README.md"), "# phase-c temp repo\n");
  execFileSync("git", ["init"], { cwd: repoRoot });
  execFileSync("git", ["config", "user.email", "phase-c@test.local"], { cwd: repoRoot });
  execFileSync("git", ["config", "user.name", "Phase C Test"], { cwd: repoRoot });
  execFileSync("git", ["add", "."], { cwd: repoRoot });
  execFileSync("git", ["commit", "-m", "init"], { cwd: repoRoot });
  return repoRoot;
}

function gitHead(repoRoot) {
  return execFileSync("git", ["-C", repoRoot, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
}

function gitCommitCount(repoRoot) {
  return Number(
    execFileSync("git", ["-C", repoRoot, "rev-list", "--count", "HEAD"], { encoding: "utf8" }).trim(),
  );
}

function prepareSyntheticLifecycle(hubRoot, zCacheRoot, repoRoot) {
  const runDir = copyFixtureToTemp(PASS_FIXTURE);
  const manifest = readJson(path.join(runDir, "harvest-manifest-v1.json"));
  const qualityReceipt = validateKnowledgeQuality({ manifest, runDir });
  writeKnowledgeQualityReceipt(runDir, qualityReceipt);
  const staged = stageLDurableBundle({
    hubRoot,
    sourceRunDir: runDir,
    harvestId: HARVEST_ID,
  });
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
  return { staged, phaseB, payloadHash: staged.payloadHash, runDir };
}

function withLifecycle(fn) {
  const hubRoot = fs.mkdtempSync(path.join(os.tmpdir(), "harvest-phase-c-hub-"));
  const zCacheRoot = fs.mkdtempSync(path.join(os.tmpdir(), "harvest-phase-c-z-"));
  const repoRoot = initTempGitRepo();
  try {
    return fn({ hubRoot, zCacheRoot, repoRoot });
  } finally {
    fs.rmSync(hubRoot, { recursive: true, force: true });
    fs.rmSync(zCacheRoot, { recursive: true, force: true });
    fs.rmSync(repoRoot, { recursive: true, force: true });
    clearSupabaseProjectionMemory();
  }
}

test("Phase C inputs pass after synthetic full lifecycle", () => {
  withLifecycle(({ hubRoot, zCacheRoot, repoRoot }) => {
    const { payloadHash } = prepareSyntheticLifecycle(hubRoot, zCacheRoot, repoRoot);
    const validation = validatePhaseCInputs({
      hubRoot,
      harvestId: HARVEST_ID,
      payloadHash,
      repoRoot,
    });
    assert.equal(validation.ok, true);
    assert.equal(validation.verdict, "PHASE_C_INPUT_VALIDATION_PASS");
    assert.equal(validation.qualityReceipt.knowledgeVerdict, "KNOWLEDGE_QUALITY_PASS");
  });
});

test("dry-run materializes pointer plan without Git commit", () => {
  withLifecycle(({ hubRoot, zCacheRoot, repoRoot }) => {
    const { payloadHash } = prepareSyntheticLifecycle(hubRoot, zCacheRoot, repoRoot);
    const headBefore = gitHead(repoRoot);
    const result = materializePhaseCPointer({
      hubRoot,
      harvestId: HARVEST_ID,
      payloadHash,
      repoRoot,
      apply: false,
    });
    assert.equal(result.ok, true);
    assert.equal(result.verdict, "PHASE_C_DRY_RUN_PASS");
    assert.equal(gitHead(repoRoot), headBefore);
    assert.equal(fs.existsSync(path.join(repoRoot, "artifacts/agent-runs", HARVEST_ID, GIT_POINTER_FILENAME)), false);
  });
});

test("apply blocked without PHASE_C_POINTER_APPROVED", () => {
  withLifecycle(({ hubRoot, zCacheRoot, repoRoot }) => {
    const { payloadHash } = prepareSyntheticLifecycle(hubRoot, zCacheRoot, repoRoot);
    const result = materializePhaseCPointer({
      hubRoot,
      harvestId: HARVEST_ID,
      payloadHash,
      repoRoot,
      apply: true,
      env: {},
    });
    assert.equal(result.ok, false);
    assert.equal(result.verdict, "PHASE_C_HOLD");
    assert.ok(result.failures.includes("BLOCKED_OPERATOR_APPROVAL:PHASE_C_POINTER_APPROVED"));
  });
});

test("approved apply returns PHASE_C_POINTER_PASS with single Git commit", () => {
  withLifecycle(({ hubRoot, zCacheRoot, repoRoot }) => {
    const { payloadHash } = prepareSyntheticLifecycle(hubRoot, zCacheRoot, repoRoot);
    const commitsBefore = gitCommitCount(repoRoot);
    const result = materializePhaseCPointer({
      hubRoot,
      harvestId: HARVEST_ID,
      payloadHash,
      repoRoot,
      apply: true,
      env: { PHASE_C_POINTER_APPROVED: "1" },
    });
    assert.equal(result.ok, true);
    assert.equal(result.verdict, "PHASE_C_POINTER_PASS");
    assert.equal(gitCommitCount(repoRoot), commitsBefore + 1);
    const pointer = readJson(path.join(repoRoot, "artifacts/agent-runs", HARVEST_ID, GIT_POINTER_FILENAME));
    assert.equal(pointer.payloadHash, payloadHash);
    assert.equal("receiptCommit" in pointer, false);
    assert.equal("gitPointerCommit" in pointer, false);
    const phaseCReceipt = readPhaseCReceipt(hubRoot, HARVEST_ID, payloadHash);
    assert.ok(phaseCReceipt);
    assert.equal(phaseCReceipt.gitPointerCommit, result.commit.gitPointerCommit);
    assert.equal(phaseCReceipt.receiptCommit, null);
    assert.notEqual(phaseCReceipt.gitPointerCommit, pointer.authoritySourceCommit);
  });
});

test("pointer excludes payload bodies and respects Git file budget", () => {
  withLifecycle(({ hubRoot, zCacheRoot, repoRoot }) => {
    const { payloadHash } = prepareSyntheticLifecycle(hubRoot, zCacheRoot, repoRoot);
    materializePhaseCPointer({
      hubRoot,
      harvestId: HARVEST_ID,
      payloadHash,
      repoRoot,
      apply: true,
      env: { PHASE_C_POINTER_APPROVED: "1" },
    });
    const runDir = path.join(repoRoot, "artifacts/agent-runs", HARVEST_ID);
    const entries = fs.readdirSync(runDir);
    assert.ok(entries.includes(GIT_POINTER_FILENAME));
    assert.ok(entries.includes("harvest-manifest-v1.json"));
    const pointer = readJson(path.join(runDir, GIT_POINTER_FILENAME));
    const serialized = JSON.stringify(pointer);
    assert.equal(serialized.includes("threadAutopsyBundle"), false);
    assert.equal(serialized.includes("seedPackets"), false);
    assert.equal(serialized.includes("compactRecords"), false);
  });
});

test("post-Phase C Phase B rerun is NOOP_CURRENT with no new Git commit", () => {
  withLifecycle(({ hubRoot, zCacheRoot, repoRoot }) => {
    const { payloadHash } = prepareSyntheticLifecycle(hubRoot, zCacheRoot, repoRoot);
    materializePhaseCPointer({
      hubRoot,
      harvestId: HARVEST_ID,
      payloadHash,
      repoRoot,
      apply: true,
      env: { PHASE_C_POINTER_APPROVED: "1" },
    });
    const headAfterPhaseC = gitHead(repoRoot);
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
    assert.equal(rerun.layers.lDurable.status, "NOOP_CURRENT");
    assert.equal(rerun.layers.zCache.status, "NOOP_CURRENT");
    assert.equal(rerun.layers.supabaseProjection.status, "NOOP_CURRENT");
    assert.equal(gitHead(repoRoot), headAfterPhaseC);
  });
});

test("second Phase C apply holds when pointer already materialized", () => {
  withLifecycle(({ hubRoot, zCacheRoot, repoRoot }) => {
    const { payloadHash } = prepareSyntheticLifecycle(hubRoot, zCacheRoot, repoRoot);
    materializePhaseCPointer({
      hubRoot,
      harvestId: HARVEST_ID,
      payloadHash,
      repoRoot,
      apply: true,
      env: { PHASE_C_POINTER_APPROVED: "1" },
    });
    const commitsAfterFirst = gitCommitCount(repoRoot);
    const second = materializePhaseCPointer({
      hubRoot,
      harvestId: HARVEST_ID,
      payloadHash,
      repoRoot,
      apply: true,
      env: { PHASE_C_POINTER_APPROVED: "1" },
    });
    assert.equal(second.ok, true);
    assert.equal(second.verdict, "NOOP_CURRENT");
    assert.equal(gitCommitCount(repoRoot), commitsAfterFirst);
  });
});

test("missing knowledge quality receipt holds Phase C", () => {
  const hubRoot = fs.mkdtempSync(path.join(os.tmpdir(), "harvest-phase-c-no-quality-"));
  const zCacheRoot = fs.mkdtempSync(path.join(os.tmpdir(), "harvest-phase-c-no-quality-z-"));
  const repoRoot = initTempGitRepo();
  try {
    const runDir = copyFixtureToTemp(SYNTHETIC_FIXTURE);
    const staged = stageLDurableBundle({
      hubRoot,
      sourceRunDir: runDir,
      harvestId: "harvest-wave2-l-durable-fixture-v1",
    });
    const phaseB = runPhaseBPublication({
      hubRoot,
      harvestId: "harvest-wave2-l-durable-fixture-v1",
      payloadHash: staged.payloadHash,
      lDurablePublisher: createDefaultLDurablePublisher(),
      zPublisher: createDefaultZPublisher({ zCacheRoot }),
      supabaseProjector: createDefaultSupabaseProjector({ hubRoot, useMemoryStore: true }),
      layerVerifier: createDefaultLayerVerifier(),
      operationWriter: createDefaultOperationWriter(),
    });
    assert.equal(phaseB.phaseBVerdict, PHASE_B_VERDICTS.COMPLETE);
    const validation = validatePhaseCInputs({
      hubRoot,
      harvestId: "harvest-wave2-l-durable-fixture-v1",
      payloadHash: staged.payloadHash,
      repoRoot,
    });
    assert.equal(validation.ok, false);
    assert.ok(
      validation.failures.some((failure) => failure.includes("missing_knowledge_quality_receipt")),
    );
  } finally {
    fs.rmSync(hubRoot, { recursive: true, force: true });
    fs.rmSync(zCacheRoot, { recursive: true, force: true });
    fs.rmSync(repoRoot, { recursive: true, force: true });
    clearSupabaseProjectionMemory();
  }
});

test("quality receipt is present in durable payload before Phase C", () => {
  withLifecycle(({ hubRoot, zCacheRoot, repoRoot }) => {
    const { payloadHash } = prepareSyntheticLifecycle(hubRoot, zCacheRoot, repoRoot);
    const layout = bundleLayout(hubRoot, HARVEST_ID, payloadHash);
    const receiptPath = path.join(layout.catalogRoot, "payload", QUALITY_RECEIPT_FILENAME);
    assert.ok(fs.existsSync(receiptPath), `expected quality receipt at ${receiptPath}`);
  });
});

test("Cross-Agent repo porcelain unchanged by Phase C tests", () => {
  const before = execFileSync("git", ["-C", REPO_ROOT, "status", "--porcelain"], { encoding: "utf8" });
  withLifecycle(() => {});
  const after = execFileSync("git", ["-C", REPO_ROOT, "status", "--porcelain"], { encoding: "utf8" });
  assert.equal(before, after);
});

console.log(`\n# harvest-phase-c-pointer: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
}
