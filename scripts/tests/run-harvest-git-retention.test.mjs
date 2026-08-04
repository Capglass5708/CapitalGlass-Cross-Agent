#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import {
  GIT_RETENTION_VERDICTS,
  TARGET_VERDICT,
  validateGitHarvestRetention,
} from "../harvest/lib/harvest-git-retention-lib.mjs";
import {
  GIT_POINTER_FILENAME,
  harvestRunDir,
} from "../harvest/lib/phase-c-pointer-materialization-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const HARVEST_ID = "harvest-git-retention-fixture-v1";
const MANIFEST = "harvest-manifest-v1.json";
const POINTER = GIT_POINTER_FILENAME;

const gates = {
  GIT_RETENTION_PASS: false,
  GIT_FILE_BUDGET_PASS: false,
  NEW_HARVEST_ENFORCEMENT_PASS: false,
  PAYLOAD_DUPLICATION_BLOCK_PASS: false,
  RUNTIME_ARTIFACT_BLOCK_PASS: false,
  LOCAL_PATH_BLOCK_PASS: false,
  SECRET_PATTERN_BLOCK_PASS: false,
  POINTER_SIZE_PASS: false,
  IDENTITY_ALIGNMENT_PASS: false,
  HISTORICAL_NONDESTRUCTIVE_PASS: false,
  READ_ONLY_RETENTION_PASS: false,
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

function withRepo(fn) {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), "harvest-retention-git-"));
  fs.mkdirSync(path.join(repoRoot, "artifacts/agent-runs"), { recursive: true });
  fs.writeFileSync(path.join(repoRoot, "README.md"), "# retention\n");
  execFileSync("git", ["init"], { cwd: repoRoot });
  execFileSync("git", ["config", "user.email", "retention-test@capitalglass.local"], { cwd: repoRoot });
  execFileSync("git", ["config", "user.name", "Retention Test"], { cwd: repoRoot });
  execFileSync("git", ["add", "."], { cwd: repoRoot });
  execFileSync("git", ["commit", "-m", "init"], { cwd: repoRoot });
  try {
    return fn(repoRoot);
  } finally {
    fs.rmSync(repoRoot, { recursive: true, force: true });
  }
}

function writeRunFiles(repoRoot, files) {
  const runDir = harvestRunDir(repoRoot, HARVEST_ID);
  fs.mkdirSync(runDir, { recursive: true });
  for (const [name, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(runDir, name), content);
  }
}

const basePointer = {
  schemaVersion: "harvest-publication-pointer-v1@1.0.0",
  harvestId: HARVEST_ID,
  manifestHash: "sha256:1111111111111111111111111111111111111111111111111111111111111111",
  payloadHash: "sha256:2222222222222222222222222222222222222222222222222222222222222222",
  authoritySourceCommit: "abc123",
  phaseBVerdict: "PHASE_B_COMPLETE",
};

const baseManifest = {
  schemaVersion: "cross-agent-harvest-manifest-v1@1.0.0",
  harvestId: HARVEST_ID,
  manifestHash: basePointer.manifestHash,
  payloadHash: basePointer.payloadHash,
};

test("manifest + pointer passes", () => {
  withRepo((repoRoot) => {
    writeRunFiles(repoRoot, {
      [MANIFEST]: `${JSON.stringify(baseManifest, null, 2)}\n`,
      [POINTER]: `${JSON.stringify(basePointer, null, 2)}\n`,
    });
    const result = validateGitHarvestRetention({
      repoRoot,
      harvestId: HARVEST_ID,
      manifest: baseManifest,
      pointer: basePointer,
      mode: "new",
    });
    assert.equal(result.ok, true);
    gates.GIT_FILE_BUDGET_PASS = true;
    gates.NEW_HARVEST_ENFORCEMENT_PASS = true;
  });
});

test("manifest + pointer + summary passes", () => {
  withRepo((repoRoot) => {
    writeRunFiles(repoRoot, {
      [MANIFEST]: `${JSON.stringify(baseManifest, null, 2)}\n`,
      [POINTER]: `${JSON.stringify(basePointer, null, 2)}\n`,
      "HARVEST_SUMMARY.md": "# summary\n",
    });
    const result = validateGitHarvestRetention({
      repoRoot,
      harvestId: HARVEST_ID,
      manifest: baseManifest,
      pointer: basePointer,
      mode: "new",
    });
    assert.equal(result.ok, true);
  });
});

test("fourth unapproved file blocks", () => {
  withRepo((repoRoot) => {
    writeRunFiles(repoRoot, {
      [MANIFEST]: `${JSON.stringify(baseManifest, null, 2)}\n`,
      [POINTER]: `${JSON.stringify(basePointer, null, 2)}\n`,
      "extra.json": "{}\n",
    });
    const result = validateGitHarvestRetention({
      repoRoot,
      harvestId: HARVEST_ID,
      manifest: baseManifest,
      pointer: basePointer,
      mode: "new",
    });
    assert.equal(result.ok, false);
    assert.equal(result.verdict, GIT_RETENTION_VERDICTS.BLOCKED_FILE_BUDGET);
  });
});

test("full autopsy bundle blocks", () => {
  withRepo((repoRoot) => {
    writeRunFiles(repoRoot, {
      [MANIFEST]: `${JSON.stringify(baseManifest, null, 2)}\n`,
      [POINTER]: `${JSON.stringify(basePointer, null, 2)}\n`,
      "thread-autopsy-bundle.json": "{}\n",
    });
    const result = validateGitHarvestRetention({
      repoRoot,
      harvestId: HARVEST_ID,
      mode: "new",
    });
    assert.equal(result.ok, false);
    gates.PAYLOAD_DUPLICATION_BLOCK_PASS = true;
  });
});

test("seed directory blocks", () => {
  withRepo((repoRoot) => {
    const runDir = harvestRunDir(repoRoot, HARVEST_ID);
    fs.mkdirSync(path.join(runDir, "seed-packets"), { recursive: true });
    writeRunFiles(repoRoot, {
      [MANIFEST]: `${JSON.stringify(baseManifest, null, 2)}\n`,
      [POINTER]: `${JSON.stringify(basePointer, null, 2)}\n`,
    });
    const result = validateGitHarvestRetention({
      repoRoot,
      harvestId: HARVEST_ID,
      mode: "new",
    });
    assert.equal(result.ok, false);
    gates.RUNTIME_ARTIFACT_BLOCK_PASS = true;
  });
});

test("phase receipts and lock files block", () => {
  withRepo((repoRoot) => {
    writeRunFiles(repoRoot, {
      [MANIFEST]: `${JSON.stringify(baseManifest, null, 2)}\n`,
      [POINTER]: `${JSON.stringify(basePointer, null, 2)}\n`,
      "phase-b-receipt.json": "{}\n",
      "phase-c-receipt.json": "{}\n",
      "lock.json": "{}\n",
    });
    const result = validateGitHarvestRetention({
      repoRoot,
      harvestId: HARVEST_ID,
      mode: "new",
    });
    assert.equal(result.ok, false);
  });
});

test("absolute paths in pointer block", () => {
  withRepo((repoRoot) => {
    const pointer = {
      ...basePointer,
      note: "C:\\Developer\\secret-path",
    };
    const result = validateGitHarvestRetention({
      repoRoot,
      harvestId: HARVEST_ID,
      manifest: baseManifest,
      pointer,
      mode: "new",
      stage: "pre-commit",
    });
    assert.equal(result.ok, false);
    gates.LOCAL_PATH_BLOCK_PASS = true;
  });
});

test("secret-like field blocks", () => {
  withRepo((repoRoot) => {
    const pointer = {
      ...basePointer,
      service_role_key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.abc",
    };
    const result = validateGitHarvestRetention({
      repoRoot,
      harvestId: HARVEST_ID,
      pointer,
      mode: "new",
      stage: "pre-commit",
    });
    assert.equal(result.ok, false);
    gates.SECRET_PATTERN_BLOCK_PASS = true;
  });
});

test("oversized pointer blocks", () => {
  withRepo((repoRoot) => {
    const pointer = { ...basePointer, filler: "x".repeat(20_000) };
    const result = validateGitHarvestRetention({
      repoRoot,
      harvestId: HARVEST_ID,
      pointer,
      mode: "new",
      stage: "pre-commit",
    });
    assert.equal(result.ok, false);
    gates.POINTER_SIZE_PASS = true;
  });
});

test("manifest/pointer payloadHash mismatch blocks", () => {
  withRepo((repoRoot) => {
    const manifest = { ...baseManifest, payloadHash: "sha256:3333" };
    const result = validateGitHarvestRetention({
      repoRoot,
      harvestId: HARVEST_ID,
      manifest,
      pointer: basePointer,
      mode: "new",
      stage: "pre-commit",
    });
    assert.equal(result.ok, false);
    gates.IDENTITY_ALIGNMENT_PASS = true;
  });
});

test("historical legacy tree warns without deletion", () => {
  withRepo((repoRoot) => {
    writeRunFiles(repoRoot, {
      [MANIFEST]: `${JSON.stringify(baseManifest, null, 2)}\n`,
      "thread-event-inventory.json": "{}\n",
    });
    const result = validateGitHarvestRetention({
      repoRoot,
      harvestId: HARVEST_ID,
      mode: "historical",
    });
    assert.equal(fs.existsSync(harvestRunDir(repoRoot, HARVEST_ID)), true);
    gates.HISTORICAL_NONDESTRUCTIVE_PASS = true;
    assert.ok(result.warnings.length > 0 || result.ok);
  });
});

test("validator is read-only for Git porcelain", () => {
  withRepo((repoRoot) => {
    writeRunFiles(repoRoot, {
      [MANIFEST]: `${JSON.stringify(baseManifest, null, 2)}\n`,
      [POINTER]: `${JSON.stringify(basePointer, null, 2)}\n`,
    });
    const before = execFileSync("git", ["-C", repoRoot, "status", "--porcelain"], {
      encoding: "utf8",
    });
    validateGitHarvestRetention({
      repoRoot,
      harvestId: HARVEST_ID,
      manifest: baseManifest,
      pointer: basePointer,
      mode: "new",
    });
    const after = execFileSync("git", ["-C", repoRoot, "status", "--porcelain"], {
      encoding: "utf8",
    });
    assert.equal(before, after);
    gates.READ_ONLY_RETENTION_PASS = true;
  });
});

if (failed === 0) {
  gates.GIT_RETENTION_PASS = true;
}

console.log(`\n# tests ${passed + failed}`);
console.log(`# pass  ${passed}`);
console.log(`# fail  ${failed}`);
console.log(`# target ${TARGET_VERDICT}`);
for (const [gate, ok] of Object.entries(gates)) {
  console.log(`# gate ${gate} ${ok ? "PASS" : "FAIL"}`);
}

process.exit(failed === 0 && gates.GIT_RETENTION_PASS ? 0 : 1);
