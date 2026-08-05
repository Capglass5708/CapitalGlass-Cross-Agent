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
  registerPromptHarvestHubIndex,
  registerThreadAutopsyHubIndex,
  syncDoNotAdvanceToHub,
  upsertPromptHarvestHubIndex,
} from "./register-hub-index.mjs";
import { fanoutHostAiCache } from "./host-ai-cache-fanout-lib.mjs";
import { syncZHarvestMirror } from "./z-harvest-mirror-lib.mjs";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

/** npm lifecycle lines (e.g. `> script-name`) break JSON.parse on combined stdout. */
function parseJsonFromProcessOutput(stdout) {
  const text = String(stdout ?? "").trim();
  try {
    return JSON.parse(text);
  } catch {
    const start = text.lastIndexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(text.slice(start, end + 1));
    }
    throw new Error(`no JSON object in process output: ${text.slice(0, 200)}`);
  }
}

function runAppBuilderJsonScript(appBuilderRoot, scriptRel, args = [], env = {}) {
  const scriptPath = path.join(appBuilderRoot, scriptRel);
  const cmd = `node ${JSON.stringify(scriptPath)} ${args.join(" ")}`.trim();
  const stdout = execSync(cmd, {
    cwd: appBuilderRoot,
    env: { ...process.env, ...env },
    encoding: "utf8",
  });
  return parseJsonFromProcessOutput(stdout);
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
  skipSupabaseProjection = false,
  dryRun = false,
  allowRepublish = false,
  allowSupersedeSeedIds = [],
  syncHosts = null,
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
        "sync-z-harvest-mirror",
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
        syncHosts ? `host-ai-cache-fanout:${Array.isArray(syncHosts) ? syncHosts.join(",") : syncHosts}` : "skip-host-fanout",
        skipSupabaseProjection ? "skip-thread-autopsy-supabase" : "thread-autopsy-supabase-projection",
        skipSupabaseProjection ? "skip-harvest-prompt-supabase" : "harvest-prompt-supabase-projection",
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

    const zMirror = syncZHarvestMirror({ repoRoot, sourceCommitSha: gitHead });
    stages.push({
      label: "sync-z-harvest-mirror",
      ok: zMirror.ok,
      verdict: zMirror.receipt.verdict,
      zMounted: zMirror.zMounted,
    });
    stages.push(
      runStep(
        "render-index",
        `node scripts/harvest/render-harvest-index.mjs ${harvestId}`,
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

    stages.push(runStep("validate", `node scripts/harvest/validate-harvest.mjs ${harvestId}${allowRepublish ? " --allow-republish" : ""}`, repoRoot));
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
    const promptIndex = upsertPromptHarvestHubIndex({ repoRoot, hubRoot, harvestId, gitHead });
    const promptReg = registerPromptHarvestHubIndex({ hubRoot, gitHead });
    stages.push({
      label: "hub-slices",
      ok: dna.ok && reg.ok && promptReg.ok,
      doNotAdvanceCount: dna.entryCount,
      threadAutopsyIndex: reg.slicePath,
      promptHarvestIndex: promptIndex.slicePath ?? null,
      promptHarvestRecordCount: promptIndex.recordCount ?? 0,
      promptHarvestSkipped: promptIndex.skipped === true,
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

    let promptCatalogHotCache = { ok: false, code: "SKIP" };
    try {
      runStep("prompt-catalog-compile", "npm run prompt-catalog:compile-index", appBuilderRoot, {
        INTELLIGENCE_HUB_ROOT: hubRoot,
        CROSS_AGENT_ROOT: repoRoot,
      });
      promptCatalogHotCache = runAppBuilderJsonScript(
        appBuilderRoot,
        "scripts/hot-cache-platform/publish-dataset.mjs",
        ["--dataset=prompt-catalog", "--json"],
        { INTELLIGENCE_HUB_ROOT: hubRoot, CROSS_AGENT_ROOT: repoRoot },
      );
      stages.push({
        label: "prompt-catalog-hot-cache",
        ok: promptCatalogHotCache.ok !== false,
        generation: promptCatalogHotCache.publicationGeneration ?? null,
      });
    } catch (err) {
      stages.push({
        label: "prompt-catalog-hot-cache",
        ok: false,
        error: String(err.message ?? err),
      });
    }

    let hotRouting = { ok: false, code: "SKIP" };
    try {
      hotRouting = runAppBuilderJsonScript(
        appBuilderRoot,
        "scripts/intelligence-hub/index-freshness/publish-hot-routing-index.mjs",
        ["--json"],
        { INTELLIGENCE_HUB_ROOT: hubRoot },
      );
      stages.push({ label: "hot-routing-index", ok: hotRouting.ok, code: hotRouting.code });
    } catch (err) {
      stages.push({ label: "hot-routing-index", ok: false, error: String(err.message ?? err) });
    }

    let aiCachePublish = { ok: false, code: "SKIP" };
    try {
      const parsed = runAppBuilderJsonScript(
        appBuilderRoot,
        "scripts/intelligence-hub/index-freshness/run-index-freshness-pipeline.mjs",
        ["--json"],
        { INTELLIGENCE_HUB_ROOT: hubRoot },
      );
      aiCachePublish = parsed.receipt?.layers?.zAiCache ?? parsed.aiCachePublish ?? { ok: true };
      stages.push({ label: "z-ai-cache-index", ok: aiCachePublish.ok !== false, code: aiCachePublish.code });
    } catch (err) {
      stages.push({ label: "z-ai-cache-index", ok: false, error: String(err.message ?? err) });
    }

    let hostFanout = { ok: true, code: "SYNC_HOSTS_DISABLED", hosts: [] };
    if (syncHosts) {
      hostFanout = fanoutHostAiCache({
        appBuilderRoot,
        hubRoot,
        syncHosts,
        dryRun: false,
      });
      stages.push({
        label: "host-ai-cache-fanout",
        ok: hostFanout.ok,
        code: hostFanout.code,
        hostCount: hostFanout.hostCount,
        attemptedCount: hostFanout.attemptedCount,
      });
      if (!hostFanout.ok) {
        return {
          ok: false,
          verdict: "HOST_FANOUT_FAIL",
          hostFanout,
          stages,
          errors: [
            `host fanout failed at ${hostFanout.hardFailure?.hostId ?? "unknown"}:${hostFanout.hardFailure?.stage ?? "unknown"}`,
          ],
        };
      }
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
        promptCatalogHotCache,
        zAiCache: aiCachePublish,
        hostFanout,
      },
      stages,
      contentHash: hashCanonicalJson({ harvestId, gitHead, stages }),
    };

    const receiptPath = path.join(runDir, "operational-publication-receipt.json");
    writeJson(receiptPath, receipt);

    let supabaseProjection = { ok: false, code: "SKIP" };
    if (!skipSupabaseProjection) {
      try {
        supabaseProjection = runAppBuilderJsonScript(
          appBuilderRoot,
          "scripts/intelligence-hub/thread-autopsy/project-supabase.mjs",
          [`--harvest-id=${harvestId}`, "--apply", "--json"],
          {
            INTELLIGENCE_HUB_ROOT: hubRoot,
            CAPITALGLASS_CROSS_AGENT_ROOT: repoRoot,
          },
        );
        stages.push({
          label: "thread-autopsy-supabase",
          ok: supabaseProjection.apply?.ok !== false,
          verdict: supabaseProjection.verdict,
          counts: supabaseProjection.counts,
        });
      } catch (err) {
        supabaseProjection = { ok: false, code: "SUPABASE_PROJECTION_FAIL", error: String(err.message ?? err) };
        stages.push({ label: "thread-autopsy-supabase", ok: false, error: supabaseProjection.error });
      }
    }

    receipt.layers.supabaseThreadAutopsy = supabaseProjection;

    let promptSupabaseProjection = { ok: false, code: "SKIP" };
    if (!skipSupabaseProjection) {
      try {
        promptSupabaseProjection = runAppBuilderJsonScript(
          appBuilderRoot,
          "scripts/harvest-prompt-projection/project-harvest-prompts.mjs",
          ["--json"],
          { CROSS_AGENT_ROOT: repoRoot },
        );
        stages.push({
          label: "harvest-prompt-supabase",
          ok: promptSupabaseProjection.ok !== false,
          verdict: promptSupabaseProjection.verdict,
          recordCount: promptSupabaseProjection.recordCount ?? 0,
        });
      } catch (err) {
        promptSupabaseProjection = {
          ok: false,
          code: "SUPABASE_PROMPT_PROJECTION_FAIL",
          error: String(err.message ?? err),
        };
        stages.push({
          label: "harvest-prompt-supabase",
          ok: false,
          error: promptSupabaseProjection.error,
        });
      }
    }
    receipt.layers.supabaseHarvestPrompts = promptSupabaseProjection;

    const receiptJson = readJson(path.join(runDir, "receipt.json"));
    if (receiptJson?.promptHarvest) {
      receipt.layers.promptHarvest = receiptJson.promptHarvest;
    }

    receipt.contentHash = hashCanonicalJson({ harvestId, gitHead, stages });
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
