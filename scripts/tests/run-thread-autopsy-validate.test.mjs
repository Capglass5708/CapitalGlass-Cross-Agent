#!/usr/bin/env node
/**
 * Thread autopsy validation — lib + CLI gate for test:harvest broad suite.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { validateThreadAutopsy } from "../harvest/lib/validate-thread-autopsy.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");

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

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function withTmpRunDir(fn) {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "autopsy-validate-repo-"));
  const harvestId = "harvest-autopsy-validate-fixture-v1";
  const runDir = path.join(repo, "artifacts/agent-runs", harvestId);
  fs.mkdirSync(runDir, { recursive: true });
  try {
    return fn({ repo, harvestId, runDir });
  } finally {
    fs.rmSync(repo, { recursive: true, force: true });
  }
}

test("legacy harvest without threadAutopsy is skipped", () => {
  withTmpRunDir(({ repo, harvestId, runDir }) => {
    const manifest = {
      schemaVersion: "cross-agent-harvest-manifest-v1@1.0.0",
      harvestId,
      packets: [],
    };
    writeJson(path.join(runDir, "harvest-manifest-v1.json"), manifest);
    const result = validateThreadAutopsy({ manifest, runDir, repoRoot: repo });
    assert.equal(result.skipped, true);
    assert.equal(result.errors.length, 0);
  });
});

test("valid T1 autopsy bundle passes validation", () => {
  withTmpRunDir(({ repo, harvestId, runDir }) => {
    const manifest = {
      schemaVersion: "cross-agent-harvest-manifest-v1@1.0.0",
      harvestId,
      threadAutopsy: { tier: "T1" },
      packets: [
        {
          packetId: "autopsy-packet-a",
          packetVerdict: "RECORDED",
          evidenceRefs: ["EVT-001"],
        },
      ],
    };
    const bundle = {
      schemaVersion: "cross-agent-thread-autopsy-bundle-v1@1.0.0",
      harvestId,
      tier: "T1",
      wasteLedgerStatus: "NONE_FOUND",
      noneFoundEvidence: "fixture autopsy validate test",
      waste: [],
      operatorFriction: [],
      executionDeltas: [],
      wrongMoves: [],
      duplicateWork: [],
      roiBacklog: [
        {
          rank: 1,
          title: "Validate autopsy gate",
          whyItPays: "Prevents incomplete thread autopsy publication",
          effort: "low",
          seedAs: "runbook",
        },
      ],
      doNotAdvanceMap: [],
      duplicationCheck: {
        registryConsulted: true,
        commandIndexConsulted: true,
        hubSlicesConsulted: ["active-work-blockers.json", "thread-autopsy-index.json"],
      },
    };
    writeJson(path.join(runDir, "harvest-manifest-v1.json"), manifest);
    writeJson(path.join(runDir, "thread-autopsy-bundle.json"), bundle);
    const result = validateThreadAutopsy({ manifest, runDir, repoRoot: repo });
    assert.equal(result.skipped, false);
    assert.equal(result.errors.length, 0);
  });
});

test("T1+ missing bundle fails validation", () => {
  withTmpRunDir(({ repo, harvestId, runDir }) => {
    const manifest = {
      schemaVersion: "cross-agent-harvest-manifest-v1@1.0.0",
      harvestId,
      threadAutopsy: { tier: "T1" },
      packets: [],
    };
    writeJson(path.join(runDir, "harvest-manifest-v1.json"), manifest);
    const result = validateThreadAutopsy({ manifest, runDir, repoRoot: repo });
    assert.ok(result.errors.some((e) => e.includes("thread-autopsy-bundle.json missing")));
  });
});

test("validate-autopsy CLI exits zero on synthetic harvest run dir", () => {
  const harvestId = "harvest-thread-autopsy-cli-test-v1";
  const runDir = path.join(REPO_ROOT, "artifacts/agent-runs", harvestId);
  const seedSrc = path.join(
    REPO_ROOT,
    "scripts/tests/fixtures/harvest-knowledge-quality-pass-v1/source/seed-packets/IH-QUALITY-PASS-SEED-A.json",
  );
  try {
    fs.mkdirSync(path.join(runDir, "seed-packets"), { recursive: true });
    fs.cpSync(seedSrc, path.join(runDir, "seed-packets/IH-QUALITY-PASS-SEED-A.json"));
    writeJson(path.join(runDir, "seed-packet-index.json"), {
      schemaVersion: "harvest-seed-packet-index-v1@1.0.0",
      harvestId,
      seedIds: ["IH-QUALITY-PASS-SEED-A"],
    });
    writeJson(path.join(runDir, "harvest-manifest-v1.json"), {
      schemaVersion: "cross-agent-harvest-manifest-v1@1.0.0",
      harvestId,
      threadAutopsy: {
        tier: "T2",
        seedPacketIndexPath: `artifacts/agent-runs/${harvestId}/seed-packet-index.json`,
        counts: { waste: 0, seeds: 1, roiItems: 1, operatorFriction: 0, executionDeltas: 1 },
      },
      packets: [
        {
          packetId: "autopsy-cli-packet",
          packetVerdict: "RECORDED",
          evidenceRefs: ["EVT-001"],
        },
      ],
    });
    writeJson(path.join(runDir, "thread-autopsy-bundle.json"), {
      schemaVersion: "cross-agent-thread-autopsy-bundle-v1@1.0.0",
      harvestId,
      tier: "T2",
      wasteLedgerStatus: "NONE_FOUND",
      noneFoundEvidence: "cli test fixture",
      waste: [],
      roiBacklog: [
        {
          rank: 1,
          title: "Thread autopsy CLI gate",
          whyItPays: "Ensures validate-autopsy CLI is wired for test:harvest",
          effort: "low",
          seedAs: "command",
        },
      ],
      duplicationCheck: {
        registryConsulted: true,
        commandIndexConsulted: true,
        hubSlicesConsulted: ["active-work-blockers.json", "thread-autopsy-index.json"],
      },
      executionDeltas: [
        {
          executionDeltaId: "ED-001",
          situation: "validate-autopsy CLI test",
          actualExecution: { steps: ["skip index"], outcome: "SUBOPTIMAL" },
          optimalExecution: { steps: ["scout preflight first"], outcome: "OPTIMAL" },
          deltaCost: { time: "low", tokens: "low", operatorFrustration: "low" },
        },
      ],
      wrongMoves: [],
      duplicateWork: [],
      operatorFriction: [],
      doNotAdvanceMap: [],
    });
    execFileSync("npm", ["run", "harvest:validate-autopsy", "--", `--harvest-id=${harvestId}`], {
      cwd: REPO_ROOT,
      stdio: "pipe",
    });
    const receipt = JSON.parse(
      fs.readFileSync(path.join(runDir, "thread-autopsy-validation-result.json"), "utf8"),
    );
    assert.equal(receipt.verdict, "PASS");
  } finally {
    fs.rmSync(runDir, { recursive: true, force: true });
  }
});

console.log(`\n# thread-autopsy-validate: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
