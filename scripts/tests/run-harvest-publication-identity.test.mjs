import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildDurablePayloadInventory,
  buildPublicationIdentity,
  computeManifestHash,
  deriveLegacyPublicationIdentity,
  stripManifestForHash,
} from "../harvest/lib/publication-identity-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const FIXTURE_HARVEST_ID = "harvest-2026-08-04-three-way-improvement-slice6-thread-v1";
const FIXTURE_RUN_DIR = path.join(REPO_ROOT, "artifacts/agent-runs", FIXTURE_HARVEST_ID);

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

function readFixtureManifest() {
  return JSON.parse(fs.readFileSync(path.join(FIXTURE_RUN_DIR, "harvest-manifest-v1.json"), "utf8"));
}

function withTempHarvestDir(fn) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harvest-identity-"));
  try {
    return fn(tmp);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

test("same harvest calculated twice yields identical hashes", () => {
  const manifest = readFixtureManifest();
  const a = buildPublicationIdentity({ manifest, runDir: FIXTURE_RUN_DIR });
  const b = buildPublicationIdentity({ manifest, runDir: FIXTURE_RUN_DIR });
  assert.equal(a.manifestHash, b.manifestHash);
  assert.equal(a.payloadHash, b.payloadHash);
});

test("only timestamp changes do not alter manifestHash", () => {
  const manifest = readFixtureManifest();
  const base = computeManifestHash(manifest);
  const bumped = structuredClone(manifest);
  bumped.updatedAt = "2099-01-01T00:00:00.000Z";
  bumped.createdAt = "2099-01-01T00:00:00.000Z";
  assert.equal(base, computeManifestHash(bumped));
});

test("only receiptCommit changes do not alter manifestHash", () => {
  const manifest = readFixtureManifest();
  const base = computeManifestHash(manifest);
  const withReceipt = { ...manifest, receiptCommit: "deadbeef".repeat(5) };
  assert.equal(base, computeManifestHash(withReceipt));
});

test("projection status changes do not alter manifestHash", () => {
  const manifest = readFixtureManifest();
  const base = computeManifestHash(manifest);
  const mutated = structuredClone(manifest);
  mutated.projection = {
    projectionSyncStatus: "blocked",
    hubPublishStatus: "blocked",
    note: "volatile",
  };
  assert.equal(base, computeManifestHash(mutated));
});

test("durable packet content change alters payloadHash", () => {
  withTempHarvestDir((tmpDir) => {
    const manifest = readFixtureManifest();
    fs.mkdirSync(path.join(tmpDir, "seed-packets"), { recursive: true });
    fs.copyFileSync(
      path.join(FIXTURE_RUN_DIR, "harvest-manifest-v1.json"),
      path.join(tmpDir, "harvest-manifest-v1.json"),
    );
    const seedSrc = fs.readdirSync(path.join(FIXTURE_RUN_DIR, "seed-packets")).find((f) => f.endsWith(".json"));
    const seedContent = fs.readFileSync(path.join(FIXTURE_RUN_DIR, "seed-packets", seedSrc), "utf8");
    fs.writeFileSync(path.join(tmpDir, "seed-packets", seedSrc), seedContent);
    const before = buildPublicationIdentity({ manifest, runDir: tmpDir, options: { harvestTier: "T2" } });
    fs.writeFileSync(path.join(tmpDir, "seed-packets", seedSrc), `${seedContent}\n`);
    const after = buildPublicationIdentity({ manifest, runDir: tmpDir, options: { harvestTier: "T2" } });
    assert.notEqual(before.payloadHash, after.payloadHash);
  });
});

test("manifest authority field change alters manifestHash", () => {
  const manifest = readFixtureManifest();
  const base = computeManifestHash(manifest);
  const mutated = structuredClone(manifest);
  mutated.sourceCommitSha = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  assert.notEqual(base, computeManifestHash(mutated));
});

test("inventory builder is deterministic regardless of filesystem order", () => {
  const manifest = readFixtureManifest();
  const first = buildDurablePayloadInventory({ manifest, runDir: FIXTURE_RUN_DIR, harvestTier: "T2" });
  const second = buildDurablePayloadInventory({ manifest, runDir: FIXTURE_RUN_DIR, harvestTier: "T2" });
  assert.equal(first.payloadHash, second.payloadHash);
  assert.deepEqual(first.artifacts.map((a) => a.logicalPath), second.artifacts.map((a) => a.logicalPath));
});

test("absolute machine path normalizes to logical path for manifestHash", () => {
  const manifest = readFixtureManifest();
  const base = stripManifestForHash(manifest);
  const absolute = structuredClone(manifest);
  absolute.threadAutopsy.bundlePath = `/home/wesle/repos/CapitalGlass-Cross-Agent/artifacts/agent-runs/${FIXTURE_HARVEST_ID}/thread-autopsy-bundle.json`;
  assert.equal(computeManifestHash(manifest), computeManifestHash(absolute));
  assert.equal(
    base.threadAutopsy.bundlePath,
    "thread-autopsy-bundle.json",
  );
});

test("missing required durable file fails closed", () => {
  withTempHarvestDir((tmpDir) => {
    const manifest = readFixtureManifest();
    fs.writeFileSync(path.join(tmpDir, "harvest-manifest-v1.json"), JSON.stringify(manifest, null, 2));
    assert.throws(
      () => buildDurablePayloadInventory({ manifest, runDir: tmpDir, harvestTier: "T2" }),
      (error) => error.message.startsWith("MISSING_DURABLE_ARTIFACT:"),
    );
  });
});

test("legacy manifest derives compatible identity without writing", () => {
  const manifest = readFixtureManifest();
  const derived = deriveLegacyPublicationIdentity({ manifest, runDir: FIXTURE_RUN_DIR });
  assert.equal(derived.status, "LEGACY_IDENTITY_DERIVED");
  assert.ok(derived.identity.manifestHash.startsWith("sha256:"));
  assert.ok(derived.identity.payloadHash.startsWith("sha256:"));
  assert.ok(derived.warnings.includes("NO_SUPERSESSION_LINEAGE_DECLARED"));
  assert.equal(derived.identity.authoritySourceCommit, manifest.sourceCommitSha);
});

console.log(`\n# publication-identity: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
}
