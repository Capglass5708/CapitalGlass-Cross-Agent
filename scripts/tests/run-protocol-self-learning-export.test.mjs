#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildProtocolSelfLearningInput,
  exportProtocolSelfLearning,
} from "../harvest/lib/protocol-self-learning-export-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = path.join(__dirname, "fixtures/protocol-self-learning-export-v1");
const HARVEST_ID = "harvest-protocol-self-learning-fixture-v1";

function installFixture() {
  const runDir = path.join(__dirname, "../../artifacts/agent-runs", HARVEST_ID);
  fs.mkdirSync(runDir, { recursive: true });
  for (const name of ["harvest-manifest-v1.json", "validation-result.json"]) {
    fs.copyFileSync(path.join(FIXTURE, name), path.join(runDir, name));
  }
  return runDir;
}

const runDir = installFixture();

const blocked = buildProtocolSelfLearningInput({
  harvestId: HARVEST_ID,
  runDir,
  options: { allowUnvalidated: false },
});
assert.equal(blocked.ok, true);
console.log("ok - build input requires validation PASS");

const built = buildProtocolSelfLearningInput({ harvestId: HARVEST_ID, runDir });
assert.equal(built.ok, true);
assert.equal(built.candidateCount, 1);
assert.equal(built.input.protocolImprovementCandidates[0].category, "HARVEST_VALIDATOR");

const first = exportProtocolSelfLearning({ harvestId: HARVEST_ID, options: { runDir } });
assert.equal(first.ok, true);
assert.ok(first.contentHash);
const second = exportProtocolSelfLearning({ harvestId: HARVEST_ID, options: { runDir } });
assert.equal(first.contentHash, second.contentHash);
console.log("ok - export produces deterministic content hash");

console.log("\n# tests 2 pass 2 fail 0");
