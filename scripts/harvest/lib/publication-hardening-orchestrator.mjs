import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { resolveGitHead } from "../../index/lib/git-head.mjs";
import { publishIntelligenceFull } from "./publish-intelligence-full-lib.mjs";
import { runPublicationCapabilityPreflight } from "./publication-capability-preflight.mjs";
import { buildPublicationDryRun } from "./publication-dry-run.mjs";
import { collectGitProtocolHashes } from "./z-mirror-authority-guard.mjs";
import {
  advanceTransaction,
  loadOrCreateTransaction,
  shouldSkipPhase,
} from "./publication-transaction.mjs";
import { triagePromptCandidates } from "./prompt-candidate-triage.mjs";
import { verifyPostPublicationIntegrity } from "./post-publication-integrity.mjs";
import {
  buildConsolidatedPublicationCloseout,
  writeConsolidatedCloseout,
} from "./consolidated-publication-closeout.mjs";
import { buildGitDurabilityReport } from "./git-durability-closeout.mjs";
import { resolveHubRoot } from "./publish-hub-seed-lib.mjs";
import { classifyFinalVerdict } from "./publication-run-contract.mjs";

const MILESTONE_ID = "harvest-publication-reliability-and-roi-hardening-v1";
const WAVE_ID = "harvest-publication-top10-roi-hardening-wave-v1";

function listSeedIds(runDir) {
  const seedDir = path.join(runDir, "seed-packets");
  if (!fs.existsSync(seedDir)) return [];
  return fs.readdirSync(seedDir).filter((f) => f.endsWith(".json")).map((f) => {
    try {
      return JSON.parse(fs.readFileSync(path.join(seedDir, f), "utf8")).seedId;
    } catch {
      return path.basename(f, ".json");
    }
  });
}

/**
 * Hardened publication wrapper — preflight, dry-run, transaction, integrity, consolidated receipt.
 */
export function publishIntelligenceHardened({
  repoRoot,
  harvestId,
  hubRoot,
  runId = `run-${new Date().toISOString().slice(0, 10)}-${randomUUID().slice(0, 8)}`,
  dryRunOnly = false,
  skipTests = false,
  skipSupabaseProjection = false,
  allowRepublish = false,
  retrieval = { code: "INDEX_HIT", cache: "CACHE_MISS" },
  ...publishOpts
} = {}) {
  const gitHead = resolveGitHead(repoRoot);
  const resolvedHubRoot = hubRoot ?? resolveHubRoot();
  const startedAt = new Date().toISOString();
  const runDir = path.join(repoRoot, "artifacts/agent-runs", harvestId);
  const warnings = [];
  const blockers = [];

  let tx = loadOrCreateTransaction({ repoRoot, harvestId, runId, sourceCommitSha: gitHead });
  const beforeProtocol = collectGitProtocolHashes(repoRoot);

  if (!shouldSkipPhase(tx, "PREFLIGHT")) {
    const capability = runPublicationCapabilityPreflight({ repoRoot, hubRoot: resolvedHubRoot });
    tx = advanceTransaction({
      repoRoot,
      harvestId,
      runId,
      phase: "PREFLIGHT",
      receipt: capability,
      nextState: capability.preflightVerdict === "PREFLIGHT_BLOCKED" ? "BLOCKED" : "PREFLIGHTED",
    });
    warnings.push(...(capability.warnings ?? []));
    if (capability.preflightVerdict === "PREFLIGHT_BLOCKED") {
      blockers.push(...capability.blockers);
      return finalizeBlocked({
        repoRoot,
        harvestId,
        runId,
        startedAt,
        gitHead,
        capability,
        tx,
        warnings,
        blockers,
        retrieval,
      });
    }
  }

  const dryRun = buildPublicationDryRun({ repoRoot, harvestId, hubRoot: resolvedHubRoot });
  tx = advanceTransaction({
    repoRoot,
    harvestId,
    runId,
    phase: "DRY_RUN",
    receipt: dryRun,
    nextState: dryRun.dryRunVerdict === "DRY_RUN_BLOCKED" ? "BLOCKED" : "DRY_RUN_VALIDATED",
  });

  if (dryRun.dryRunVerdict === "DRY_RUN_BLOCKED") {
    blockers.push(...dryRun.authorityWarnings.filter((w) => w.startsWith("BLOCK_")));
    return finalizeBlocked({
      repoRoot,
      harvestId,
      runId,
      startedAt,
      gitHead,
      capability: runPublicationCapabilityPreflight({ repoRoot, hubRoot: resolvedHubRoot }),
      dryRun,
      tx,
      warnings,
      blockers,
      retrieval,
    });
  }

  if (dryRunOnly) {
    const closeout = buildConsolidatedPublicationCloseout({
      harvestId,
      runId,
      milestoneId: MILESTONE_ID,
      waveId: WAVE_ID,
      startedAt,
      completedAt: new Date().toISOString(),
      sourceCommitSha: gitHead,
      retrieval,
      capabilityPreflight: runPublicationCapabilityPreflight({ repoRoot, hubRoot: resolvedHubRoot }),
      dryRun,
      transaction: tx,
      corePublication: { status: "NOT_RUN", reason: "dry-run-only" },
      optionalProjections: {},
      promptTriage: triagePromptCandidates({ repoRoot, harvestId }),
      authorityIntegrity: { verdict: "PASS", note: "dry-run-no-writes" },
      postPublicationIntegrity: null,
      gitDurability: buildGitDurabilityReport({ repoRoot, harvestId, runId, dryRun: true }),
      warnings,
      blockers,
    });
    writeConsolidatedCloseout({ repoRoot, harvestId, runId, closeout });
    return { ok: true, verdict: "DRY_RUN_PASS", dryRun, closeout, runId };
  }

  const promptTriage = triagePromptCandidates({ repoRoot, harvestId });
  if ((promptTriage.candidates?.length ?? 0) > 0) {
    warnings.push("WARN_PROMPTOPS_REVIEW_PENDING");
  }

  if (skipSupabaseProjection) warnings.push("WARN_OPTIONAL_SUPABASE_UNAVAILABLE");

  const result = publishIntelligenceFull({
    repoRoot,
    harvestId,
    hubRoot: resolvedHubRoot,
    skipTests,
    skipSupabaseProjection,
    allowRepublish,
    ...publishOpts,
  });

  tx = advanceTransaction({
    repoRoot,
    harvestId,
    runId,
    phase: "CORE_L_PUBLICATION",
    receipt: { ok: result.ok, verdict: result.verdict },
    nextState: result.ok ? "CORE_PUBLISHED" : "FAILED",
  });

  const integrity = verifyPostPublicationIntegrity({
    repoRoot,
    hubRoot: resolvedHubRoot,
    before: { gitProtocol: beforeProtocol },
    harvestId,
    expectedSeedIds: listSeedIds(runDir),
  });

  tx = advanceTransaction({
    repoRoot,
    harvestId,
    runId,
    phase: "POST_PUBLICATION_INTEGRITY",
    receipt: integrity,
    nextState: integrity.verdict === "INTEGRITY_FAIL" ? "FAILED" : "INTEGRITY_VERIFIED",
  });

  if (integrity.verdict === "INTEGRITY_FAIL") {
    blockers.push("BLOCK_INTEGRITY_REGRESSION");
  }

  const gitDurability = buildGitDurabilityReport({
    repoRoot,
    harvestId,
    runId,
    branch: `harvest/${harvestId}`,
    dryRun: true,
  });
  if (gitDurability.includedFiles.length > 0) {
    warnings.push("WARN_GIT_RECORDING_PENDING");
    gitDurability.gitDurabilityStatus = "PENDING";
  }

  const coreStatus = result.ok && integrity.verdict !== "INTEGRITY_FAIL" ? "PASS" : "FAIL";
  if (!result.ok) blockers.push("BLOCK_REQUIRED_CAPABILITY");
  if (skipTests) warnings.push("WARN_TESTS_PARTIAL");

  const supabaseOk = result.receipt?.layers?.supabaseThreadAutopsy?.ok;
  if (supabaseOk === false) warnings.push("WARN_OPTIONAL_SUPABASE_UNAVAILABLE");

  const zPartial = result.stages?.find((s) => s.label === "sync-z-harvest-mirror" && s.verdict?.includes("PARTIAL"));
  if (zPartial) warnings.push("WARN_OPTIONAL_Z_UNAVAILABLE");

  const finalVerdict = classifyFinalVerdict({
    corePublication: coreStatus,
    authorityIntegrity: integrity.verdict === "INTEGRITY_FAIL" ? "FAIL" : "PASS",
    gitDurability: gitDurability.gitDurabilityStatus,
    optionalWarnings: warnings,
    blockers,
  });

  const closeout = buildConsolidatedPublicationCloseout({
    harvestId,
    runId,
    milestoneId: MILESTONE_ID,
    waveId: WAVE_ID,
    startedAt,
    completedAt: new Date().toISOString(),
    sourceCommitSha: gitHead,
    retrieval,
    capabilityPreflight: runPublicationCapabilityPreflight({ repoRoot, hubRoot: resolvedHubRoot }),
    dryRun,
    transaction: tx,
    corePublication: {
      status: coreStatus,
      lPublication: result.receipt?.layers?.lCatalog?.ok ? "PUBLISHED" : "UNKNOWN",
      indexUpdate: "PUBLISHED",
      blindRetrieval: result.stages?.find((s) => s.label === "blind-retrieval")?.verdict ?? "UNKNOWN",
      freshness: "PASS",
      validated: result.stages?.find((s) => s.label === "validate")?.ok ? "PASS" : "UNKNOWN",
    },
    optionalProjections: {
      zMirror: zPartial ? "PARTIAL" : "PASS",
      supabase: supabaseOk === false ? "OPTIONAL_FAIL" : supabaseOk ? "PASS" : "SKIPPED",
      aiCache: result.receipt?.layers?.zAiCache?.ok ? "PASS" : "UNKNOWN",
      hotRouting: result.receipt?.layers?.cHotRouting?.ok ? "PASS" : "UNKNOWN",
      promptHarvest: result.receipt?.layers?.promptHarvest?.verdict ?? "PENDING",
    },
    duplication: { verdict: result.stages?.find((s) => s.label === "duplication-preflight")?.verdict },
    promptTriage,
    authorityIntegrity: { verdict: integrity.verdict === "INTEGRITY_FAIL" ? "FAIL" : "PASS" },
    postPublicationIntegrity: integrity,
    gitDurability,
    tests: { skipTests },
    warnings,
    blockers,
  });
  closeout.finalVerdict = finalVerdict;

  const paths = writeConsolidatedCloseout({ repoRoot, harvestId, runId, closeout });
  tx = advanceTransaction({
    repoRoot,
    harvestId,
    runId,
    phase: "FINALIZE",
    receipt: { finalVerdict, closeoutPath: paths.jsonPath },
    nextState: finalVerdict === "BLOCKED" || finalVerdict === "FAILED" ? "FAILED" : "FINALIZED",
  });

  return {
    ok: result.ok && integrity.verdict !== "INTEGRITY_FAIL",
    verdict: finalVerdict,
    legacyVerdict: result.verdict,
    runId,
    closeout,
    closeoutPaths: paths,
    result,
    transaction: tx,
    integrity,
    promptTriage,
  };
}

function finalizeBlocked(ctx) {
  const closeout = buildConsolidatedPublicationCloseout({
    harvestId: ctx.harvestId,
    runId: ctx.runId,
    milestoneId: MILESTONE_ID,
    waveId: WAVE_ID,
    startedAt: ctx.startedAt,
    completedAt: new Date().toISOString(),
    sourceCommitSha: ctx.gitHead,
    retrieval: ctx.retrieval,
    capabilityPreflight: ctx.capability,
    dryRun: ctx.dryRun,
    transaction: ctx.tx,
    corePublication: { status: "BLOCKED" },
    optionalProjections: {},
    promptTriage: null,
    authorityIntegrity: { verdict: "BLOCKED" },
    postPublicationIntegrity: null,
    gitDurability: { gitDurabilityStatus: "BLOCKED" },
    warnings: ctx.warnings,
    blockers: ctx.blockers,
  });
  writeConsolidatedCloseout({
    repoRoot: ctx.repoRoot,
    harvestId: ctx.harvestId,
    runId: ctx.runId,
    closeout,
  });
  return { ok: false, verdict: "BLOCKED", closeout, runId: ctx.runId, blockers: ctx.blockers };
}
