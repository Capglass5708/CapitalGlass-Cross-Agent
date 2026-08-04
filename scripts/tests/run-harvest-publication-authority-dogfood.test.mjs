#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { bundleLayout, stageLDurableBundle } from "../harvest/lib/l-durable-bundle-lib.mjs";
import { evaluateHarvestContentFreshness, COORDINATION_INDEX_VERDICTS } from "../harvest/lib/harvest-content-freshness-lib.mjs";
import { evaluateLayeredOperationalVerdict, OPERATIONAL_VERDICTS } from "../harvest/lib/harvest-layered-operational-verdict-lib.mjs";
import { validateGitHarvestRetention } from "../harvest/lib/harvest-git-retention-lib.mjs";
import {
  acquirePublicationLock,
  LOCK_SCOPES,
  LOCK_VERDICTS,
  releasePublicationLock,
} from "../harvest/lib/harvest-publication-lock-lib.mjs";
import {
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
} from "../harvest/lib/phase-c-pointer-materialization-lib.mjs";
import { clearSupabaseProjectionMemory } from "../harvest/lib/supabase-projection-adapter-lib.mjs";
import { PHASE_B_VERDICTS } from "../harvest/lib/publication-layer-verdict-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const PASS_FIXTURE = path.join(REPO_ROOT, "scripts/tests/fixtures/harvest-knowledge-quality-pass-v1/source");
const WORKER = path.join(REPO_ROOT, "scripts/harvest/lock-worker.mjs");
const HARVEST_ID = "harvest-knowledge-quality-pass-v1";

const gates = {
  INCIDENT_1_TREADMILL_PREVENTED: false,
  INCIDENT_2_PARTIAL_PUBLICATION_PREVENTED: false,
  INCIDENT_4_LOW_QUALITY_BLOCKED: false,
  INCIDENT_5_CONCURRENCY_PREVENTED: false,
  INCIDENT_8_GIT_BLOAT_PREVENTED: false,
  FULL_LIFECYCLE_DOGFOOD_PASS: false,
  UNCHANGED_REPUBLISH_NOOP_PASS: false,
  NO_EXISTING_HARVEST_REPUBLISHED: false,
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
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "harvest-dogfood-run-"));
  fs.cpSync(sourceDir, tempDir, { recursive: true });
  return tempDir;
}

function initTempGitRepo() {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), "harvest-dogfood-git-"));
  fs.mkdirSync(path.join(repoRoot, "artifacts/agent-runs"), { recursive: true });
  fs.writeFileSync(path.join(repoRoot, "README.md"), "# dogfood\n");
  execFileSync("git", ["init"], { cwd: repoRoot });
  execFileSync("git", ["config", "user.email", "dogfood@test.local"], { cwd: repoRoot });
  execFileSync("git", ["config", "user.name", "Dogfood Test"], { cwd: repoRoot });
  execFileSync("git", ["add", "."], { cwd: repoRoot });
  execFileSync("git", ["commit", "-m", "init"], { cwd: repoRoot });
  return repoRoot;
}

function gitHead(repoRoot) {
  return execFileSync("git", ["-C", repoRoot, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
}

function prepareLifecycle(hubRoot, zCacheRoot, repoRoot) {
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
  const phaseC = materializePhaseCPointer({
    hubRoot,
    harvestId: HARVEST_ID,
    payloadHash: staged.payloadHash,
    repoRoot,
    apply: true,
    env: { PHASE_C_POINTER_APPROVED: "1" },
  });
  return { staged, phaseB, phaseC, payloadHash: staged.payloadHash, runDir };
}

function seedCoordinationIndex(hubRoot, sourceCommitSha) {
  const dir = path.join(hubRoot, "00-master-index", "active-work-ledger");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, "LATEST.json"),
    `${JSON.stringify({ sourceCommitSha, updatedAt: new Date().toISOString() }, null, 2)}\n`,
  );
}

function withLifecycle(fn) {
  const hubRoot = fs.mkdtempSync(path.join(os.tmpdir(), "harvest-dogfood-hub-"));
  const zCacheRoot = fs.mkdtempSync(path.join(os.tmpdir(), "harvest-dogfood-z-"));
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

test("INCIDENT_1 — Git HEAD treadmill prevented", () => {
  withLifecycle(({ hubRoot, zCacheRoot, repoRoot }) => {
    const { payloadHash } = prepareLifecycle(hubRoot, zCacheRoot, repoRoot);
    fs.appendFileSync(path.join(repoRoot, "README.md"), "\nhead bump\n");
    execFileSync("git", ["-C", repoRoot, "add", "README.md"], { encoding: "utf8" });
    execFileSync("git", ["-C", repoRoot, "commit", "-m", "bump head"], { encoding: "utf8" });
    const headAfterBump = gitHead(repoRoot);
    const freshness = evaluateHarvestContentFreshness({
      hubRoot,
      repoRoot,
      zCacheRoot,
      harvestId: HARVEST_ID,
    });
    assert.equal(freshness.harvestVerdict, "HARVEST_CURRENT");
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
    gates.INCIDENT_1_TREADMILL_PREVENTED = true;
  });
});

test("INCIDENT_2 — partial L: publication blocked", () => {
  const hubRoot = fs.mkdtempSync(path.join(os.tmpdir(), "harvest-dogfood-partial-"));
  try {
    const layout = bundleLayout(hubRoot, HARVEST_ID, "sha256:deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef");
    fs.mkdirSync(layout.catalogRoot, { recursive: true });
    fs.writeFileSync(path.join(layout.catalogRoot, "identity.json"), '{"harvestId":"x"}\n');
    const phaseB = runPhaseBPublication({
      hubRoot,
      harvestId: HARVEST_ID,
      payloadHash: "sha256:deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
      usePublicationLock: false,
      lDurablePublisher: createDefaultLDurablePublisher(),
      zPublisher: createDefaultZPublisher({ zCacheRoot: fs.mkdtempSync(path.join(os.tmpdir(), "z-")) }),
      supabaseProjector: createDefaultSupabaseProjector({ hubRoot, useMemoryStore: true }),
      layerVerifier: createDefaultLayerVerifier(),
      operationWriter: createDefaultOperationWriter(),
    });
    assert.equal(phaseB.ok, false);
    gates.INCIDENT_2_PARTIAL_PUBLICATION_PREVENTED = true;
  } finally {
    fs.rmSync(hubRoot, { recursive: true, force: true });
  }
});

test("INCIDENT_4 — weak knowledge quality blocked", () => {
  const runDir = copyFixtureToTemp(PASS_FIXTURE);
  const manifest = readJson(path.join(runDir, "harvest-manifest-v1.json"));
  fs.rmSync(path.join(runDir, "seed-packets"), { recursive: true, force: true });
  const quality = validateKnowledgeQuality({ manifest, runDir });
  assert.notEqual(quality.knowledgeVerdict, "KNOWLEDGE_QUALITY_PASS");
  gates.INCIDENT_4_LOW_QUALITY_BLOCKED = true;
});

test("INCIDENT_5 — concurrent publishers single-flight", () => {
  const hubRoot = fs.mkdtempSync(path.join(os.tmpdir(), "harvest-dogfood-conc-"));
  const payloadHash =
    "sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc";
  const outA = path.join(os.tmpdir(), `dogfood-lock-a-${process.pid}.json`);
  const outB = path.join(os.tmpdir(), `dogfood-lock-b-${process.pid}.json`);
  try {
    const cmd = `
      node "${WORKER}" --hub "${hubRoot}" --harvest "${HARVEST_ID}" --hash "${payloadHash}" --scope "${LOCK_SCOPES.PHASE_B}" --owner dog-a > "${outA}" 2>/dev/null &
      node "${WORKER}" --hub "${hubRoot}" --harvest "${HARVEST_ID}" --hash "${payloadHash}" --scope "${LOCK_SCOPES.PHASE_B}" --owner dog-b > "${outB}" 2>/dev/null &
      wait
    `;
    execFileSync("bash", ["-c", cmd]);
    const outcomes = [outA, outB].map((file) => JSON.parse(fs.readFileSync(file, "utf8")));
    assert.equal(outcomes.filter((o) => o.ok).length, 1);
    gates.INCIDENT_5_CONCURRENCY_PREVENTED = true;
  } finally {
    fs.rmSync(outA, { force: true });
    fs.rmSync(outB, { force: true });
    fs.rmSync(hubRoot, { recursive: true, force: true });
  }
});

test("INCIDENT_8 — git bloat blocked before commit", () => {
  withLifecycle(({ hubRoot, zCacheRoot, repoRoot }) => {
    const { payloadHash } = prepareLifecycle(hubRoot, zCacheRoot, repoRoot);
    const runDir = path.join(repoRoot, "artifacts/agent-runs", HARVEST_ID);
    fs.writeFileSync(path.join(runDir, "thread-autopsy-bundle.json"), "{}\n");
    const retention = validateGitHarvestRetention({
      repoRoot,
      harvestId: HARVEST_ID,
      mode: "new",
    });
    assert.equal(retention.ok, false);
    gates.INCIDENT_8_GIT_BLOAT_PREVENTED = true;
    const second = materializePhaseCPointer({
      hubRoot,
      harvestId: HARVEST_ID,
      payloadHash,
      repoRoot,
      apply: true,
      env: { PHASE_C_POINTER_APPROVED: "1" },
    });
    assert.equal(second.verdict, "NOOP_CURRENT");
  });
});

test("FULL_LIFECYCLE — synthetic authority lifecycle", () => {
  withLifecycle(({ hubRoot, zCacheRoot, repoRoot }) => {
    const { payloadHash } = prepareLifecycle(hubRoot, zCacheRoot, repoRoot);
    const verdict = evaluateLayeredOperationalVerdict({
      hubRoot,
      repoRoot,
      zCacheRoot,
      harvestId: HARVEST_ID,
    });
    assert.equal(verdict.overallVerdict, OPERATIONAL_VERDICTS.OPERATIONAL);
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
    gates.FULL_LIFECYCLE_DOGFOOD_PASS = true;
    gates.UNCHANGED_REPUBLISH_NOOP_PASS = true;
    gates.NO_EXISTING_HARVEST_REPUBLISHED = true;
  });
});

console.log(`\n# tests ${passed + failed}`);
console.log(`# pass  ${passed}`);
console.log(`# fail  ${failed}`);
for (const [gate, ok] of Object.entries(gates)) {
  console.log(`# gate ${gate} ${ok ? "PASS" : "FAIL"}`);
}

const allGatesPass = Object.values(gates).every(Boolean);
process.exit(failed === 0 && allGatesPass ? 0 : 1);
