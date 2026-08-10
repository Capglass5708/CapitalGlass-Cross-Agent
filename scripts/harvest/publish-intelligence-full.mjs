#!/usr/bin/env node
/**
 * One-shot: make a chat-thread harvest operational on L:, Z:, and C: hot cache.
 *
 * Usage:
 *   npm run harvest:publish-intelligence-full -- --harvest-id=<id>
 *   npm run harvest:publish-intelligence-full -- --harvest-id=<id> --pipeline=phase-b-v2 --payload-hash=<sha256:...>
 *   npm run harvest:publish-intelligence-full -- --harvest-id=<id> --dry-run
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

import { publishIntelligenceFull } from "./lib/publish-intelligence-full-lib.mjs";
import { publishIntelligenceHardened } from "./lib/publication-hardening-orchestrator.mjs";
import { publishIntelligencePhaseB } from "./lib/publish-intelligence-phase-b-lib.mjs";
import { parseSyncHostsInput } from "./lib/host-ai-cache-fanout-lib.mjs";
import { guardLegacyPublication } from "./lib/harvest-legacy-publication-guard-lib.mjs";
import { HARVEST_ID } from "./lib/paths.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function parseArgs(argv) {
  let harvestId = HARVEST_ID;
  let syncHosts = null;
  let pipeline = "legacy";
  let payloadHash = null;
  let zCacheRoot = null;
  let hubRoot = null;
  for (const arg of argv) {
    if (arg.startsWith("--harvest-id=")) harvestId = arg.slice("--harvest-id=".length);
    else if (arg.startsWith("--pipeline=")) pipeline = arg.slice("--pipeline=".length);
    else if (arg.startsWith("--payload-hash=")) payloadHash = arg.slice("--payload-hash=".length);
    else if (arg.startsWith("--z-cache-root=")) zCacheRoot = arg.slice("--z-cache-root=".length);
    else if (arg.startsWith("--hub-root=")) hubRoot = arg.slice("--hub-root=".length);
    else if (arg === "--sync-hosts") syncHosts = true;
    else if (arg.startsWith("--sync-hosts=")) syncHosts = arg.slice("--sync-hosts=".length);
  }
  const positional = argv.find((a) => !a.startsWith("-"));
  if (positional) harvestId = positional;
  return {
    harvestId,
    pipeline,
    payloadHash,
    zCacheRoot,
    hubRoot,
    dryRun: argv.includes("--dry-run"),
    skipTests: argv.includes("--skip-tests"),
    skipBlindRetrieval: argv.includes("--skip-blind-retrieval"),
    skipLedgerSync: argv.includes("--skip-ledger-sync"),
    skipSupabase: argv.includes("--skip-supabase"),
    allowRepublish: argv.includes("--allow-republish"),
    allowSupersedeSeedIds: argv
      .filter((a) => a.startsWith("--allow-supersede-seed="))
      .map((a) => a.slice("--allow-supersede-seed=".length)),
    syncHosts: syncHosts === null ? null : parseSyncHostsInput(syncHosts),
    json: argv.includes("--json"),
    transactional: argv.includes("--transactional") || process.env.CG_HARVEST_PUBLICATION_HARDENED === "true",
    dryRunOnly: argv.includes("--dry-run-only"),
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.pipeline === "phase-b-v2") {
    if (args.dryRun) {
      const dry = {
        ok: true,
        dryRun: true,
        pipeline: "phase-b-v2",
        harvestId: args.harvestId,
        payloadHash: args.payloadHash,
        plannedStages: [
          "publishLDurableBundle",
          "readDurablePublicationContext",
          "publishZCacheFromL",
          "applySupabaseProjection",
          "writePhaseBOperations",
          "writePointerCandidate",
        ],
        gitMutation: false,
        note: "Phase C Git pointer commit is separate; not executed in phase-b-v2.",
      };
      if (args.json) {
        console.log(JSON.stringify(dry, null, 2));
      } else {
        console.log(`harvest:publish-intelligence-full DRY_RUN pipeline=phase-b-v2 harvest=${args.harvestId}`);
        for (const stage of dry.plannedStages) console.log(`  - ${stage}`);
      }
      return;
    }

    const result = publishIntelligencePhaseB({
      harvestId: args.harvestId,
      payloadHash: args.payloadHash,
      hubRoot: args.hubRoot ?? undefined,
      skipSupabase: args.skipSupabase,
      zCacheRoot: args.zCacheRoot,
    });

    if (args.json) {
      console.log(JSON.stringify(result, null, 2));
    } else if (result.ok) {
      console.log(`harvest:publish-intelligence-full ${result.phaseBVerdict} pipeline=phase-b-v2 harvest=${args.harvestId}`);
      console.log(`  pointer candidate: ${result.operations?.pointerCandidateRel ?? "n/a"}`);
    } else {
      console.error(`harvest:publish-intelligence-full FAIL — ${result.phaseBVerdict ?? result.verdict}`);
      for (const e of result.errors ?? []) console.error(`  - ${e}`);
      process.exit(1);
    }
    return;
  }

  if (args.pipeline !== "legacy") {
    console.error(`harvest:publish-intelligence-full FAIL — unknown pipeline=${args.pipeline}`);
    process.exit(1);
  }

  const legacyGuard = guardLegacyPublication({
    repoRoot: REPO_ROOT,
    harvestId: args.harvestId,
    pipeline: "legacy",
  });
  if (!legacyGuard.ok) {
    if (args.json) {
      console.log(JSON.stringify(legacyGuard, null, 2));
    } else {
      console.error(`harvest:publish-intelligence-full FAIL — ${legacyGuard.verdict}`);
      for (const e of legacyGuard.errors ?? []) console.error(`  - ${e}`);
    }
    process.exit(1);
  }

  const result = args.transactional
    ? publishIntelligenceHardened({
        repoRoot: REPO_ROOT,
        harvestId: args.harvestId,
        dryRunOnly: args.dryRunOnly || args.dryRun,
        skipTests: args.skipTests,
        skipSupabaseProjection: args.skipSupabase,
        allowRepublish: args.allowRepublish,
        allowSupersedeSeedIds: args.allowSupersedeSeedIds,
        syncHosts: args.syncHosts,
      })
    : publishIntelligenceFull({
        repoRoot: REPO_ROOT,
        harvestId: args.harvestId,
        dryRun: args.dryRun,
        skipTests: args.skipTests,
        skipBlindRetrieval: args.skipBlindRetrieval,
        skipLedgerSync: args.skipLedgerSync,
        skipSupabaseProjection: args.skipSupabase,
        allowRepublish: args.allowRepublish,
        allowSupersedeSeedIds: args.allowSupersedeSeedIds,
        syncHosts: args.syncHosts,
      });

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
  } else if (result.dryRun || result.verdict === "DRY_RUN_PASS") {
    console.log(`harvest:publish-intelligence-full DRY_RUN harvest=${args.harvestId} run=${result.runId ?? "n/a"}`);
  } else if (result.ok) {
    console.log(
      `harvest:publish-intelligence-full ${result.verdict ?? result.legacyVerdict ?? result.verdict} harvest=${args.harvestId}`,
    );
    if (result.closeoutPaths?.jsonPath) console.log(`  closeout: ${result.closeoutPaths.jsonPath}`);
    if (result.result?.receiptPath) console.log(`  receipt: ${result.result.receiptPath}`);
  } else {
    console.error(`harvest:publish-intelligence-full FAIL — ${result.verdict}`);
    for (const e of result.errors ?? []) console.error(`  - ${e}`);
    process.exit(1);
  }
}

main();
