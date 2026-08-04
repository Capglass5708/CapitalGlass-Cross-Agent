import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  bundleLayout,
  COMPLETE_MARKER_FILENAME,
  isBundlePublicationComplete,
  publishLDurableBundle,
  readPublishedBundle,
  reconstructPayloadToDir,
  stageLDurableBundle,
} from "../harvest/lib/l-durable-bundle-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const FIXTURE_ID = "harvest-wave2-l-durable-fixture-v1";
const FIXTURE_SOURCE = path.join(
  REPO_ROOT,
  "scripts/tests/fixtures/harvest-l-durable-publisher-v1/source",
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

function withTempHub(fn) {
  const hubRoot = fs.mkdtempSync(path.join(os.tmpdir(), "harvest-l-hub-"));
  try {
    return fn(hubRoot);
  } finally {
    fs.rmSync(hubRoot, { recursive: true, force: true });
  }
}

function stageAndPublish(hubRoot, options = {}) {
  const staged = stageLDurableBundle({
    hubRoot,
    sourceRunDir: FIXTURE_SOURCE,
    harvestId: FIXTURE_ID,
    options,
  });
  const receipt = publishLDurableBundle({
    hubRoot,
    harvestId: FIXTURE_ID,
    payloadHash: staged.payloadHash,
  });
  return { staged, receipt };
}

test("complete reconstruction from published L bundle", () => {
  withTempHub((hubRoot) => {
    const { staged } = stageAndPublish(hubRoot);
    const published = readPublishedBundle(hubRoot, FIXTURE_ID);
    assert.ok(published);
    const reconDir = path.join(hubRoot, "_recon");
    reconstructPayloadToDir(published.layout.catalogRoot, reconDir);
    for (const artifact of staged.inventory.artifacts) {
      const src = path.join(FIXTURE_SOURCE, artifact.logicalPath);
      const dest = path.join(reconDir, artifact.logicalPath);
      assert.ok(fs.existsSync(dest), `missing ${artifact.logicalPath}`);
      assert.equal(fs.readFileSync(src, "utf8"), fs.readFileSync(dest, "utf8"));
    }
  });
});

test("deterministic repeat publish returns NOOP_CURRENT on second run", () => {
  withTempHub((hubRoot) => {
    const first = stageAndPublish(hubRoot);
    assert.equal(first.receipt.verdict, "L_DURABLE_PUBLISH_PASS");
    const secondStage = stageLDurableBundle({
      hubRoot,
      sourceRunDir: FIXTURE_SOURCE,
      harvestId: FIXTURE_ID,
    });
    const second = publishLDurableBundle({
      hubRoot,
      harvestId: FIXTURE_ID,
      payloadHash: secondStage.payloadHash,
    });
    assert.equal(second.verdict, "NOOP_CURRENT");
    assert.equal(first.staged.payloadHash, secondStage.payloadHash);
  });
});

test("hash mismatch after staging blocks publication", () => {
  withTempHub((hubRoot) => {
    const staged = stageLDurableBundle({
      hubRoot,
      sourceRunDir: FIXTURE_SOURCE,
      harvestId: FIXTURE_ID,
    });
    const tamperPath = path.join(
      staged.stagingRoot,
      "payload",
      "thread-autopsy-bundle.json",
    );
    fs.appendFileSync(tamperPath, "\n");
    assert.throws(
      () =>
        publishLDurableBundle({
          hubRoot,
          harvestId: FIXTURE_ID,
          payloadHash: staged.payloadHash,
        }),
      /BLOCKED_L_DURABLE_HASH_MISMATCH/,
    );
  });
});

test("incomplete catalog directory is not treated as published", () => {
  withTempHub((hubRoot) => {
    const staged = stageLDurableBundle({
      hubRoot,
      sourceRunDir: FIXTURE_SOURCE,
      harvestId: FIXTURE_ID,
    });
    const layout = bundleLayout(hubRoot, FIXTURE_ID, staged.payloadHash);
    fs.mkdirSync(layout.payloadCatalog, { recursive: true });
    fs.writeFileSync(path.join(layout.catalogRoot, "partial.txt"), "incomplete\n");
    assert.equal(isBundlePublicationComplete(layout.catalogRoot), false);
    assert.equal(readPublishedBundle(hubRoot, FIXTURE_ID), null);
    assert.throws(
      () =>
        publishLDurableBundle({
          hubRoot,
          harvestId: FIXTURE_ID,
          payloadHash: staged.payloadHash,
        }),
      /INCOMPLETE_CATALOG_BUNDLE/,
    );
  });
});

test("conflict without supersession blocks changed payload", () => {
  withTempHub((hubRoot) => {
    const first = stageAndPublish(hubRoot);
    const mutatedSource = path.join(hubRoot, "mutated-source");
    fs.cpSync(FIXTURE_SOURCE, mutatedSource, { recursive: true });
    fs.appendFileSync(
      path.join(mutatedSource, "thread-autopsy-bundle.json"),
      "\n",
    );
    const secondStage = stageLDurableBundle({
      hubRoot,
      sourceRunDir: mutatedSource,
      harvestId: FIXTURE_ID,
    });
    assert.notEqual(first.staged.payloadHash, secondStage.payloadHash);
    assert.throws(
      () =>
        publishLDurableBundle({
          hubRoot,
          harvestId: FIXTURE_ID,
          payloadHash: secondStage.payloadHash,
        }),
      /BLOCKED_AUTHORITY_CONFLICT/,
    );
  });
});

test("valid supersession preserves historical bundle and advances pointer", () => {
  withTempHub((hubRoot) => {
    const first = stageAndPublish(hubRoot);
    const mutatedSource = path.join(hubRoot, "mutated-source");
    fs.cpSync(FIXTURE_SOURCE, mutatedSource, { recursive: true });
    fs.appendFileSync(
      path.join(mutatedSource, "thread-autopsy-bundle.json"),
      "\n",
    );
    const secondStage = stageLDurableBundle({
      hubRoot,
      sourceRunDir: mutatedSource,
      harvestId: FIXTURE_ID,
      options: {
        supersedes: [
          {
            id: FIXTURE_ID,
            priorHash: first.staged.payloadHash,
            reason: "fixture supersession",
          },
        ],
      },
    });
    const second = publishLDurableBundle({
      hubRoot,
      harvestId: FIXTURE_ID,
      payloadHash: secondStage.payloadHash,
    });
    assert.equal(second.verdict, "L_DURABLE_PUBLISH_PASS");
    const pointer = readPublishedBundle(hubRoot, FIXTURE_ID);
    assert.equal(pointer.pointer.currentPayloadHash, secondStage.payloadHash);
    const firstLayout = bundleLayout(hubRoot, FIXTURE_ID, first.staged.payloadHash);
    const secondLayout = bundleLayout(hubRoot, FIXTURE_ID, secondStage.payloadHash);
    assert.ok(isBundlePublicationComplete(firstLayout.catalogRoot));
    assert.ok(isBundlePublicationComplete(secondLayout.catalogRoot));
  });
});

test("git porcelain unchanged after publish-l-durable", () => {
  const before = execSync("git status --porcelain", { cwd: REPO_ROOT, encoding: "utf8" });
  withTempHub((hubRoot) => {
    stageAndPublish(hubRoot);
  });
  const after = execSync("git status --porcelain", { cwd: REPO_ROOT, encoding: "utf8" });
  assert.equal(before, after);
});

if (process.env.RUN_L_MOUNT_SMOKE === "1" && fs.existsSync("/mnt/l/Capital-Glass-Intelligence-Hub")) {
  test("mounted L: directory rename promotion smoke", () => {
    const hubRoot = "/mnt/l/Capital-Glass-Intelligence-Hub";
    const smokeId = "harvest-wave2-l-durable-smoke-v1";
    const tmpSource = fs.mkdtempSync(path.join(os.tmpdir(), "harvest-l-smoke-src-"));
    fs.cpSync(FIXTURE_SOURCE, tmpSource, { recursive: true });
    const manifestPath = path.join(tmpSource, "harvest-manifest-v1.json");
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    manifest.harvestId = smokeId;
    fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    let payloadHash = null;
    try {
      const staged = stageLDurableBundle({
        hubRoot,
        sourceRunDir: tmpSource,
        harvestId: smokeId,
      });
      payloadHash = staged.payloadHash;
      const receipt = publishLDurableBundle({
        hubRoot,
        harvestId: smokeId,
        payloadHash: staged.payloadHash,
      });
      assert.ok(["L_DURABLE_PUBLISH_PASS", "NOOP_CURRENT"].includes(receipt.verdict));
      const layout = bundleLayout(hubRoot, smokeId, staged.payloadHash);
      assert.ok(fs.existsSync(path.join(layout.catalogRoot, COMPLETE_MARKER_FILENAME)));
      assert.ok(["DIRECTORY_RENAME", "COPY_THEN_COMPLETE_MARKER"].includes(receipt.publicationMethod));
    } finally {
      fs.rmSync(tmpSource, { recursive: true, force: true });
      if (payloadHash) {
        const layout = bundleLayout(hubRoot, smokeId, payloadHash);
        fs.rmSync(layout.stagingRoot, { recursive: true, force: true });
        fs.rmSync(layout.catalogRoot, { recursive: true, force: true });
        fs.rmSync(path.dirname(layout.operationsReceipt), { recursive: true, force: true });
      }
      fs.rmSync(path.join(hubRoot, "00-master-index", "BY-HARVEST", `${smokeId}.json`), {
        force: true,
      });
    }
  });
}

console.log(`\n# harvest-l-durable: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
}
