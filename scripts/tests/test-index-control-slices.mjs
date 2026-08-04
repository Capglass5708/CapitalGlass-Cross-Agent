import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const SLICES_DIR = path.join(REPO_ROOT, "work-progress/intelligence-hub-slices");

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(REPO_ROOT, rel), "utf8"));
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

execSync("node scripts/index/compile-control-slices.mjs", { cwd: REPO_ROOT, stdio: "pipe" });

test("compile produces core slice files", () => {
  const required = [
    "current-state.json",
    "blockers.json",
    "commands.json",
    "receipts.json",
    "owner-boundaries.json",
    "do-not-advance.json",
    "host-authority.json",
    "work-package-registry.json",
    "freshness-dashboard.json",
  ];
  for (const file of required) {
    assert.ok(fs.existsSync(path.join(SLICES_DIR, file)), `missing ${file}`);
  }
});

test("blockers slice has open critical blocker for slice6", () => {
  const blockers = readJson("work-progress/intelligence-hub-slices/blockers.json");
  const slice6 = blockers.blockers.find((b) => b.blockerId === "slice6-post-merge-publication");
  assert.ok(slice6);
  assert.equal(slice6.severity, "critical");
  assert.ok(slice6.commandIds.includes("index-freshness-gate"));
});

test("commands slice includes provesGate on freshness gate", () => {
  const commands = readJson("work-progress/intelligence-hub-slices/commands.json");
  const gate = commands.commands.find((c) => c.id === "index-freshness-gate");
  assert.ok(gate);
  assert.equal(gate.provesGate, "INDEX_LAYER_PARITY");
});

test("do-not-advance slice preserves THREE_WAY claim block", () => {
  const dna = readJson("work-progress/intelligence-hub-slices/do-not-advance.json");
  const entry = dna.entries.find((e) => e.claimId === "THREE_WAY_IMPROVEMENT_INTELLIGENCE_OPERATIONAL");
  assert.ok(entry);
  assert.ok(entry.proofCommandIds.length > 0);
});

test("domain packs exist for direct-connect and three-way", () => {
  assert.ok(fs.existsSync(path.join(SLICES_DIR, "domains/direct-connect.json")));
  assert.ok(fs.existsSync(path.join(SLICES_DIR, "domains/three-way-improvement.json")));
});

test("compile receipt written", () => {
  const receipt = readJson(
    "artifacts/agent-runs/intelligence-hub-capability-expansion-v1/compile-receipt-v1.json"
  );
  assert.ok(receipt.sliceCount >= 9);
  assert.equal(receipt.workPackageId, "intelligence-hub-capability-expansion-v1");
});

test("authority sources exist", () => {
  assert.ok(fs.existsSync(path.join(REPO_ROOT, "work-progress/blocker-to-action-map.json")));
  assert.ok(fs.existsSync(path.join(REPO_ROOT, "work-progress/do-not-advance-registry.json")));
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
