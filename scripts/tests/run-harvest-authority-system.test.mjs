import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { hashCanonicalJson } from "../harvest/lib/hash.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const HARVEST_ID = "harvest-2026-08-03-cross-thread-platform-state-v1";
const RUN_DIR = path.join(REPO_ROOT, "artifacts/agent-runs", HARVEST_ID);

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

execSync("node scripts/harvest/sync-derived.mjs", { cwd: REPO_ROOT, stdio: "pipe" });
execSync("node scripts/harvest/render-harvest-index.mjs", { cwd: REPO_ROOT, stdio: "pipe" });

test("harvest manifest exists and has 6 packets", () => {
  const manifest = readJson(`artifacts/agent-runs/${HARVEST_ID}/harvest-manifest-v1.json`);
  assert.equal(manifest.packets.length, 6);
  assert.equal(manifest.schemaVersion, "cross-agent-harvest-manifest-v1@1.0.0");
});

test("compact record count equals packet count", () => {
  const manifest = readJson(`artifacts/agent-runs/${HARVEST_ID}/harvest-manifest-v1.json`);
  const files = fs.readdirSync(path.join(RUN_DIR, "compact-records")).filter((f) => f.endsWith(".json"));
  assert.equal(files.length, manifest.packets.length);
});

test("registry includes all packet IDs", () => {
  const manifest = readJson(`artifacts/agent-runs/${HARVEST_ID}/harvest-manifest-v1.json`);
  const registry = readJson("work-progress/harvest-packet-registry.json");
  for (const packet of manifest.packets) {
    assert.ok(registry.packets[packet.packetId], `missing registry entry ${packet.packetId}`);
  }
});

test("INDEX generated section matches manifest packet IDs", () => {
  const manifest = readJson(`artifacts/agent-runs/${HARVEST_ID}/harvest-manifest-v1.json`);
  const index = fs.readFileSync(path.join(REPO_ROOT, "work-progress/projects/INDEX.md"), "utf8");
  assert.ok(index.includes("<!-- HARVEST-PACKET-INDEX:START -->"));
  for (const packet of manifest.packets) {
    assert.ok(index.includes(packet.packetId));
  }
});

test("forbidden key scan passes on manifest", () => {
  const manifest = JSON.stringify(readJson(`artifacts/agent-runs/${HARVEST_ID}/harvest-manifest-v1.json`));
  assert.ok(!/\"apiKey\"/i.test(manifest));
  assert.ok(!/\"password\"/i.test(manifest));
});

test("HOLD packets include doNotAdvance", () => {
  const manifest = readJson(`artifacts/agent-runs/${HARVEST_ID}/harvest-manifest-v1.json`);
  const hold = manifest.packets.find((p) => p.state === "HOLD");
  assert.ok(hold);
  assert.ok(hold.doNotAdvance.length > 0);
});

test("ownerRepo boundary exists for every packet", () => {
  const boundary = readJson("work-progress/owner-repo-boundary-index.json");
  assert.equal(boundary.packets.length, 6);
});

test("coverage score emits with gradeAfter", () => {
  const coverage = readJson(`artifacts/agent-runs/${HARVEST_ID}/coverage.json`);
  assert.ok(coverage.overallCoverageScore > 0);
  assert.ok(["A", "A+", "B"].includes(coverage.gradeAfter));
});

test("receipt links harvestManifestHash", () => {
  const manifest = readJson(`artifacts/agent-runs/${HARVEST_ID}/harvest-manifest-v1.json`);
  const receipt = readJson(`artifacts/agent-runs/${HARVEST_ID}/receipt.json`);
  const expected = hashCanonicalJson(manifest);
  assert.equal(receipt.harvestManifestHash, expected);
});

test("validate gate passes", () => {
  execSync("node scripts/harvest/validate-harvest.mjs", { cwd: REPO_ROOT, stdio: "pipe" });
  const result = readJson(`artifacts/agent-runs/${HARVEST_ID}/validation-result.json`);
  assert.equal(result.verdict, "PASS");
});

console.log(`\n# tests ${passed + failed} pass ${passed} fail ${failed}`);
process.exit(failed > 0 ? 1 : 0);
