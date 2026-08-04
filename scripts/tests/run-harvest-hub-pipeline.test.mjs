#!/usr/bin/env node
/**
 * Harvest hub pipeline unit tests (compile, blind retrieval, hub sync when L: mounted).
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

import { compileSeedPackets } from "../harvest/lib/compile-seed-packets-lib.mjs";
import { runBlindRetrievalBenchmark } from "../harvest/lib/blind-retrieval-lib.mjs";
import {
  registerThreadAutopsyHubIndex,
  syncDoNotAdvanceToHub,
} from "../harvest/lib/register-hub-index.mjs";
import { resolveHubRoot } from "../harvest/lib/publish-hub-seed-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const FIXTURES = path.join(__dirname, "fixtures/thread-autopsy");

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

function readFixture(name) {
  return JSON.parse(fs.readFileSync(path.join(FIXTURES, name), "utf8"));
}

test("compileSeedPackets produces qa-index and catalog stubs", () => {
  const tmp = mkdtempSync(path.join(tmpdir(), "harvest-compile-"));
  const harvestId = "harvest-test-compile-v1";
  const runDir = path.join(tmp, "artifacts/agent-runs", harvestId);
  fs.mkdirSync(path.join(runDir, "seed-packets"), { recursive: true });
  fs.writeFileSync(
    path.join(runDir, "harvest-manifest-v1.json"),
    JSON.stringify(readFixture("valid-t1-manifest.json")),
  );
  fs.writeFileSync(
    path.join(runDir, "thread-autopsy-bundle.json"),
    JSON.stringify(readFixture("valid-t2-bundle.json")),
  );
  fs.writeFileSync(
    path.join(runDir, "seed-packets/IH-THREAD-TEST-001.json"),
    JSON.stringify(readFixture("valid-seed-packet.json")),
  );

  const gitHead = "a".repeat(40);
  const result = compileSeedPackets({ repoRoot: tmp, harvestId, gitHead });
  assert.equal(result.ok, true);
  assert.equal(result.seedCount, 1);
  assert.ok(fs.existsSync(path.join(runDir, "qa-index.json")));
  assert.ok(fs.existsSync(path.join(runDir, "hub-catalog-stubs/IH-THREAD-TEST-001.json")));
  rmSync(tmp, { recursive: true, force: true });
});

test("blind retrieval passes on fixture seed questions", () => {
  const tmp = mkdtempSync(path.join(tmpdir(), "harvest-blind-"));
  const harvestId = "harvest-test-blind-v1";
  const runDir = path.join(tmp, "artifacts/agent-runs", harvestId);
  fs.mkdirSync(path.join(runDir, "seed-packets"), { recursive: true });
  fs.writeFileSync(
    path.join(runDir, "seed-packets/IH-THREAD-TEST-001.json"),
    JSON.stringify(readFixture("valid-seed-packet.json")),
  );
  const report = runBlindRetrievalBenchmark({ repoRoot: tmp, harvestId });
  assert.equal(report.verdict, "BLIND_RETRIEVAL_PASS");
  rmSync(tmp, { recursive: true, force: true });
});

test("hub register and do-not-advance sync when hub mounted", () => {
  const hubRoot = resolveHubRoot();
  if (!fs.existsSync(path.join(hubRoot, "00-master-index", "BY-KIND"))) {
    console.log("skip - hub register (L: not mounted)");
    return;
  }
  const gitHead = "b".repeat(40);
  const reg = registerThreadAutopsyHubIndex({ hubRoot, gitHead });
  assert.equal(reg.ok, true);
  assert.ok(fs.existsSync(path.join(hubRoot, reg.slicePath)));
  const dna = syncDoNotAdvanceToHub({ repoRoot: REPO_ROOT, hubRoot });
  assert.equal(dna.ok, true);
  assert.ok(dna.entryCount >= 8);
});

console.log(`\n# hub pipeline tests ${passed + failed} pass ${passed} fail ${failed}`);
process.exit(failed > 0 ? 1 : 0);
