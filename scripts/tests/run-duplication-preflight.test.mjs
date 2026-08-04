#!/usr/bin/env node
/**
 * Duplication preflight gate — registry, command-index, and L: hub slice consultation.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  attachPreflightHashToBundle,
  runDuplicationPreflight,
} from "../harvest/lib/duplication-preflight-lib.mjs";

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

function mkHubRoot() {
  const hubRoot = fs.mkdtempSync(path.join(os.tmpdir(), "dup-preflight-hub-"));
  const byKind = path.join(hubRoot, "00-master-index/BY-KIND");
  fs.mkdirSync(byKind, { recursive: true });
  writeJson(path.join(byKind, "active-work-blockers.json"), {
    schemaVersion: "intelligence-hub-active-work-blockers-slice-v1@1.0.0",
    blockers: [],
  });
  writeJson(path.join(byKind, "thread-autopsy-index.json"), {
    schemaVersion: "intelligence-hub-thread-autopsy-index-slice-v1@1.0.0",
    harvests: [],
    criticalSeedIds: [],
  });
  fs.mkdirSync(path.join(hubRoot, "02-catalog/knowledge-objects/cross-agent-harvest"), {
    recursive: true,
  });
  return hubRoot;
}

function mkRepoWithHarvest(harvestId) {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "dup-preflight-repo-"));
  const runDir = path.join(repo, "artifacts/agent-runs", harvestId);
  fs.mkdirSync(runDir, { recursive: true });

  fs.mkdirSync(path.join(repo, "work-progress"), { recursive: true });
  fs.cpSync(
    path.join(REPO_ROOT, "work-progress/harvest-packet-registry.json"),
    path.join(repo, "work-progress/harvest-packet-registry.json"),
  );
  fs.cpSync(
    path.join(REPO_ROOT, "work-progress/command-index.json"),
    path.join(repo, "work-progress/command-index.json"),
  );

  const manifest = {
    schemaVersion: "cross-agent-harvest-manifest-v1@1.0.0",
    harvestId,
    packets: [
      {
        packetId: "dup-preflight-packet",
        packetTitle: "Duplication preflight test packet",
        packetVerdict: "RECORDED",
        evidenceRefs: ["EVT-001"],
      },
    ],
    threadAutopsy: { tier: "T2", subject: "dup-preflight-test-subject-unique" },
  };
  const bundle = {
    schemaVersion: "cross-agent-thread-autopsy-bundle-v1@1.0.0",
    harvestId,
    tier: "T2",
    wasteLedgerStatus: "NONE_FOUND",
    noneFoundEvidence: "dup preflight test",
    waste: [],
    roiBacklog: [{ rank: 1, title: "Run duplication preflight", whyItPays: "Blocks duplicate seeds" }],
    duplicationCheck: {
      registryConsulted: true,
      commandIndexConsulted: true,
      hubSlicesConsulted: ["active-work-blockers.json", "thread-autopsy-index.json"],
    },
    operatorFriction: [],
    executionDeltas: [],
    wrongMoves: [],
    duplicateWork: [],
    doNotAdvanceMap: [],
  };

  writeJson(path.join(runDir, "harvest-manifest-v1.json"), manifest);
  writeJson(path.join(runDir, "thread-autopsy-bundle.json"), bundle);

  const seed = {
    schemaVersion: "harvest-seed-packet-v1@1.0.0",
    seedId: "IH-DUP-PREFLIGHT-TEST-001",
    kind: "lesson",
    title: "Unique duplication preflight seed",
    summary: "Seed for duplication preflight broad gate test",
    retrievalQuestions: [
      "What does harvest duplication preflight consult on the Intelligence Hub?",
      "How does preflight block duplicate seed publication?",
    ],
    evidenceRefs: ["run-duplication-preflight.test.mjs"],
    futureAgentInstructions: {
      whenThisAppears: "T2 harvest with seed packets",
      startAt: ["work-progress/harvest-packet-registry.json"],
      runPreflight: ["npm run harvest:duplication-preflight -- --harvest-id=<id>"],
      doNot: ["skip duplication preflight before publish"],
      proveBeforeClaiming: ["duplication-preflight-receipt.json verdict PASS"],
    },
    ownerRepo: "CapitalGlass-Cross-Agent",
    promotionClass: "POLICY_GATED",
    status: "CANDIDATE",
  };
  fs.mkdirSync(path.join(runDir, "seed-packets"), { recursive: true });
  writeJson(path.join(runDir, "seed-packets/IH-DUP-PREFLIGHT-TEST-001.json"), seed);

  return { repo, runDir, harvestId, bundle };
}

test("preflight mode PASS consults registry and hub slices", () => {
  const hubRoot = mkHubRoot();
  const harvestId = "harvest-dup-preflight-pass-v1";
  const { repo, bundle } = mkRepoWithHarvest(harvestId);
  try {
    const result = runDuplicationPreflight({
      repoRoot: repo,
      harvestId,
      hubRoot,
      gitHead: "abc0000000000000000000000000000000000001",
      mode: "preflight",
      writeReceipt: true,
    });
    assert.equal(result.ok, true);
    assert.ok(result.receipt.sourcesConsulted.registryReadable);
    assert.ok(result.receipt.sourcesConsulted.commandIndexReadable);
    assert.ok(result.receipt.sourcesConsulted.hubSliceNames.includes("thread-autopsy-index.json"));

    const stamped = attachPreflightHashToBundle({ ...bundle }, result);
    assert.equal(stamped.duplicationCheck.preflightReceiptHash, result.receipt.contentHash);
  } finally {
    fs.rmSync(hubRoot, { recursive: true, force: true });
    fs.rmSync(repo, { recursive: true, force: true });
  }
});

test("semantic duplicate retrieval blocks publish mode", () => {
  const hubRoot = mkHubRoot();
  const harvestId = "harvest-dup-preflight-block-v1";
  const { repo, runDir, bundle } = mkRepoWithHarvest(harvestId);
  const catalogDir = path.join(hubRoot, "02-catalog/knowledge-objects/cross-agent-harvest");
  writeJson(path.join(catalogDir, "ih-existing-catalog-seed.json"), {
    envelope: {
      knowledgeDomain: "cross-agent-harvest",
      authoritySource: { harvestId: "harvest-prior-v1" },
    },
    body: {
      seedId: "IH-EXISTING-CATALOG-SEED",
      retrievalQuestions: [
        "How does harvest duplication preflight consult on the Intelligence Hub?",
        "What blocks duplicate seed publication on L catalog?",
      ],
    },
  });

  const seedPath = path.join(runDir, "seed-packets/IH-DUP-PREFLIGHT-TEST-001.json");
  const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));
  seed.retrievalQuestions = [
    "How does harvest duplication preflight consult on the Intelligence Hub?",
    "What blocks duplicate seed publication on L catalog?",
  ];
  writeJson(seedPath, seed);
  writeJson(path.join(runDir, "thread-autopsy-bundle.json"), bundle);

  try {
    const result = runDuplicationPreflight({
      repoRoot: repo,
      harvestId,
      hubRoot,
      gitHead: "abc0000000000000000000000000000000000002",
      mode: "publish",
      writeReceipt: false,
    });
    assert.equal(result.ok, false);
    assert.equal(result.verdict, "DUPLICATE_BLOCKED");
    assert.ok(result.errors.some((e) => e.includes("semantic duplicate retrieval")));
  } finally {
    fs.rmSync(hubRoot, { recursive: true, force: true });
    fs.rmSync(repo, { recursive: true, force: true });
  }
});

test("preflight writes receipt with stable content hash", () => {
  const hubRoot = mkHubRoot();
  const harvestId = "harvest-dup-preflight-receipt-v1";
  const { repo, runDir } = mkRepoWithHarvest(harvestId);
  try {
    const result = runDuplicationPreflight({
      repoRoot: repo,
      harvestId,
      hubRoot,
      gitHead: "abc0000000000000000000000000000000000003",
      mode: "preflight",
      writeReceipt: true,
    });
    assert.equal(result.ok, true);
    const receiptPath = path.join(runDir, "duplication-preflight-receipt.json");
    assert.ok(fs.existsSync(receiptPath));
    const receipt = JSON.parse(fs.readFileSync(receiptPath, "utf8"));
    assert.equal(receipt.verdict, "PASS");
    assert.equal(receipt.contentHash, result.receipt.contentHash);
    assert.ok(receipt.contentHash.length > 10);
  } finally {
    fs.rmSync(hubRoot, { recursive: true, force: true });
    fs.rmSync(repo, { recursive: true, force: true });
  }
});

console.log(`\n# duplication-preflight: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
