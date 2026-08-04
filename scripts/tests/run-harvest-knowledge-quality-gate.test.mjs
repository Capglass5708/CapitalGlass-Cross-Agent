#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import {
  QUALITY_EVIDENCE_FILENAME,
  QUALITY_RECEIPT_FILENAME,
  validateKnowledgeQuality,
  writeKnowledgeQualityReceipt,
} from "../harvest/lib/knowledge-quality-gate-lib.mjs";
import { stageLDurableBundle } from "../harvest/lib/l-durable-bundle-lib.mjs";
import {
  buildPublicationIdentity,
  computePayloadHash,
} from "../harvest/lib/publication-identity-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const PASS_FIXTURE = path.join(REPO_ROOT, "scripts/tests/fixtures/harvest-knowledge-quality-pass-v1/source");
const SYNTHETIC_FIXTURE = path.join(REPO_ROOT, "scripts/tests/fixtures/harvest-l-durable-publisher-v1/source");

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
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "harvest-quality-"));
  fs.cpSync(sourceDir, tempDir, { recursive: true });
  return tempDir;
}

function gitPorcelain() {
  return execFileSync("git", ["-C", REPO_ROOT, "status", "--porcelain"], { encoding: "utf8" });
}

test("complete fixture passes knowledge quality gate", () => {
  const runDir = copyFixtureToTemp(PASS_FIXTURE);
  const manifest = readJson(path.join(runDir, "harvest-manifest-v1.json"));
  const receipt = validateKnowledgeQuality({ manifest, runDir });
  assert.equal(receipt.knowledgeVerdict, "KNOWLEDGE_QUALITY_PASS");
  assert.equal(receipt.publicationEligibility, "DURABLE_PUBLICATION_READY");
});

test("missing material event holds", () => {
  const runDir = copyFixtureToTemp(PASS_FIXTURE);
  const inventory = readJson(path.join(runDir, "thread-event-inventory.json"));
  inventory.events.push({
    id: "EVT-003",
    summary: "uncovered material thread event",
    evidenceRefs: ["turn-3"],
  });
  fs.writeFileSync(
    path.join(runDir, "thread-event-inventory.json"),
    `${JSON.stringify(inventory, null, 2)}\n`,
  );
  const manifest = readJson(path.join(runDir, "harvest-manifest-v1.json"));
  const receipt = validateKnowledgeQuality({ manifest, runDir });
  assert.equal(receipt.knowledgeVerdict, "THREAD_COVERAGE_HOLD");
});

test("decision without reasoning holds", () => {
  const runDir = copyFixtureToTemp(PASS_FIXTURE);
  const evidence = readJson(path.join(runDir, QUALITY_EVIDENCE_FILENAME));
  delete evidence.decisions[0].reason;
  fs.writeFileSync(path.join(runDir, QUALITY_EVIDENCE_FILENAME), `${JSON.stringify(evidence, null, 2)}\n`);
  const manifest = readJson(path.join(runDir, "harvest-manifest-v1.json"));
  const receipt = validateKnowledgeQuality({ manifest, runDir });
  assert.equal(receipt.knowledgeVerdict, "DECISION_INTEGRITY_HOLD");
});

test("omitted operator correction holds when correction incomplete", () => {
  const runDir = copyFixtureToTemp(PASS_FIXTURE);
  const evidence = readJson(path.join(runDir, QUALITY_EVIDENCE_FILENAME));
  delete evidence.corrections[0].futureAgentRule;
  fs.writeFileSync(path.join(runDir, QUALITY_EVIDENCE_FILENAME), `${JSON.stringify(evidence, null, 2)}\n`);
  const manifest = readJson(path.join(runDir, "harvest-manifest-v1.json"));
  const receipt = validateKnowledgeQuality({ manifest, runDir });
  assert.equal(receipt.knowledgeVerdict, "USER_CORRECTION_MISSING");
});

test("unsupported durable claim holds", () => {
  const runDir = copyFixtureToTemp(PASS_FIXTURE);
  const evidence = readJson(path.join(runDir, QUALITY_EVIDENCE_FILENAME));
  evidence.durableClaims.push({
    id: "CLM-BAD",
    claim: "Unverified promoted claim",
    confidence: "VERIFIED",
    evidenceRefs: [],
    eventRefs: ["EVT-001"],
  });
  fs.writeFileSync(path.join(runDir, QUALITY_EVIDENCE_FILENAME), `${JSON.stringify(evidence, null, 2)}\n`);
  const manifest = readJson(path.join(runDir, "harvest-manifest-v1.json"));
  const receipt = validateKnowledgeQuality({ manifest, runDir });
  assert.equal(receipt.knowledgeVerdict, "EVIDENCE_COVERAGE_HOLD");
});

test("unresolved contradiction holds", () => {
  const runDir = copyFixtureToTemp(PASS_FIXTURE);
  const evidence = readJson(path.join(runDir, QUALITY_EVIDENCE_FILENAME));
  evidence.contradictions = [
    {
      id: "CON-001",
      claims: [
        { source: "agent-a", claim: "L is optional" },
        { source: "agent-b", claim: "L is required" },
      ],
      resolved: false,
    },
  ];
  fs.writeFileSync(path.join(runDir, QUALITY_EVIDENCE_FILENAME), `${JSON.stringify(evidence, null, 2)}\n`);
  const manifest = readJson(path.join(runDir, "harvest-manifest-v1.json"));
  const receipt = validateKnowledgeQuality({ manifest, runDir });
  assert.notEqual(receipt.knowledgeVerdict, "KNOWLEDGE_QUALITY_PASS");
});

test("weak seed holds", () => {
  const runDir = copyFixtureToTemp(PASS_FIXTURE);
  const seedPath = path.join(runDir, "seed-packets/IH-QUALITY-PASS-SEED-A.json");
  const seed = readJson(seedPath);
  delete seed.futureAgentInstructions.proveBeforeClaiming;
  fs.writeFileSync(seedPath, `${JSON.stringify(seed, null, 2)}\n`);
  const manifest = readJson(path.join(runDir, "harvest-manifest-v1.json"));
  const receipt = validateKnowledgeQuality({ manifest, runDir });
  assert.equal(receipt.knowledgeVerdict, "SEED_QUALITY_HOLD");
});

test("generic retrieval test holds", () => {
  const runDir = copyFixtureToTemp(PASS_FIXTURE);
  const evidence = readJson(path.join(runDir, QUALITY_EVIDENCE_FILENAME));
  evidence.blindRetrieval = [
    {
      question: "How does harvest publication work?",
      expectedSeedId: "IH-QUALITY-PASS-SEED-A",
      genericKeywordOnly: true,
    },
  ];
  fs.writeFileSync(path.join(runDir, QUALITY_EVIDENCE_FILENAME), `${JSON.stringify(evidence, null, 2)}\n`);
  const manifest = readJson(path.join(runDir, "harvest-manifest-v1.json"));
  const receipt = validateKnowledgeQuality({ manifest, runDir });
  assert.equal(receipt.knowledgeVerdict, "RETRIEVAL_QUALITY_HOLD");
});

test("human review requirement holds", () => {
  const runDir = copyFixtureToTemp(PASS_FIXTURE);
  const evidence = readJson(path.join(runDir, QUALITY_EVIDENCE_FILENAME));
  evidence.humanReview = { required: false, reasons: ["authority_model_change"] };
  fs.writeFileSync(path.join(runDir, QUALITY_EVIDENCE_FILENAME), `${JSON.stringify(evidence, null, 2)}\n`);
  const manifest = readJson(path.join(runDir, "harvest-manifest-v1.json"));
  const receipt = validateKnowledgeQuality({ manifest, runDir });
  assert.equal(receipt.knowledgeVerdict, "HUMAN_REVIEW_REQUIRED");
});

test("Phase A rejects missing receipt", () => {
  const runDir = copyFixtureToTemp(PASS_FIXTURE);
  const hubRoot = fs.mkdtempSync(path.join(os.tmpdir(), "harvest-quality-hub-"));
  try {
    assert.throws(
      () =>
        stageLDurableBundle({
          hubRoot,
          sourceRunDir: runDir,
          harvestId: "harvest-knowledge-quality-pass-v1",
        }),
      /BLOCKED_KNOWLEDGE_QUALITY:missing_receipt/,
    );
  } finally {
    fs.rmSync(hubRoot, { recursive: true, force: true });
  }
});

test("synthetic fixture is allowed without quality receipt", () => {
  const hubRoot = fs.mkdtempSync(path.join(os.tmpdir(), "harvest-quality-synth-"));
  try {
    const result = stageLDurableBundle({
      hubRoot,
      sourceRunDir: SYNTHETIC_FIXTURE,
      harvestId: "harvest-wave2-l-durable-fixture-v1",
    });
    assert.equal(result.verdict, "L_STAGING_PASS");
  } finally {
    fs.rmSync(hubRoot, { recursive: true, force: true });
  }
});

test("quality receipt in payload hash changes when receipt body changes", () => {
  const runDir = copyFixtureToTemp(PASS_FIXTURE);
  const manifest = readJson(path.join(runDir, "harvest-manifest-v1.json"));
  const receipt = validateKnowledgeQuality({ manifest, runDir });
  writeKnowledgeQualityReceipt(runDir, receipt);

  const before = buildPublicationIdentity({ manifest, runDir });
  const mutatedReceipt = { ...receipt, threadCoverage: { ...receipt.threadCoverage, coveredEvents: 99 } };
  writeKnowledgeQualityReceipt(runDir, mutatedReceipt);
  const after = buildPublicationIdentity({ manifest, runDir });
  assert.notEqual(before.payloadHash, after.payloadHash);
});

test("Phase A passes with valid quality receipt", () => {
  const runDir = copyFixtureToTemp(PASS_FIXTURE);
  const manifest = readJson(path.join(runDir, "harvest-manifest-v1.json"));
  const receipt = validateKnowledgeQuality({ manifest, runDir });
  writeKnowledgeQualityReceipt(runDir, receipt);
  const hubRoot = fs.mkdtempSync(path.join(os.tmpdir(), "harvest-quality-hub-pass-"));
  try {
    const staged = stageLDurableBundle({
      hubRoot,
      sourceRunDir: runDir,
      harvestId: manifest.harvestId,
    });
    assert.equal(staged.verdict, "L_STAGING_PASS");
    assert.ok(
      staged.inventory.artifacts.some(
        (artifact) => artifact.logicalPath === QUALITY_RECEIPT_FILENAME,
      ),
    );
  } finally {
    fs.rmSync(hubRoot, { recursive: true, force: true });
  }
});

test("git porcelain unchanged during validation", () => {
  const before = gitPorcelain();
  const runDir = copyFixtureToTemp(PASS_FIXTURE);
  const manifest = readJson(path.join(runDir, "harvest-manifest-v1.json"));
  validateKnowledgeQuality({ manifest, runDir });
  assert.equal(gitPorcelain(), before);
});

console.log(`\n# harvest-knowledge-quality: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
}
