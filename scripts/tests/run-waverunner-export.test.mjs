import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildWaverunnerHarvestInput,
  exportWaverunnerSelfImprovement,
} from "../harvest/lib/waverunner-export-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = path.join(__dirname, "fixtures/waverunner-export-v1");
const HARVEST_ID = "harvest-waverunner-routing-fixture-v1";

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

function withTempRunDir(fn) {
  const runDir = fs.mkdtempSync(path.join(os.tmpdir(), "waverunner-export-"));
  for (const name of fs.readdirSync(FIXTURE)) {
    fs.copyFileSync(path.join(FIXTURE, name), path.join(runDir, name));
  }
  try {
    return fn(runDir);
  } finally {
    fs.rmSync(runDir, { recursive: true, force: true });
  }
}

test("build input requires validation PASS", () => {
  withTempRunDir((runDir) => {
    fs.unlinkSync(path.join(runDir, "validation-result.json"));
    const result = buildWaverunnerHarvestInput({ harvestId: HARVEST_ID, runDir });
    assert.equal(result.ok, false);
    assert.equal(result.code, "VALIDATION_REQUIRED");
  });
});

test("export produces deterministic content hash and handoff files", () => {
  withTempRunDir((runDir) => {
    const result = exportWaverunnerSelfImprovement({
      harvestId: HARVEST_ID,
      options: { runDir },
    });
    assert.equal(result.ok, true);
    assert.equal(result.candidateCount, 1);
    assert.ok(fs.existsSync(path.join(runDir, "data-extraction-handoff/waverunner-self-improvement-harvest-input.json")));
    assert.ok(fs.existsSync(path.join(runDir, "data-extraction-handoff/export-receipt.json")));
    assert.match(result.contentHash, /^sha256:[0-9a-f]{64}$/);
    assert.equal(result.receipt.lPublicationStatus, "NOT_RUN_BY_CROSS_AGENT");
  });
});

console.log(`\n# tests ${passed + failed} pass ${passed} fail ${failed}`);
process.exit(failed ? 1 : 0);
