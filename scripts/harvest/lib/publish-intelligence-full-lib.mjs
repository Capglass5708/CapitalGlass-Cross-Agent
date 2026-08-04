import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { resolveAppBuilderRoot, resolveDataExtractionRoot } from "../../index/lib/resolve-repo-roots.mjs";
import { resolveGitHead } from "../../index/lib/git-head.mjs";
import { runBlindRetrievalBenchmark } from "./blind-retrieval-lib.mjs";
import { compileSeedPackets } from "./compile-seed-packets-lib.mjs";
import { runDuplicationPreflight } from "./duplication-preflight-lib.mjs";
import { hashCanonicalJson } from "./hash.mjs";
import { publishHubSeed, resolveHubRoot } from "./publish-hub-seed-lib.mjs";
import {
  registerThreadAutopsyHubIndex,
  syncDoNotAdvanceToHub,
} from "./register-hub-index.mjs";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function runStep(label, cmd, cwd, env = {}) {
  console.log(`\n=== ${label} ===`);
  console.log(`> ${cmd}`);
  execSync(cmd, { cwd, stdio: "inherit", env: { ...process.env, ...env } });
  return { label, ok: true };
}

function seedDirHasPackets(runDir) {
  const seedDir = path.join(runDir, "seed-packets");
  return fs.existsSync(seedDir) && fs.readdirSync(seedDir).some((f) => f.endsWith(".json"));
}

function buildT1SeedManifest({ runDir, harvestId, gitHead }) {
  const manifest = readJson(path.join(runDir, "harvest-manifest-v1.json"));
  const bundlePath = path.join(runDir, "thread-autopsy-bundle.json");
  const bundle = fs.existsSync(bundlePath) ? readJson(bundlePath) : null;
  return {
    schemaVersion: "cross-agent-harvest-seed-manifest-v1@1.0.0",
    harvestId,
    subject: manifest.packets?.[0]?.packetTitle ?? harvestId,
    tier: manifest.threadAutopsy?.tier ?? bundle?.tier ?? "T1",
    seedRecordCount: 0,
    retrievalQuestions: [],
    roiTop3: (bundle?.roiBacklog ?? []).slice(0, 3).map((r) => ({
      rank: r.rank,
      title: r.title,
      seedId: null,
    })),
    byKindSlice: "00-master-index/BY-KIND/thread-autopsy-index.json",
    catalogRoot: "02-catalog/knowledge-objects/cross-agent-harvest",
    sourceCommitSha: gitHead,
    indexOnly: true,
  };
}

function publishT1IndexOnly({ repoRoot, harvestId, gitHead, hubRoot }) {
  const runDir = path.join(repoRoot, "artifacts/agent-runs", harvestId);
  const manifest = readJson(path.join(runDir, "harvest-manifest-v1.json"));
  const seedManifest = buildT1SeedManifest({ runDir, harvestId, gitHead });
  writeJson(path.join(runDir, "intelligence-hub-seed-manifest.json"), seedManifest);

  const indexPath = path.join(hubRoot, "00-master-index/BY-KIND/thread-autopsy-index.json");
  let existing = {
    schemaVersion: "intelligence-hub-thread-autopsy-index-slice-v1@1.0.0",
    sourceCommitSha: gitHead,
    updatedAt: new Date().toISOString(),
    harvestCount: 0,
    harvests: [],
    criticalSeedIds: [],
    retrievalHint:
      "Load bundle authority from artifacts/agent-runs/<harvest-id>/thread-autopsy-bundle.json",
  };
  if (fs.existsSync(indexPath)) {
    existing = { ...existing, ...readJson(indexPath) };
  }

  const harvests = (existing.harvests ?? []).filter((h) => h.harvestId !== harvestId);
  harvests.push({
    harvestId,
    subject: seedManifest.subject,
    tier: seedManifest.tier,
    seedIds: [],
    roiTop3: seedManifest.roiTop3,
    doNotAdvanceRefs: manifest.doNotAdvance ?? [],
    catalogRoot: seedManifest.catalogRoot,
    gitAuthorityPath: `artifacts/agent-runs/${harvestId}/harvest-manifest-v1.json`,
    bundleAuthorityPath: `artifacts/agent-runs/${harvestId}/thread-autopsy-bundle.json`,
  });

  const slice = {
    ...existing,
    schemaVersion: "intelligence-hub-thread-autopsy-index-slice-v1@1.0.0",
    sourceCommitSha: gitHead,
    updatedAt: new Date().toISOString(),
    harvestCount: harvests.length,
    harvests,
  };
  writeJson(indexPath, slice);

  return {
    ok: true,
    mode: "index-only",
    publishedIds: [],
    slice,
  };
}

function updateManifestProjection(runDir, { hubPublishStatus, operationalReceiptPath }) {
  const manifestPath = path.join(runDir, "harvest-manifest-v1.json");
  if (!fs.existsSync(manifestPath)) return;
  const manifest = readJson(manifestPath);
  manifest.projection = manifest.projection ?? {};
  manifest.projection.hubPublishStatus = hubPublishStatus;
  manifest.projection.projectionSyncStatus =
    hubPublishStatus === "published" ? "synced" : manifest.projection.projectionSyncStatus ?? "not-run";
  manifest.projection.operationalReceiptPath = operationalReceiptPath;
  manifest.projection.operationalAt = new Date().toISOString();
  writeJson(manifestPath, manifest);
}

/**
 * Make a validated harvest operational across L:, Z:, and C: hot cache.
 * Chat-thread structured artifacts are authority — this publishes them to retrieval layers.
 */
export function publishIntelligenceFull({
  repoRoot,
  harvestId,
  gitHead = resolveGitHead(repoRoot),
  hubRoot = resolveHubRoot(),
  appBuilderRoot = resolveAppBuilderRoot(repoRoot),
  dataExtractionRoot = resolveDataExtractionRoot(repoRoot),
  skipTests = false,
  skipBlindRetrieval = false,
  skipLedgerSync = false,
  dryRun = false,
  allowRepublish = false,
  allowSupersedeSeedIds = [],
} = {}) {
  const runDir = path.join(repoRoot, "artifacts/agent-runs", harvestId);
  const manifestPath = path.join(runDir, "harvest-manifest-v1.json");
  const startedAt = new Date().toISOString();
  const stages = [];

  if (!fs.existsSync(manifestPath)) {
    return { ok: false, verdict: "HARVEST_MISSING", errors: [`missing ${manifestPath}`] };
  }

  if (!fs.existsSync(path.join(hubRoot, "00-master-index", "BY-KIND"))) {
    return {
      ok: false,
      verdict: "L_DRIVE_NOT_MOUNTED",
      errors: [`Intelligence Hub not mounted at ${hubRoot}`],
    };
  }

  const manifest = readJson(manifestPath);
  const tier = manifest.threadAutopsy?.tier ?? "T1";
  const hasSeeds = seedDirHasPackets(runDir);

  if (dryRun) {
    return {
      ok: true,
      dryRun: true,
      harvestId,
      tier,
      hasSeeds,
      hubRoot,
      plannedStages: [
        "sync-derived",
        "duplication-preflight",
        "validate",
        "validate-autopsy",
        "test:harvest",
        hasSeeds ? "compile-seed-packets" : "t1-index-manifest",
        hasSeeds ? "blind-retrieval" : "skip-blind-retrieval",
        hasSeeds ? "publish-hub-seed" : "publish-t1-index-only",
        "sync-do-not-advance",
        "register-thread-autopsy-index",
        skipLedgerSync ? "skip-ledger-sync" : "index:sync-publication",
        "publish-hot-routing-index",
        "intelligence-hub:index-freshness:publish",
      ],
    };
  }

  try {
    stages.push(
      runStep(
        "sync-derived",
        `node scripts/harvest/sync-derived.mjs ${harvestId}`,
        repoRoot,
      ),
    );

    const bundlePath = path.join(runDir, "thread-autopsy-bundle.json");
    const bundle = fs.existsSync(bundlePath) ? readJson(bundlePath) : null;
    const duplication = runDuplicationPreflight({
      repoRoot,
      harvestId,
      runDir,
      manifest,
      bundle,
      hubRoot,
      gitHead,
      mode: "publish",
      allowRepublish,
      allowSupersedeSeedIds,
      writeReceipt: true,
    });
    stages.push({
      label: "duplication-preflight",
      ok: duplication.ok,
      verdict: duplication.verdict,
    });
    if (!duplication.ok) {
      return { ok: false, verdict: "DUPLICATE_BLOCKED", duplication, stages };
    }

    stages.push(runStep("validate", `node scripts/harvest/validate-harvest.mjs ${harvestId}`, repoRoot));
    if (manifest.threadAutopsy) {
      stages.push(
        runStep(
          "validate-autopsy",
          `npm run harvest:validate-autopsy -- --harvest-id=${harvestId}`,
          repoRoot,
        ),
      );
    }
    if (!skipTests) {
      stages.push(runStep("test:harvest", "npm run test:harvest", repoRoot));
    }

    let hubPublish;
    if (hasSeeds) {
      const compile = compileSeedPackets({ repoRoot, harvestId, gitHead });
      if (!compile.ok) {
        return { ok: false, verdict: "COMPILE_FAIL", errors: compile.errors, stages };
      }
      if (!skipBlindRetrieval) {
        const blind = runBlindRetrievalBenchmark({ repoRoot, harvestId });
        if (blind.verdict === "BLIND_RETRIEVAL_FAIL") {
          return { ok: false, verdict: "BLIND_RETRIEVAL_FAIL", blind, stages };
        }
        stages.push({ label: "blind-retrieval", ok: true, verdict: blind.verdict });
      }
      hubPublish = publishHubSeed({
        repoRoot,
        harvestId,
        gitHead,
        hubRoot,
        allowRepublish,
        allowSupersedeSeedIds,
      });
    } else {
      hubPublish = publishT1IndexOnly({ repoRoot, harvestId, gitHead, hubRoot });
      stages.push({ label: "publish-t1-index-only", ok: true });
    }

    if (!hubPublish.ok) {
      return { ok: false, verdict: "HUB_SEED_FAIL", errors: hubPublish.errors, stages };
    }

    const dna = syncDoNotAdvanceToHub({ repoRoot, hubRoot });
    const reg = registerThreadAutopsyHubIndex({ hubRoot, gitHead });
    stages.push({
      label: "hub-slices",
      ok: dna.ok && reg.ok,
      doNotAdvanceCount: dna.entryCount,
      threadAutopsyIndex: reg.slicePath,
    });

    if (!skipLedgerSync) {
      stages.push(
        runStep("ledger-sync", "npm run index:sync-publication", repoRoot, {
          INTELLIGENCE_HUB_ROOT: hubRoot,
          CG_APPBUILDER_MCP_ROOT: appBuilderRoot,
          DATA_EXTRACTION_ROOT: dataExtractionRoot,
        }),
      );
    }

    let hotRouting = { ok: false, code: "SKIP" };
    try {
      const hotCmd = "npm run intelligence-hub:publish-hot-routing-index -- --json";
      const hotOut = execSync(hotCmd, {
        cwd: appBuilderRoot,
        env: { ...process.env, INTELLIGENCE_HUB_ROOT: hubRoot },
        encoding: "utf8",
      });
      hotRouting = JSON.parse(hotOut);
      stages.push({ label: "hot-routing-index", ok: hotRouting.ok, code: hotRouting.code });
    } catch (err) {
      stages.push({ label: "hot-routing-index", ok: false, error: String(err.message ?? err) });
    }

    let aiCachePublish = { ok: false, code: "SKIP" };
    try {
      const zCmd = "npm run intelligence-hub:index-freshness:publish -- --json";
      const zOut = execSync(zCmd, {
        cwd: appBuilderRoot,
        env: { ...process.env, INTELLIGENCE_HUB_ROOT: hubRoot },
        encoding: "utf8",
      });
      const parsed = JSON.parse(zOut);
      aiCachePublish = parsed.receipt?.layers?.zAiCache ?? parsed.aiCachePublish ?? { ok: true };
      stages.push({ label: "z-ai-cache-index", ok: aiCachePublish.ok !== false, code: aiCachePublish.code });
    } catch (err) {
      stages.push({ label: "z-ai-cache-index", ok: false, error: String(err.message ?? err) });
    }

    const receipt = {
      schemaVersion: "cross-agent-harvest-operational-publication-receipt-v1@1.0.0",
      harvestId,
      generatedAt: new Date().toISOString(),
      startedAt,
      verdict: "OPERATIONAL",
      sourceCommitSha: gitHead,
      tier,
      authorityModel: "CHAT_THREAD_STRUCTURED_TRUTH",
      intelligenceHubRoot: hubRoot,
      layers: {
        git: { path: manifestPath, sourceCommitSha: gitHead },
        lCatalog: {
          ok: hasSeeds,
          seedCount: hubPublish.publishedIds?.length ?? 0,
          byKindSlice: "00-master-index/BY-KIND/thread-autopsy-index.json",
        },
        lLedger: { ok: !skipLedgerSync },
        cHotRouting: hotRouting,
        zAiCache: aiCachePublish,
      },
      stages,
      contentHash: hashCanonicalJson({ harvestId, gitHead, stages }),
    };

    const receiptPath = path.join(runDir, "operational-publication-receipt.json");
    writeJson(receiptPath, receipt);
    updateManifestProjection(runDir, {
      hubPublishStatus: "published",
      operationalReceiptPath: `artifacts/agent-runs/${harvestId}/operational-publication-receipt.json`,
    });
    stages.push(
      runStep(
        "sync-derived-post-publish",
        `node scripts/harvest/sync-derived.mjs ${harvestId}`,
        repoRoot,
      ),
    );

    return { ok: true, verdict: "OPERATIONAL", receipt, receiptPath, stages };
  } catch (err) {
    return {
      ok: false,
      verdict: "OPERATIONAL_FAIL",
      errors: [String(err.message ?? err)],
      stages,
    };
  }
}
