#!/usr/bin/env node
/**
 * Live shared-dev Supabase harvest projection smoke (Wave 4A).
 * Gated: RUN_SHARED_DEV_HARVEST_PROJECTION=1 + Doppler cg-mcp/dev credentials.
 * Uses Wave 2/3 fixture only — does not touch live Cross-Agent Git worktree harvest dirs.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { stageLDurableBundle } from "../harvest/lib/l-durable-bundle-lib.mjs";
import {
  createDefaultLDurablePublisher,
  createDefaultLayerVerifier,
  createDefaultOperationWriter,
  createDefaultSupabaseProjector,
  createDefaultZPublisher,
  runPhaseBPublication,
} from "../harvest/lib/phase-b-publication-orchestrator-lib.mjs";
import { PHASE_B_VERDICTS } from "../harvest/lib/publication-layer-verdict-lib.mjs";
import { resolveAppBuilderRoot } from "../index/lib/resolve-repo-roots.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const APP_BUILDER_ROOT = resolveAppBuilderRoot(REPO_ROOT);
const SMOKE_HARVEST_ID = "harvest-wave2-l-durable-fixture-v1";
const FIXTURE_SOURCE = path.join(
  REPO_ROOT,
  "scripts/tests/fixtures/harvest-l-durable-publisher-v1/source",
);

function gitPorcelain(repoRoot) {
  return execFileSync("git", ["-C", repoRoot, "status", "--porcelain"], { encoding: "utf8" });
}

function runPhaseB(hubRoot, payloadHash, zCacheRoot, overrides = {}) {
  return runPhaseBPublication({
    hubRoot,
    harvestId: SMOKE_HARVEST_ID,
    payloadHash,
    lDurablePublisher: createDefaultLDurablePublisher(),
    zPublisher: createDefaultZPublisher({ zCacheRoot }),
    supabaseProjector: createDefaultSupabaseProjector({
      hubRoot,
      appBuilderRoot: APP_BUILDER_ROOT,
      useMemoryStore: false,
    }),
    layerVerifier: createDefaultLayerVerifier(),
    operationWriter: createDefaultOperationWriter(),
    ...overrides,
  });
}

async function cleanupSmokeRows() {
  const { assertControlPlaneTarget, runSql } = await import(
    path.join(APP_BUILDER_ROOT, "scripts/derived-intel/lib/live-db.mjs")
  );
  assertControlPlaneTarget();
  runSql(
    `DELETE FROM coordination.cross_agent_harvest_snapshots
     WHERE harvest_id = '${SMOKE_HARVEST_ID.replace(/'/g, "''")}'`,
    "cleanup-smoke-harvest-snapshots",
  );
}

async function main() {
  if (process.env.RUN_SHARED_DEV_HARVEST_PROJECTION !== "1") {
    console.error("Blocked: set RUN_SHARED_DEV_HARVEST_PROJECTION=1");
    process.exit(1);
  }
  if (process.env.CROSS_AGENT_HARVEST_PROJECTION_APPROVED !== "1") {
    console.error("Blocked: set CROSS_AGENT_HARVEST_PROJECTION_APPROVED=1");
    process.exit(1);
  }

  const crossAgentBefore = gitPorcelain(REPO_ROOT);
  const appBuilderBefore = gitPorcelain(APP_BUILDER_ROOT);
  const hubRoot = fs.mkdtempSync(path.join(os.tmpdir(), "harvest-shared-dev-hub-"));
  const zCacheRoot = fs.mkdtempSync(path.join(os.tmpdir(), "harvest-shared-dev-z-"));
  const receipt = {
    schemaVersion: "harvest-shared-dev-projection-smoke-receipt-v1@1.0.0",
    harvestId: SMOKE_HARVEST_ID,
    environment: "shared-dev",
    startedAt: new Date().toISOString(),
    steps: [],
    verdict: "PENDING",
  };

  try {
    await cleanupSmokeRows();
    receipt.steps.push({ step: "cleanup", status: "PASS" });

    const staged = stageLDurableBundle({
      hubRoot,
      sourceRunDir: FIXTURE_SOURCE,
      harvestId: SMOKE_HARVEST_ID,
    });

    let outageAttempts = 0;
    const flakySupabase = (context, runtimeOptions) => {
      outageAttempts += 1;
      if (outageAttempts === 1) {
        return {
          ok: false,
          status: "FAILED_REQUIRED",
          verdict: "SUPABASE_PROJECTION_FAIL",
          error: "simulated shared-dev outage",
        };
      }
      return createDefaultSupabaseProjector({
        hubRoot,
        appBuilderRoot: APP_BUILDER_ROOT,
        useMemoryStore: false,
      })(context, runtimeOptions);
    };

    const degraded = runPhaseB(hubRoot, staged.payloadHash, zCacheRoot, {
      supabaseProjector: flakySupabase,
    });
    receipt.steps.push({
      step: "outage_before_insert",
      phaseBVerdict: degraded.phaseBVerdict,
      supabaseStatus: degraded.layers.supabaseProjection.status,
      lDurable: degraded.layers.lDurable.status,
      zCache: degraded.layers.zCache.status,
    });
    assert.equal(degraded.phaseBVerdict, PHASE_B_VERDICTS.DEGRADED);
    assert.equal(degraded.layers.supabaseProjection.status, "FAILED_REQUIRED");
    assert.equal(degraded.layers.lDurable.status, "CURRENT");
    assert.ok(["CURRENT", "NOOP_CURRENT"].includes(degraded.layers.zCache.status));

    const recovered = runPhaseB(hubRoot, staged.payloadHash, zCacheRoot, {
      supabaseProjector: flakySupabase,
    });
    receipt.steps.push({
      step: "recovery_insert",
      phaseBVerdict: recovered.phaseBVerdict,
      supabaseStatus: recovered.layers.supabaseProjection.status,
      supabaseVerdict: recovered.layers.supabaseProjection.verdict,
      lDurable: recovered.layers.lDurable.status,
      zCache: recovered.layers.zCache.status,
    });
    assert.equal(recovered.phaseBVerdict, PHASE_B_VERDICTS.COMPLETE);
    assert.equal(recovered.layers.lDurable.status, "NOOP_CURRENT");
    assert.equal(recovered.layers.zCache.status, "NOOP_CURRENT");
    assert.equal(recovered.layers.supabaseProjection.status, "IN_SYNC");
    assert.equal(recovered.layers.supabaseProjection.verdict, "PROJECTION_INSERTED");

    const second = runPhaseB(hubRoot, staged.payloadHash, zCacheRoot);
    receipt.steps.push({
      step: "second_apply",
      phaseBVerdict: second.phaseBVerdict,
      supabaseStatus: second.layers.supabaseProjection.status,
      supabaseVerdict: second.layers.supabaseProjection.verdict,
      lDurable: second.layers.lDurable.status,
      zCache: second.layers.zCache.status,
    });
    assert.equal(second.phaseBVerdict, PHASE_B_VERDICTS.NOOP);
    assert.equal(second.layers.supabaseProjection.status, "NOOP_CURRENT");
    assert.equal(second.layers.supabaseProjection.verdict, "NOOP_CURRENT");
    assert.equal(second.layers.lDurable.status, "NOOP_CURRENT");
    assert.equal(second.layers.zCache.status, "NOOP_CURRENT");

    assert.equal(gitPorcelain(REPO_ROOT), crossAgentBefore, "cross-agent git must be unchanged");
    assert.equal(gitPorcelain(APP_BUILDER_ROOT), appBuilderBefore, "appbuilder git must be unchanged");

    receipt.verdict = "SUPABASE_SHARED_DEV_PROJECTION_PASS";
    receipt.completedAt = new Date().toISOString();
    receipt.gitMutation = {
      crossAgent: false,
      appBuilder: false,
    };

    const artifactDir = path.join(
      APP_BUILDER_ROOT,
      "artifacts/agent-runs/cross-agent-harvest-snapshot-projection-v1",
    );
    fs.mkdirSync(artifactDir, { recursive: true });
    fs.writeFileSync(
      path.join(artifactDir, "shared-dev-projection-smoke-receipt.json"),
      `${JSON.stringify(receipt, null, 2)}\n`,
      "utf8",
    );

    console.log(JSON.stringify(receipt, null, 2));
  } finally {
    fs.rmSync(hubRoot, { recursive: true, force: true });
    fs.rmSync(zCacheRoot, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(
    JSON.stringify(
      {
        verdict: "SUPABASE_SHARED_DEV_PROJECTION_FAIL",
        error: error.message,
      },
      null,
      2,
    ),
  );
  process.exit(1);
});
