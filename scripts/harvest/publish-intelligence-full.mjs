#!/usr/bin/env node
/**
 * One-shot: make a chat-thread harvest operational on L:, Z:, and C: hot cache.
 *
 * Usage:
 *   npm run harvest:publish-intelligence-full -- --harvest-id=<id>
 *   npm run harvest:publish-intelligence-full -- --harvest-id=<id> --dry-run
 *   npm run harvest:publish-intelligence-full -- --harvest-id=<id> --skip-tests
 *   npm run harvest:publish-intelligence-full -- --harvest-id=<id> --sync-hosts=wesley_work,wesleydesk
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

import { publishIntelligenceFull } from "./lib/publish-intelligence-full-lib.mjs";
import { parseSyncHostsInput } from "./lib/host-ai-cache-fanout-lib.mjs";
import { HARVEST_ID } from "./lib/paths.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function parseArgs(argv) {
  let harvestId = HARVEST_ID;
  let syncHosts = null;
  for (const arg of argv) {
    if (arg.startsWith("--harvest-id=")) harvestId = arg.slice("--harvest-id=".length);
    else if (arg === "--sync-hosts") syncHosts = true;
    else if (arg.startsWith("--sync-hosts=")) syncHosts = arg.slice("--sync-hosts=".length);
  }
  const positional = argv.find((a) => !a.startsWith("-"));
  if (positional) harvestId = positional;
  return {
    harvestId,
    dryRun: argv.includes("--dry-run"),
    skipTests: argv.includes("--skip-tests"),
    skipBlindRetrieval: argv.includes("--skip-blind-retrieval"),
    skipLedgerSync: argv.includes("--skip-ledger-sync"),
    allowRepublish: argv.includes("--allow-republish"),
    allowSupersedeSeedIds: argv
      .filter((a) => a.startsWith("--allow-supersede-seed="))
      .map((a) => a.slice("--allow-supersede-seed=".length)),
    syncHosts: syncHosts === null ? null : parseSyncHostsInput(syncHosts),
    json: argv.includes("--json"),
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const result = publishIntelligenceFull({
    repoRoot: REPO_ROOT,
    harvestId: args.harvestId,
    dryRun: args.dryRun,
    skipTests: args.skipTests,
    skipBlindRetrieval: args.skipBlindRetrieval,
    skipLedgerSync: args.skipLedgerSync,
    allowRepublish: args.allowRepublish,
    allowSupersedeSeedIds: args.allowSupersedeSeedIds,
    syncHosts: args.syncHosts,
  });

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
  } else if (result.dryRun) {
    console.log(`harvest:publish-intelligence-full DRY_RUN harvest=${args.harvestId}`);
    for (const stage of result.plannedStages ?? []) console.log(`  - ${stage}`);
  } else if (result.ok) {
    console.log(`harvest:publish-intelligence-full ${result.verdict} harvest=${args.harvestId}`);
    console.log(`  receipt: ${result.receiptPath}`);
    console.log(`  L: ${result.receipt.intelligenceHubRoot}`);
    console.log(`  seeds: ${result.receipt.layers.lCatalog.seedCount}`);
    if (result.receipt.layers.hostFanout?.hosts?.length) {
      console.log(`  host fanout: ${result.receipt.layers.hostFanout.code}`);
      for (const host of result.receipt.layers.hostFanout.hosts) {
        console.log(`    - ${host.hostId}: ${host.skipped ? "skipped (root unavailable)" : "synced"}`);
      }
    }
  } else {
    console.error(`harvest:publish-intelligence-full FAIL — ${result.verdict}`);
    for (const e of result.errors ?? []) console.error(`  - ${e}`);
    process.exit(1);
  }
}

main();
