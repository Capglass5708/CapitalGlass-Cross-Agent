import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execSync, execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import {
  bundleLayout,
  publishLDurableBundle,
  stageLDurableBundle,
} from "../harvest/lib/l-durable-bundle-lib.mjs";
import {
  buildCompactProjectionInput,
  applySupabaseProjection,
  PROJECTION_INPUT_FILENAME,
} from "../harvest/lib/supabase-projection-adapter-lib.mjs";
import {
  createDefaultLDurablePublisher,
  createDefaultLayerVerifier,
  createDefaultOperationWriter,
  createDefaultSupabaseProjector,
  createDefaultZPublisher,
  readDurablePublicationContext,
  runPhaseBPublication,
} from "../harvest/lib/phase-b-publication-orchestrator-lib.mjs";
import { PHASE_B_VERDICTS } from "../harvest/lib/publication-layer-verdict-lib.mjs";
import { resolveAppBuilderRoot } from "../index/lib/resolve-repo-roots.mjs";

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
  const hubRoot = fs.mkdtempSync(path.join(os.tmpdir(), "harvest-sb-hub-"));
  const zCacheRoot = fs.mkdtempSync(path.join(os.tmpdir(), "harvest-sb-z-"));
  try {
    return fn(hubRoot, zCacheRoot);
  } finally {
    fs.rmSync(hubRoot, { recursive: true, force: true });
    fs.rmSync(zCacheRoot, { recursive: true, force: true });
  }
}

function gitPorcelain(repoRoot) {
  return execFileSync("git", ["-C", repoRoot, "status", "--porcelain"], { encoding: "utf8" });
}

function stageAndPublish(hubRoot) {
  const staged = stageLDurableBundle({
    hubRoot,
    sourceRunDir: FIXTURE_SOURCE,
    harvestId: FIXTURE_ID,
  });
  publishLDurableBundle({
    hubRoot,
    harvestId: FIXTURE_ID,
    payloadHash: staged.payloadHash,
  });
  return staged;
}

test("compact projection input is built from L durable bundle only", () => {
  withTempHub((hubRoot) => {
    const staged = stageAndPublish(hubRoot);
    const context = readDurablePublicationContext(hubRoot, FIXTURE_ID, staged.payloadHash);
    const input = buildCompactProjectionInput(hubRoot, context);
    assert.equal(input.harvestId, FIXTURE_ID);
    assert.ok(input.packetIds.length >= 2);
    assert.ok(input.seedIds.length >= 2);
    assert.equal(input.compactSummary.threadAutopsyBundle, undefined);
    const serialized = JSON.stringify(input);
    assert.equal(serialized.includes("threadAutopsyBundle"), false);
    assert.equal(serialized.includes("seedPackets"), false);
  });
});

test("phase B live projection reaches IN_SYNC via AppBuilder projector", () => {
  withTempHub((hubRoot, zCacheRoot) => {
    const appBuilderRoot = resolveAppBuilderRoot(REPO_ROOT);
    assert.ok(fs.existsSync(path.join(appBuilderRoot, "scripts/cross-agent-harvest-projection/project-harvest-snapshot.mjs")));
    const staged = stageAndPublish(hubRoot);
    const result = runPhaseBPublication({
      hubRoot,
      harvestId: FIXTURE_ID,
      payloadHash: staged.payloadHash,
      lDurablePublisher: createDefaultLDurablePublisher(),
      zPublisher: createDefaultZPublisher({ zCacheRoot }),
      supabaseProjector: createDefaultSupabaseProjector({ hubRoot, appBuilderRoot, useMemoryStore: true }),
      layerVerifier: createDefaultLayerVerifier(),
      operationWriter: createDefaultOperationWriter(),
    });
    assert.equal(result.phaseBVerdict, PHASE_B_VERDICTS.COMPLETE);
    assert.equal(result.layers.supabaseProjection.status, "IN_SYNC");
    const opsInput = path.join(
      hubRoot,
      "00-master-index/_operations/harvest-publication",
      FIXTURE_ID,
      staged.payloadHash.replace(/^sha256:/, ""),
      PROJECTION_INPUT_FILENAME,
    );
    assert.ok(fs.existsSync(opsInput));
  });
});

test("database outage leaves L durable and Phase B degraded", () => {
  withTempHub((hubRoot, zCacheRoot) => {
    const staged = stageAndPublish(hubRoot);
    const result = runPhaseBPublication({
      hubRoot,
      harvestId: FIXTURE_ID,
      payloadHash: staged.payloadHash,
      lDurablePublisher: createDefaultLDurablePublisher(),
      zPublisher: createDefaultZPublisher({ zCacheRoot }),
      supabaseProjector: () => ({
        ok: false,
        status: "FAILED_REQUIRED",
        verdict: "SUPABASE_PROJECTION_FAIL",
        error: "simulated outage",
      }),
      layerVerifier: createDefaultLayerVerifier(),
      operationWriter: createDefaultOperationWriter(),
    });
    assert.ok(["CURRENT", "NOOP_CURRENT"].includes(result.layers.lDurable.status));
    assert.equal(result.layers.supabaseProjection.status, "FAILED_REQUIRED");
    assert.equal(result.phaseBVerdict, PHASE_B_VERDICTS.DEGRADED);
    const layout = bundleLayout(hubRoot, FIXTURE_ID, staged.payloadHash);
    assert.ok(fs.existsSync(path.join(layout.catalogRoot, "PUBLICATION_COMPLETE.json")));
  });
});

test("retry after outage completes with NOOP layers", () => {
  withTempHub((hubRoot, zCacheRoot) => {
    const appBuilderRoot = resolveAppBuilderRoot(REPO_ROOT);
    const staged = stageAndPublish(hubRoot);
    let attempts = 0;
    const flaky = (context) => {
      attempts += 1;
      if (attempts === 1) {
        return {
          ok: false,
          status: "FAILED_REQUIRED",
          verdict: "SUPABASE_PROJECTION_FAIL",
        };
      }
      return createDefaultSupabaseProjector({ hubRoot, appBuilderRoot, useMemoryStore: true })(context);
    };

    const first = runPhaseBPublication({
      hubRoot,
      harvestId: FIXTURE_ID,
      payloadHash: staged.payloadHash,
      lDurablePublisher: createDefaultLDurablePublisher(),
      zPublisher: createDefaultZPublisher({ zCacheRoot }),
      supabaseProjector: flaky,
      layerVerifier: createDefaultLayerVerifier(),
      operationWriter: createDefaultOperationWriter(),
    });
    assert.equal(first.phaseBVerdict, PHASE_B_VERDICTS.DEGRADED);

    const second = runPhaseBPublication({
      hubRoot,
      harvestId: FIXTURE_ID,
      payloadHash: staged.payloadHash,
      lDurablePublisher: createDefaultLDurablePublisher(),
      zPublisher: createDefaultZPublisher({ zCacheRoot }),
      supabaseProjector: flaky,
      layerVerifier: createDefaultLayerVerifier(),
      operationWriter: createDefaultOperationWriter(),
    });
    assert.equal(second.layers.lDurable.status, "NOOP_CURRENT");
    assert.equal(second.layers.zCache.status, "NOOP_CURRENT");
    assert.equal(second.layers.supabaseProjection.status, "IN_SYNC");
    assert.equal(second.phaseBVerdict, PHASE_B_VERDICTS.COMPLETE);
  });
});

test("dirty cross-agent worktree does not block snapshot projection", () => {
  const dirtyPath = path.join(REPO_ROOT, ".wave4-cross-agent-dirty.tmp");
  const before = gitPorcelain(REPO_ROOT);
  fs.writeFileSync(dirtyPath, "probe\n");
  try {
    withTempHub((hubRoot) => {
      const staged = stageAndPublish(hubRoot);
      const context = readDurablePublicationContext(hubRoot, FIXTURE_ID, staged.payloadHash);
      const result = applySupabaseProjection(context, {
        hubRoot,
        appBuilderRoot: resolveAppBuilderRoot(REPO_ROOT),
        useMemoryStore: true,
      });
      assert.equal(result.status, "IN_SYNC");
    });
  } finally {
    fs.rmSync(dirtyPath, { force: true });
    assert.equal(gitPorcelain(REPO_ROOT), before);
  }
});

test("cross-agent git porcelain unchanged after phase B projection", () => {
  const before = gitPorcelain(REPO_ROOT);
  withTempHub((hubRoot, zCacheRoot) => {
    const staged = stageAndPublish(hubRoot);
    runPhaseBPublication({
      hubRoot,
      harvestId: FIXTURE_ID,
      payloadHash: staged.payloadHash,
      lDurablePublisher: createDefaultLDurablePublisher(),
      zPublisher: createDefaultZPublisher({ zCacheRoot }),
      supabaseProjector: createDefaultSupabaseProjector({
        hubRoot,
        appBuilderRoot: resolveAppBuilderRoot(REPO_ROOT),
        useMemoryStore: true,
      }),
      layerVerifier: createDefaultLayerVerifier(),
      operationWriter: createDefaultOperationWriter(),
    });
  });
  assert.equal(gitPorcelain(REPO_ROOT), before);
});

console.log(`\n# harvest-supabase-snapshot: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
}
