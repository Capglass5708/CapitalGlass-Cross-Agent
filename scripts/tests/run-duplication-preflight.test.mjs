#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";

import {
  attachPreflightHashToBundle,
  runDuplicationPreflight,
} from "../harvest/lib/duplication-preflight-lib.mjs";
import { hashCanonicalJson } from "../harvest/lib/hash.mjs";

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

function makeIsolatedHub() {
  const hub = mkdtempSync(path.join(tmpdir(), "hub-dup-"));
  const byKind = path.join(hub, "00-master-index/BY-KIND");
  const catalog = path.join(hub, "02-catalog/knowledge-objects/cross-agent-harvest");
  fs.mkdirSync(byKind, { recursive: true });
  fs.mkdirSync(catalog, { recursive: true });
  writeJson(path.join(byKind, "active-work-blockers.json"), {
    schemaVersion: "test",
    blockers: [],
    sourceCommitSha: "a".repeat(40),
  });
  writeJson(path.join(byKind, "thread-autopsy-index.json"), {
    schemaVersion: "intelligence-hub-thread-autopsy-index-slice-v1@1.0.0",
    harvestCount: 1,
    harvests: [
      {
        harvestId: "harvest-existing-subject-v1",
        subject: "Staging alias verification",
        tier: "T2",
        seedIds: ["IH-EXISTING-001"],
      },
    ],
    criticalSeedIds: [],
  });
  writeJson(path.join(catalog, "IH-EXISTING-001.json"), {
    envelope: { knowledgeObjectType: "harvest-thread-autopsy-seed" },
    body: {
      seedId: "IH-EXISTING-001",
      retrievalQuestions: ["Why does staging show old renderer after dev merge?"],
    },
  });
  return hub;
}

function makeRepo(hub) {
  const repo = mkdtempSync(path.join(tmpdir(), "repo-dup-"));
  writeJson(path.join(repo, "work-progress/harvest-packet-registry.json"), {
    packets: {
      "existing-packet-v1": { latestHarvestId: "harvest-prior-v1", latestVerdict: "PASS" },
    },
  });
  writeJson(path.join(repo, "work-progress/command-index.json"), { commands: [] });
  return repo;
}

test("blocks duplicate seedId on publish", () => {
  const hub = makeIsolatedHub();
  const repo = makeRepo(hub);
  const harvestId = "harvest-dup-seed-test-v1";
  const runDir = path.join(repo, "artifacts/agent-runs", harvestId);
  writeJson(path.join(runDir, "harvest-manifest-v1.json"), {
    harvestId,
    threadAutopsy: { tier: "T2" },
    packets: [{ packetId: "new-packet-v1", packetTitle: "New work" }],
  });
  writeJson(path.join(runDir, "thread-autopsy-bundle.json"), {
    tier: "T2",
    duplicateWork: [],
    duplicationCheck: {
      registryConsulted: true,
      commandIndexConsulted: true,
      hubSlicesConsulted: ["active-work-blockers.json", "thread-autopsy-index.json"],
    },
  });
  writeJson(path.join(runDir, "seed-packets/IH-EXISTING-001.json"), {
    seedId: "IH-EXISTING-001",
    retrievalQuestions: ["Different question entirely about doors"],
    summary: "test",
    title: "test",
    kind: "lesson",
    futureAgentInstructions: { whenThisAppears: "x", startAt: ["a"], doNot: ["b"], proveBeforeClaiming: ["c"] },
    evidenceRefs: ["e"],
  });

  const result = runDuplicationPreflight({
    repoRoot: repo,
    harvestId,
    runDir,
    hubRoot: hub,
    mode: "publish",
    writeReceipt: false,
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((e) => e.includes("IH-EXISTING-001")));
  rmSync(hub, { recursive: true, force: true });
  rmSync(repo, { recursive: true, force: true });
});

test("blocks semantic duplicate retrieval questions", () => {
  const hub = makeIsolatedHub();
  const repo = makeRepo(hub);
  const harvestId = "harvest-dup-semantic-test-v1";
  const runDir = path.join(repo, "artifacts/agent-runs", harvestId);
  writeJson(path.join(runDir, "harvest-manifest-v1.json"), {
    harvestId,
    threadAutopsy: { tier: "T2" },
    packets: [{ packetId: "semantic-packet-v1", packetTitle: "Semantic dup" }],
  });
  writeJson(path.join(runDir, "thread-autopsy-bundle.json"), {
    tier: "T2",
    duplicateWork: [],
    duplicationCheck: {
      registryConsulted: true,
      commandIndexConsulted: true,
      hubSlicesConsulted: ["active-work-blockers.json", "thread-autopsy-index.json"],
    },
  });
  writeJson(path.join(runDir, "seed-packets/IH-NEW-SEMANTIC.json"), {
    seedId: "IH-NEW-SEMANTIC",
    retrievalQuestions: ["Why does staging show old renderer after dev merge?"],
    summary: "test",
    title: "test",
    kind: "lesson",
    futureAgentInstructions: { whenThisAppears: "x", startAt: ["a"], doNot: ["b"], proveBeforeClaiming: ["c"] },
    evidenceRefs: ["e"],
  });

  const result = runDuplicationPreflight({
    repoRoot: repo,
    harvestId,
    runDir,
    hubRoot: hub,
    mode: "validate",
    writeReceipt: false,
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((e) => e.includes("semantic duplicate")));
  rmSync(hub, { recursive: true, force: true });
  rmSync(repo, { recursive: true, force: true });
});

test("attachPreflightHashToBundle writes receipt hash", () => {
  const hub = makeIsolatedHub();
  const repo = makeRepo(hub);
  const harvestId = "harvest-hash-test-v1";
  const runDir = path.join(repo, "artifacts/agent-runs", harvestId);
  writeJson(path.join(runDir, "harvest-manifest-v1.json"), {
    harvestId,
    threadAutopsy: { tier: "T1" },
    packets: [{ packetId: "unique-packet-v1", packetTitle: "Unique subject title" }],
  });
  const bundle = {
    tier: "T1",
    duplicateWork: [],
    duplicationCheck: {
      registryConsulted: true,
      commandIndexConsulted: true,
      hubSlicesConsulted: ["active-work-blockers.json", "thread-autopsy-index.json"],
    },
  };

  const preflight = runDuplicationPreflight({
    repoRoot: repo,
    harvestId,
    runDir,
    manifest: readJson(path.join(runDir, "harvest-manifest-v1.json")),
    bundle,
    hubRoot: hub,
    mode: "preflight",
    writeReceipt: true,
  });
  attachPreflightHashToBundle(bundle, preflight);
  assert.equal(bundle.duplicationCheck.preflightReceiptHash, preflight.receipt.contentHash);
  assert.equal(bundle.duplicationCheck.preflightReceiptHash.length, 64);

  const validateAgain = runDuplicationPreflight({
    repoRoot: repo,
    harvestId,
    runDir,
    manifest: readJson(path.join(runDir, "harvest-manifest-v1.json")),
    bundle,
    hubRoot: hub,
    mode: "validate",
    writeReceipt: false,
  });
  assert.equal(validateAgain.ok, true, validateAgain.errors.join("; "));
  rmSync(hub, { recursive: true, force: true });
  rmSync(repo, { recursive: true, force: true });
});

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

console.log(`\n# duplication preflight tests ${passed + failed} pass ${passed} fail ${failed}`);
process.exit(failed > 0 ? 1 : 0);
