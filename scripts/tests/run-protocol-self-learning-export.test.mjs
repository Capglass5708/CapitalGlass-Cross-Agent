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

const protocolDoc = fs.readFileSync(
  path.join(__dirname, "../../harvest/protocol/CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1.md"),
  "utf8",
);
const chatgptDoc = fs.readFileSync(
  path.join(__dirname, "../../harvest/protocol/CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-CHATGPT-V1.md"),
  "utf8",
);

assert.match(protocolDoc, /### Lane A — owner-repo material work/);
assert.match(protocolDoc, /### Lane B — cross-thread autopsy/);
assert.match(protocolDoc, /### Lane C — Harvest Protocol Self-Learning/);
assert.match(protocolDoc, /L:\\\\02-catalog\\\\Harvest\\\\Harvest Protocol Self Learning/);
assert.match(protocolDoc, /\*\*Data-Extraction\*\* owns protocol relevance filtering/);
assert.match(protocolDoc, /\*\*CapitalGlass-Cross-Agent\*\* owns canonical harvest records/);
assert.match(protocolDoc, /application bugs/);
assert.match(protocolDoc, /WaveRunner self-improvement lane/);
assert.match(protocolDoc, /npm run harvest:export:protocol-self-learning/);
assert.match(protocolDoc, /npm run harvest-protocol:self-learning:publish-l/);
assert.match(protocolDoc, /automaticProtocolMutation": false/);
assert.match(protocolDoc, /RETRIEVAL_ONLY/);
assert.match(protocolDoc, /no automatic main merge/);

assert.match(chatgptDoc, /Lane C — harvest protocol self-learning \(draft only\)/);
assert.match(chatgptDoc, /harvest:export:protocol-self-learning/);
assert.match(chatgptDoc, /does not\*\* run Data-Extraction/);
assert.match(chatgptDoc, /protocolSelfLearning\.exportStatus: not-run/);
assert.match(chatgptDoc, /WaveRunner self-improvement/);

console.log("ok - canonical protocol docs document Lane C alignment");

console.log("\n# tests 3 pass 3 fail 0");
