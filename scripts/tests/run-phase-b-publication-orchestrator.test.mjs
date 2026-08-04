import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import {
  bundleLayout,
  publishLDurableBundle,
  stageLDurableBundle,
} from "../harvest/lib/l-durable-bundle-lib.mjs";
import {
  createDefaultLDurablePublisher,
  createDefaultLayerVerifier,
  createDefaultOperationWriter,
  createDefaultSupabaseProjector,
  createDefaultZPublisher,
  readDurablePublicationContext,
  runPhaseBPublication,
} from "../harvest/lib/phase-b-publication-orchestrator-lib.mjs";
import {
  POINTER_CANDIDATE_FILENAME,
  readPointerCandidate,
} from "../harvest/lib/publication-pointer-candidate-lib.mjs";
import { clearSupabaseProjectionMemory } from "../harvest/lib/supabase-projection-adapter-lib.mjs";
import { publishIntelligencePhaseB } from "../harvest/lib/publish-intelligence-phase-b-lib.mjs";
import { PHASE_B_VERDICTS } from "../harvest/lib/publication-layer-verdict-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const FIXTURE_ID = "harvest-wave2-l-durable-fixture-v1";
const FIXTURE_SOURCE = path.join(
  REPO_ROOT,
  "scripts/tests/fixtures/harvest-l-durable-publisher-v1/source",
);
const GIT_POINTER_NAME = "harvest-publication-pointer-v1.json";

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
  const hubRoot = fs.mkdtempSync(path.join(os.tmpdir(), "harvest-phase-b-hub-"));
  const zCacheRoot = fs.mkdtempSync(path.join(os.tmpdir(), "harvest-phase-b-z-"));
  try {
    return fn(hubRoot, zCacheRoot);
  } finally {
    fs.rmSync(hubRoot, { recursive: true, force: true });
    fs.rmSync(zCacheRoot, { recursive: true, force: true });
    clearSupabaseProjectionMemory();
  }
}

function stageFixture(hubRoot, sourceDir = FIXTURE_SOURCE) {
  return stageLDurableBundle({
    hubRoot,
    sourceRunDir: sourceDir,
    harvestId: FIXTURE_ID,
  });
}

function runPhaseB(hubRoot, payloadHash, overrides = {}, zCacheRoot) {
  return runPhaseBPublication({
    hubRoot,
    harvestId: FIXTURE_ID,
    payloadHash,
    lDurablePublisher: createDefaultLDurablePublisher(),
    zPublisher: createDefaultZPublisher({ zCacheRoot }),
    supabaseProjector: createDefaultSupabaseProjector({ hubRoot, useMemoryStore: true }),
    layerVerifier: createDefaultLayerVerifier(),
    operationWriter: createDefaultOperationWriter(),
    ...overrides,
  });
}

function stageAndPrepare(hubRoot) {
  const staged = stageFixture(hubRoot);
  return { staged, payloadHash: staged.payloadHash };
}

test("all required layers succeed returns PHASE_B_COMPLETE", () => {
  withTempHub((hubRoot, zCacheRoot) => {
    const { payloadHash } = stageAndPrepare(hubRoot);
    const result = runPhaseB(hubRoot, payloadHash, {}, zCacheRoot);
    assert.equal(result.phaseBVerdict, PHASE_B_VERDICTS.COMPLETE);
    assert.equal(result.layers.lDurable.status, "CURRENT");
    assert.equal(result.layers.zCache.status, "CURRENT");
    assert.equal(result.layers.supabaseProjection.status, "IN_SYNC");
    assert.equal(result.layers.gitPointer.status, "PENDING_PHASE_C");
    assert.equal(result.pointerCandidate.receiptCommit, null);
  });
});

test("identical rerun returns NOOP_CURRENT", () => {
  withTempHub((hubRoot, zCacheRoot) => {
    const { payloadHash } = stageAndPrepare(hubRoot);
    const first = runPhaseB(hubRoot, payloadHash, {}, zCacheRoot);
    assert.equal(first.phaseBVerdict, PHASE_B_VERDICTS.COMPLETE);
    const second = runPhaseB(hubRoot, payloadHash, {}, zCacheRoot);
    assert.equal(second.phaseBVerdict, PHASE_B_VERDICTS.NOOP);
    assert.equal(second.layers.lDurable.status, "NOOP_CURRENT");
    assert.equal(second.layers.zCache.status, "NOOP_CURRENT");
    assert.equal(second.layers.supabaseProjection.status, "NOOP_CURRENT");
  });
});

test("Z required failure leaves L durable and returns PHASE_B_DEGRADED", () => {
  withTempHub((hubRoot, zCacheRoot) => {
    const { payloadHash } = stageAndPrepare(hubRoot);
    const result = runPhaseB(hubRoot, payloadHash, {
      zPublisher: () => ({
        ok: false,
        status: "FAILED_REQUIRED",
        verdict: "Z_CACHE_PUBLISH_FAIL",
        error: "simulated z failure",
      }),
    }, zCacheRoot);
    assert.equal(result.layers.lDurable.status, "CURRENT");
    assert.equal(result.layers.zCache.status, "FAILED_REQUIRED");
    assert.equal(result.phaseBVerdict, PHASE_B_VERDICTS.DEGRADED);
    const layout = bundleLayout(hubRoot, FIXTURE_ID, payloadHash);
    assert.ok(fs.existsSync(path.join(layout.catalogRoot, "PUBLICATION_COMPLETE.json")));
  });
});

test("Supabase required failure returns PHASE_B_DEGRADED without unpublishing L", () => {
  withTempHub((hubRoot, zCacheRoot) => {
    const { payloadHash } = stageAndPrepare(hubRoot);
    const result = runPhaseB(hubRoot, payloadHash, {
      supabaseProjector: () => ({
        ok: false,
        status: "FAILED_REQUIRED",
        verdict: "SUPABASE_PROJECTION_FAIL",
        error: "simulated supabase failure",
      }),
    }, zCacheRoot);
    assert.equal(result.layers.lDurable.status, "CURRENT");
    assert.equal(result.layers.supabaseProjection.status, "FAILED_REQUIRED");
    assert.equal(result.phaseBVerdict, PHASE_B_VERDICTS.DEGRADED);
  });
});

test("optional hot routing unavailable does not fail Phase B", () => {
  withTempHub((hubRoot, zCacheRoot) => {
    const { payloadHash } = stageAndPrepare(hubRoot);
    const result = runPhaseB(hubRoot, payloadHash, {
      hotRoutingPublisher: () => {
        throw new Error("hot routing unavailable");
      },
    }, zCacheRoot);
    assert.equal(result.phaseBVerdict, PHASE_B_VERDICTS.COMPLETE);
    assert.equal(result.layers.hotRouting.status, "SKIPPED_NOT_CONFIGURED");
  });
});

test("skip-supabase produces PHASE_B_DEGRADED not PHASE_B_COMPLETE", () => {
  withTempHub((hubRoot, zCacheRoot) => {
    const { payloadHash } = stageAndPrepare(hubRoot);
    const result = runPhaseB(hubRoot, payloadHash, {
      skipSupabase: true,
      supabaseProjector: createDefaultSupabaseProjector({ skipApply: true }),
    }, zCacheRoot);
    assert.equal(result.layers.supabaseProjection.status, "SKIPPED");
    assert.equal(result.phaseBVerdict, PHASE_B_VERDICTS.DEGRADED);
  });
});

test("interrupted Phase B resumes without republishing L payload", () => {
  withTempHub((hubRoot, zCacheRoot) => {
    const { payloadHash } = stageAndPrepare(hubRoot);
    let supabaseAttempts = 0;
    const flakySupabase = (context, runtimeOptions) => {
      supabaseAttempts += 1;
      if (supabaseAttempts === 1) {
        return {
          ok: false,
          status: "FAILED_REQUIRED",
          verdict: "SUPABASE_PROJECTION_FAIL",
        };
      }
      return createDefaultSupabaseProjector({ useMemoryStore: true })(context, runtimeOptions);
    };

    const first = runPhaseB(hubRoot, payloadHash, { supabaseProjector: flakySupabase }, zCacheRoot);
    assert.equal(first.phaseBVerdict, PHASE_B_VERDICTS.DEGRADED);
    assert.equal(first.layers.lDurable.status, "CURRENT");

    const second = runPhaseB(hubRoot, payloadHash, { supabaseProjector: flakySupabase }, zCacheRoot);
    assert.equal(second.layers.lDurable.status, "NOOP_CURRENT");
    assert.equal(second.phaseBVerdict, PHASE_B_VERDICTS.COMPLETE);
    assert.equal(supabaseAttempts, 2);
  });
});

test("pointer candidate written to L operations with receiptCommit null", () => {
  withTempHub((hubRoot, zCacheRoot) => {
    const { payloadHash } = stageAndPrepare(hubRoot);
    const result = runPhaseB(hubRoot, payloadHash, {}, zCacheRoot);
    const candidate = readPointerCandidate(hubRoot, FIXTURE_ID, payloadHash);
    assert.ok(candidate);
    assert.equal(candidate.receiptCommit, null);
    assert.equal(candidate.schemaVersion, "harvest-publication-pointer-v1@1.0.0");
    assert.ok(result.operations.pointerCandidatePath.endsWith(POINTER_CANDIDATE_FILENAME));
    const gitPointer = path.join(REPO_ROOT, "artifacts/agent-runs", FIXTURE_ID, GIT_POINTER_NAME);
    assert.equal(fs.existsSync(gitPointer), false);
  });
});

test("authoritySourceCommit is pinned to manifest not current Git HEAD", () => {
  withTempHub((hubRoot, zCacheRoot) => {
    const { payloadHash } = stageAndPrepare(hubRoot);
    const currentHead = execSync("git rev-parse HEAD", { cwd: REPO_ROOT, encoding: "utf8" }).trim();
    const result = runPhaseB(hubRoot, payloadHash, {}, zCacheRoot);
    const context = readDurablePublicationContext(hubRoot, FIXTURE_ID, payloadHash);
    assert.equal(context.authoritySourceCommit, "000000000000000000000000000000000001");
    assert.notEqual(context.authoritySourceCommit, currentHead);
    assert.equal(result.identity.authoritySourceCommit, context.authoritySourceCommit);
  });
});

test("Z publisher consumes L durable identity not Git harvest directory", () => {
  withTempHub((hubRoot, zCacheRoot) => {
    const { payloadHash } = stageAndPrepare(hubRoot);
    let captured = null;
    const spyZ = (context) => {
      captured = context;
      return createDefaultZPublisher({ zCacheRoot })(context);
    };
    runPhaseB(hubRoot, payloadHash, { zPublisher: spyZ }, zCacheRoot);
    assert.ok(captured);
    assert.equal(captured.harvestId, FIXTURE_ID);
    assert.ok(captured.durablePath.startsWith("02-catalog/harvests/"));
    assert.ok(captured.payloadHash.startsWith("sha256:"));
    assert.equal("runDir" in captured, false);
  });
});

test("git porcelain unchanged after publish-intelligence-full phase-b-v2", () => {
  const before = execSync("git status --porcelain", { cwd: REPO_ROOT, encoding: "utf8" });
  withTempHub((hubRoot, zCacheRoot) => {
    const { payloadHash } = stageAndPrepare(hubRoot);
    const result = publishIntelligencePhaseB({
      harvestId: FIXTURE_ID,
      payloadHash,
      hubRoot,
      zCacheRoot,
    });
    assert.equal(result.phaseBVerdict, PHASE_B_VERDICTS.COMPLETE);
  });
  const after = execSync("git status --porcelain", { cwd: REPO_ROOT, encoding: "utf8" });
  assert.equal(before, after);
});

test("publish-intelligence-full CLI phase-b-v2 git guard", () => {
  const before = execSync("git status --porcelain", { cwd: REPO_ROOT, encoding: "utf8" });
  withTempHub((hubRoot, zCacheRoot) => {
    const staged = stageLDurableBundle({ hubRoot, sourceRunDir: FIXTURE_SOURCE, harvestId: FIXTURE_ID });
    publishLDurableBundle({ hubRoot, harvestId: FIXTURE_ID, payloadHash: staged.payloadHash });
    const proc = spawnSync(
      "node",
      [
        "scripts/harvest/publish-intelligence-full.mjs",
        "--pipeline=phase-b-v2",
        `--harvest-id=${FIXTURE_ID}`,
        `--payload-hash=${staged.payloadHash}`,
        `--hub-root=${hubRoot}`,
        `--z-cache-root=${zCacheRoot}`,
        "--json",
      ],
      { cwd: REPO_ROOT, encoding: "utf8" },
    );
    assert.equal(proc.status, 0, proc.stderr || proc.stdout);
    const parsed = JSON.parse(proc.stdout.trim());
    assert.equal(parsed.phaseBVerdict, PHASE_B_VERDICTS.COMPLETE);
  });
  const after = execSync("git status --porcelain", { cwd: REPO_ROOT, encoding: "utf8" });
  assert.equal(before, after);
});

console.log(`\n# harvest-phase-b: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
}
