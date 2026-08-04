#!/usr/bin/env node
/**
 * ChatGPT findings ingest — markdown → harvest run dir artifacts.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const FIXTURE_MD = path.join(
  REPO_ROOT,
  "scripts/tests/fixtures/chatgpt-findings-minimal-v1/findings.md",
);
const HARVEST_ID = "harvest-2026-08-04-chatgpt-ingest-test-fixture-v1";
const RUN_DIR = path.join(REPO_ROOT, "artifacts/agent-runs", HARVEST_ID);
const REGISTRY_PATH = path.join(REPO_ROOT, "work-progress/harvest-packet-registry.json");
const BOUNDARY_PATH = path.join(REPO_ROOT, "work-progress/owner-repo-boundary-index.json");

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

function backupFile(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : null;
}

function restoreFile(filePath, backup) {
  if (backup === null) {
    if (fs.existsSync(filePath)) fs.rmSync(filePath);
    return;
  }
  fs.writeFileSync(filePath, backup, "utf8");
}

test("ingest creates manifest, bundle, seeds, and INGEST_PASS receipt", () => {
  const registryBackup = backupFile(REGISTRY_PATH);
  const boundaryBackup = backupFile(BOUNDARY_PATH);
  try {
    if (fs.existsSync(RUN_DIR)) fs.rmSync(RUN_DIR, { recursive: true, force: true });

    execFileSync(
      "node",
      [
        path.join(REPO_ROOT, "scripts/harvest/ingest-chatgpt-findings.mjs"),
        `--input=${FIXTURE_MD}`,
        `--harvest-id=${HARVEST_ID}`,
        "--json",
      ],
      { cwd: REPO_ROOT, stdio: "pipe" },
    );

    assert.ok(fs.existsSync(path.join(RUN_DIR, "harvest-manifest-v1.json")));
    assert.ok(fs.existsSync(path.join(RUN_DIR, "thread-autopsy-bundle.json")));
    assert.ok(fs.existsSync(path.join(RUN_DIR, "seed-packets/IH-THREAD-INGEST-TEST-001.json")));

    const receipt = JSON.parse(
      fs.readFileSync(path.join(RUN_DIR, "chatgpt-ingest-receipt.json"), "utf8"),
    );
    assert.equal(receipt.verdict, "INGEST_PASS");
    assert.equal(receipt.seedCount, 1);

    const manifest = JSON.parse(
      fs.readFileSync(path.join(RUN_DIR, "harvest-manifest-v1.json"), "utf8"),
    );
    assert.equal(manifest.chatgptIngest.protocol, "chat-thread-closeout-autopsy-harvest-chatgpt-v1");
    assert.equal(manifest.chatgptIngest.authorityClass, "non-authoritative");
    assert.equal(manifest.overallHarvestVerdict, "HARVEST_VALIDATION_PENDING");

    const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
    const packetId = HARVEST_ID.replace(/^harvest-/, "");
    assert.ok(registry.packets[packetId]);
    assert.equal(registry.packets[packetId].latestHarvestId, HARVEST_ID);
  } finally {
    restoreFile(REGISTRY_PATH, registryBackup);
    restoreFile(BOUNDARY_PATH, boundaryBackup);
    if (fs.existsSync(RUN_DIR)) fs.rmSync(RUN_DIR, { recursive: true, force: true });
  }
});

test("ingest fails when input markdown is missing", () => {
  assert.throws(
    () => {
      execFileSync(
        "node",
        [
          path.join(REPO_ROOT, "scripts/harvest/ingest-chatgpt-findings.mjs"),
          "--input=/tmp/nonexistent-chatgpt-findings.md",
          `--harvest-id=${HARVEST_ID}`,
        ],
        { cwd: REPO_ROOT, stdio: "pipe" },
      );
    },
    (err) => err.status !== 0,
  );
});

console.log(`\n# chatgpt-findings-ingest: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
