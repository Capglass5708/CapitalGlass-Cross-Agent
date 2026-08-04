#!/usr/bin/env node
import process from "node:process";

import { validateGitHarvestRetention, TARGET_VERDICT } from "./lib/harvest-git-retention-lib.mjs";

function parseArgs(argv) {
  const args = {
    repoRoot: null,
    harvestId: null,
    mode: "new",
    json: false,
  };
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--json") args.json = true;
    else if (token === "--repo") args.repoRoot = argv[++i];
    else if (token === "--harvest") args.harvestId = argv[++i];
    else if (token === "--mode") args.mode = argv[++i];
  }
  return args;
}

const args = parseArgs(process.argv);
if (!args.repoRoot || !args.harvestId) {
  console.error(
    "usage: harvest:check-git-retention --repo <path> --harvest <id> [--mode new|historical] [--json]",
  );
  process.exit(2);
}

const result = validateGitHarvestRetention({
  repoRoot: args.repoRoot,
  harvestId: args.harvestId,
  mode: args.mode,
});

const payload = { targetVerdict: TARGET_VERDICT, ...result };
if (args.json) {
  console.log(JSON.stringify(payload, null, 2));
} else {
  console.log(`harvest:check-git-retention ${result.verdict}`);
}

process.exit(result.ok ? 0 : 1);
