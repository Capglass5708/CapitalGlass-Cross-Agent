#!/usr/bin/env node
/**
 * Harvest content-hash freshness — read-only. Never writes Git or republishes harvest layers.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

import { resolveHubRoot } from "./lib/publish-hub-seed-lib.mjs";
import {
  evaluateHarvestContentFreshness,
  HARVEST_FRESHNESS_VERDICTS,
  TARGET_VERDICT,
} from "./lib/harvest-content-freshness-lib.mjs";
import { REPO_ROOT, HARVEST_ID } from "./lib/paths.mjs";

function parseArgs(argv) {
  let harvestId = HARVEST_ID;
  let hubRoot = resolveHubRoot();
  let repoRoot = REPO_ROOT;
  let zCacheRoot = null;
  for (const arg of argv) {
    if (arg.startsWith("--harvest-id=")) harvestId = arg.slice("--harvest-id=".length);
    else if (arg.startsWith("--hub-root=")) hubRoot = arg.slice("--hub-root=".length);
    else if (arg.startsWith("--repo-root=")) repoRoot = arg.slice("--repo-root=".length);
    else if (arg.startsWith("--z-cache-root=")) zCacheRoot = arg.slice("--z-cache-root=".length);
  }
  return { harvestId, hubRoot, repoRoot, zCacheRoot, json: argv.includes("--json") };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const receipt = evaluateHarvestContentFreshness({
    hubRoot: args.hubRoot,
    harvestId: args.harvestId,
    repoRoot: path.resolve(args.repoRoot),
    zCacheRoot: args.zCacheRoot,
  });

  if (args.json) {
    console.log(JSON.stringify(receipt, null, 2));
  } else {
    console.log(`harvest:check-content-freshness ${receipt.harvestVerdict}`);
    console.log(`  coordinationIndex=${receipt.coordinationIndexVerdict}`);
  }

  if (receipt.harvestVerdict !== HARVEST_FRESHNESS_VERDICTS.CURRENT) {
    process.exit(1);
  }
}

main();
