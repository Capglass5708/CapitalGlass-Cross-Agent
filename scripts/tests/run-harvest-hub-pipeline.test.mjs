#!/usr/bin/env node
/**
 * Intelligence Hub seed publication pipeline — compile + publishHubSeed to temp L: root.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { compileSeedPackets } from "../harvest/lib/compile-seed-packets-lib.mjs";
import { publishHubSeed } from "../harvest/lib/publish-hub-seed-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const FIXTURE_SOURCE = path.join(
  REPO_ROOT,
  "scripts/tests/fixtures/harvest-knowledge-quality-pass-v1/source",
);

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

function mkHubRoot() {
  const hubRoot = fs.mkdtempSync(path.join(os.tmpdir(), "hub-pipeline-"));
  fs.mkdirSync(path.join(hubRoot, "00-master-index/BY-KIND"), { recursive: true });
  return hubRoot;
}

function mkRepoWithFixture(harvestId) {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "hub-pipeline-repo-"));
  const runDir = path.join(repo, "artifacts/agent-runs", harvestId);
  fs.cpSync(FIXTURE_SOURCE, runDir, { recursive: true });
  const manifestPath = path.join(runDir, "harvest-manifest-v1.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  manifest.harvestId = harvestId;
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  const bundlePath = path.join(runDir, "thread-autopsy-bundle.json");
  if (fs.existsSync(bundlePath)) {
    const bundle = JSON.parse(fs.readFileSync(bundlePath, "utf8"));
    bundle.harvestId = harvestId;
    fs.writeFileSync(bundlePath, `${JSON.stringify(bundle, null, 2)}\n`, "utf8");
  }
  return { repo, runDir };
}

test("compileSeedPackets produces qa-index and catalog stubs", () => {
  const harvestId = "harvest-hub-pipeline-compile-v1";
  const { repo } = mkRepoWithFixture(harvestId);
  try {
    const compile = compileSeedPackets({
      repoRoot: repo,
      harvestId,
      gitHead: "abc0000000000000000000000000000000000001",
    });
    assert.equal(compile.ok, true);
    assert.equal(compile.seedCount, 2);
    assert.ok(fs.existsSync(compile.outputs.qaIndexPath));
    assert.ok(fs.existsSync(compile.outputs.catalogStubsDir));
  } finally {
    fs.rmSync(repo, { recursive: true, force: true });
  }
});

test("publishHubSeed writes catalog objects and thread-autopsy index slice", () => {
  const hubRoot = mkHubRoot();
  const harvestId = "harvest-hub-pipeline-publish-v1";
  const { repo } = mkRepoWithFixture(harvestId);
  const gitHead = "abc0000000000000000000000000000000000002";
  try {
    const compile = compileSeedPackets({ repoRoot: repo, harvestId, gitHead });
    assert.equal(compile.ok, true);

    const publish = publishHubSeed({
      repoRoot: repo,
      harvestId,
      gitHead,
      hubRoot,
    });
    assert.equal(publish.ok, true);
    assert.equal(publish.publishedIds.length, 2);

    const catalogDir = path.join(hubRoot, "02-catalog/knowledge-objects/cross-agent-harvest");
    for (const seedId of publish.publishedIds) {
      assert.ok(fs.existsSync(path.join(catalogDir, `${seedId}.json`)));
    }

    const indexPath = path.join(hubRoot, "00-master-index/BY-KIND/thread-autopsy-index.json");
    assert.ok(fs.existsSync(indexPath));
    const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
    assert.ok(index.harvests.some((h) => h.harvestId === harvestId));

    const runReceipt = path.join(repo, "artifacts/agent-runs", harvestId, "hub-publication-receipt.json");
    assert.ok(fs.existsSync(runReceipt));
    const receipt = JSON.parse(fs.readFileSync(runReceipt, "utf8"));
    assert.equal(receipt.verdict, "PUBLISH_PASS");
  } finally {
    fs.rmSync(hubRoot, { recursive: true, force: true });
    fs.rmSync(repo, { recursive: true, force: true });
  }
});

test("publishHubSeed is idempotent on second publish", () => {
  const hubRoot = mkHubRoot();
  const harvestId = "harvest-hub-pipeline-noop-v1";
  const { repo } = mkRepoWithFixture(harvestId);
  const gitHead = "abc0000000000000000000000000000000000003";
  try {
    compileSeedPackets({ repoRoot: repo, harvestId, gitHead });
    const first = publishHubSeed({ repoRoot: repo, harvestId, gitHead, hubRoot });
    const second = publishHubSeed({ repoRoot: repo, harvestId, gitHead, hubRoot });
    assert.equal(first.ok, true);
    assert.equal(second.ok, true);
    assert.equal(second.counts.inserted, 0);
    assert.ok(second.counts.unchanged >= 1 || second.counts.updated === 0);
  } finally {
    fs.rmSync(hubRoot, { recursive: true, force: true });
    fs.rmSync(repo, { recursive: true, force: true });
  }
});

console.log(`\n# harvest-hub-pipeline: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
