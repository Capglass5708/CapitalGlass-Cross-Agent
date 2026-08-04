#!/usr/bin/env node
/**
 * One-shot: make a chat-thread harvest operational on L:, Z:, and C: hot cache.
 *
 * Usage:
 *   npm run harvest:publish-intelligence-full -- --harvest-id=<id>
 *   npm run harvest:publish-intelligence-full -- --harvest-id=<id> --dry-run
 *   npm run harvest:publish-intelligence-full -- --harvest-id=<id> --skip-tests
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

import { publishIntelligenceFull } from "./lib/publish-intelligence-full-lib.mjs";
import { HARVEST_ID } from "./lib/paths.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function parseArgs(argv) {
  let harvestId = HARVEST_ID;
  for (const arg of argv) {
    if (arg.startsWith("--harvest-id=")) harvestId = arg.slice("--harvest-id=".length);
  }
  const positional = argv.find((a) => !a.startsWith("-"));
  if (positional) harvestId = positional;
  return {
    harvestId,
    dryRun: argv.includes("--dry-run"),
    skipTests: argv.includes("--skip-tests"),
    skipBlindRetrieval: argv.includes("--skip-blind-retrieval"),
    skipLedgerSync: argv.includes("--skip-ledger-sync"),
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
  } else {
    console.error(`harvest:publish-intelligence-full FAIL — ${result.verdict}`);
    for (const e of result.errors ?? []) console.error(`  - ${e}`);
    process.exit(1);
  }
}

main();
