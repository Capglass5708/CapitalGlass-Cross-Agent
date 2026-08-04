#!/usr/bin/env node
/**
 * Thread autopsy validator unit tests (fixtures only — does not mutate production harvests).
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";

import { validateThreadAutopsy } from "../harvest/lib/validate-thread-autopsy.mjs";
import {
  validateHarvestSeedPacketSchema,
  validateThreadAutopsyBundleSchema,
} from "../harvest/lib/schema-validate.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const FIXTURES = path.join(__dirname, "fixtures/thread-autopsy");

function readFixture(name) {
  return JSON.parse(fs.readFileSync(path.join(FIXTURES, name), "utf8"));
}

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

function makeRunDir(suffix, files) {
  const runDir = mkdtempSync(path.join(tmpdir(), `harvest-autopsy-${suffix}-`));
  for (const [rel, content] of Object.entries(files)) {
    const dest = path.join(runDir, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, typeof content === "string" ? content : `${JSON.stringify(content, null, 2)}\n`);
  }
  return runDir;
}

test("T1 bundle schema validates", () => {
  const bundle = readFixture("valid-t1-bundle.json");
  const result = validateThreadAutopsyBundleSchema(bundle);
  assert.equal(result.ok, true, result.errors?.join("; "));
});

test("seed packet schema validates", () => {
  const seed = readFixture("valid-seed-packet.json");
  const result = validateHarvestSeedPacketSchema(seed);
  assert.equal(result.ok, true, result.errors?.join("; "));
});

test("validateThreadAutopsy passes valid T1 fixture", () => {
  const manifest = readFixture("valid-t1-manifest.json");
  const bundle = readFixture("valid-t1-bundle.json");
  const runDir = makeRunDir("t1-pass", {
    "thread-autopsy-bundle.json": bundle,
  });
  try {
    const result = validateThreadAutopsy({
      manifest,
      runDir,
      repoRoot: REPO_ROOT,
      duplicationPreflight: "skip",
    });
    assert.equal(result.skipped, false);
    assert.equal(result.tier, "T1");
    assert.equal(result.errors.length, 0, result.errors.join("; "));
  } finally {
    rmSync(runDir, { recursive: true, force: true });
  }
});

test("validateThreadAutopsy fails T1 without bundle", () => {
  const manifest = readFixture("valid-t1-manifest.json");
  const runDir = makeRunDir("t1-missing", {});
  try {
    const result = validateThreadAutopsy({
      manifest,
      runDir,
      repoRoot: REPO_ROOT,
      duplicationPreflight: "skip",
    });
    assert.ok(result.errors.some((e) => e.includes("thread-autopsy-bundle.json missing")));
  } finally {
    rmSync(runDir, { recursive: true, force: true });
  }
});

test("validateThreadAutopsy fails T1 when waste POPULATED but empty", () => {
  const manifest = readFixture("valid-t1-manifest.json");
  const bundle = readFixture("valid-t1-bundle.json");
  bundle.wasteLedgerStatus = "POPULATED";
  bundle.waste = [];
  const runDir = makeRunDir("t1-waste", { "thread-autopsy-bundle.json": bundle });
  try {
    const result = validateThreadAutopsy({
      manifest,
      runDir,
      repoRoot: REPO_ROOT,
      duplicationPreflight: "skip",
    });
    assert.ok(result.errors.some((e) => e.includes("at least one waste entry")));
  } finally {
    rmSync(runDir, { recursive: true, force: true });
  }
});

test("validateThreadAutopsy fails T1 when duplicationCheck not consulted", () => {
  const manifest = readFixture("valid-t1-manifest.json");
  const bundle = readFixture("valid-t1-bundle.json");
  bundle.duplicationCheck.registryConsulted = false;
  const runDir = makeRunDir("t1-dup", { "thread-autopsy-bundle.json": bundle });
  try {
    const result = validateThreadAutopsy({
      manifest,
      runDir,
      repoRoot: REPO_ROOT,
      duplicationPreflight: "skip",
    });
    assert.ok(result.errors.some((e) => e.includes("registryConsulted")));
  } finally {
    rmSync(runDir, { recursive: true, force: true });
  }
});

test("validateThreadAutopsy passes valid T2 with seed packet", () => {
  const manifest = readFixture("valid-t1-manifest.json");
  manifest.harvestId = "harvest-test-autopsy-t2-v1";
  manifest.threadAutopsy = {
    tier: "T2",
    bundlePath: "artifacts/agent-runs/harvest-test-autopsy-t2-v1/thread-autopsy-bundle.json",
    seedPacketIndexPath: "artifacts/agent-runs/harvest-test-autopsy-t2-v1/seed-packet-index.json",
    counts: { waste: 1, seeds: 1, roiItems: 1, operatorFriction: 1 },
  };
  const bundle = readFixture("valid-t2-bundle.json");
  const seed = readFixture("valid-seed-packet.json");
  const runDir = makeRunDir("t2-pass", {
    "thread-autopsy-bundle.json": bundle,
    "seed-packets/IH-THREAD-TEST-001.json": seed,
    "seed-packet-index.json": { seedIds: ["IH-THREAD-TEST-001"] },
  });
  try {
    const result = validateThreadAutopsy({
      manifest,
      runDir,
      repoRoot: REPO_ROOT,
      duplicationPreflight: "skip",
    });
    assert.equal(result.errors.length, 0, result.errors.join("; "));
  } finally {
    rmSync(runDir, { recursive: true, force: true });
  }
});

test("validateThreadAutopsy fails T2 without seed-packets directory", () => {
  const manifest = readFixture("valid-t1-manifest.json");
  manifest.threadAutopsy.tier = "T2";
  const bundle = readFixture("valid-t2-bundle.json");
  const runDir = makeRunDir("t2-noseed", { "thread-autopsy-bundle.json": bundle });
  try {
    const result = validateThreadAutopsy({
      manifest,
      runDir,
      repoRoot: REPO_ROOT,
      duplicationPreflight: "skip",
    });
    assert.ok(result.errors.some((e) => e.includes("seed-packets")));
  } finally {
    rmSync(runDir, { recursive: true, force: true });
  }
});

test("validateThreadAutopsy skips when threadAutopsy absent", () => {
  const manifest = { harvestId: "legacy", packets: [] };
  const runDir = makeRunDir("legacy", {});
  try {
    const result = validateThreadAutopsy({
      manifest,
      runDir,
      repoRoot: REPO_ROOT,
      duplicationPreflight: "skip",
    });
    assert.equal(result.skipped, true);
    assert.equal(result.errors.length, 0);
  } finally {
    rmSync(runDir, { recursive: true, force: true });
  }
});

test("validateThreadAutopsy fails count mismatch", () => {
  const manifest = readFixture("valid-t1-manifest.json");
  manifest.threadAutopsy.counts.waste = 99;
  const bundle = readFixture("valid-t1-bundle.json");
  const runDir = makeRunDir("t1-count", { "thread-autopsy-bundle.json": bundle });
  try {
    const result = validateThreadAutopsy({
      manifest,
      runDir,
      repoRoot: REPO_ROOT,
      duplicationPreflight: "skip",
    });
    assert.ok(result.errors.some((e) => e.includes("counts.waste")));
  } finally {
    rmSync(runDir, { recursive: true, force: true });
  }
});

console.log(`\n# thread-autopsy tests ${passed + failed} pass ${passed} fail ${failed}`);
process.exit(failed > 0 ? 1 : 0);
