#!/usr/bin/env node
/**
 * Read-only layered operational verdict for harvest publication authority.
 */
import path from "node:path";

import { resolveHubRoot } from "./lib/publish-hub-seed-lib.mjs";
import {
  evaluateLayeredOperationalVerdict,
  OPERATIONAL_VERDICTS,
  TARGET_VERDICT,
} from "./lib/harvest-layered-operational-verdict-lib.mjs";
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
  const receipt = evaluateLayeredOperationalVerdict({
    hubRoot: args.hubRoot,
    harvestId: args.harvestId,
    repoRoot: path.resolve(args.repoRoot),
    zCacheRoot: args.zCacheRoot,
  });

  if (args.json) {
    console.log(JSON.stringify(receipt, null, 2));
  } else {
    console.log(`harvest:check-operational-verdict ${receipt.overallVerdict}`);
    console.log(`  target=${receipt.targetVerdict}`);
    console.log(`  coordinationIndex=${receipt.coordinationIndexVerdict}`);
  }

  if (
    receipt.overallVerdict !== OPERATIONAL_VERDICTS.OPERATIONAL &&
    receipt.overallVerdict !== OPERATIONAL_VERDICTS.NOOP
  ) {
    process.exit(1);
  }
}

main();
