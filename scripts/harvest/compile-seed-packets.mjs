#!/usr/bin/env node
/**
 * Compile harvest seed packets into qa-index + hub catalog stubs.
 *
 * Usage:
 *   npm run harvest:compile-seed-packets -- --harvest-id=<id>
 */
import { resolveGitHead } from "../index/lib/git-head.mjs";
import { compileSeedPackets } from "./lib/compile-seed-packets-lib.mjs";
import { REPO_ROOT, HARVEST_ID } from "./lib/paths.mjs";

function parseHarvestId(argv) {
  for (const arg of argv) {
    if (arg.startsWith("--harvest-id=")) return arg.slice("--harvest-id=".length);
  }
  const positional = argv.find((a) => !a.startsWith("-"));
  return positional || HARVEST_ID;
}

function main() {
  const harvestId = parseHarvestId(process.argv.slice(2));
  const gitHead = resolveGitHead(REPO_ROOT);
  const result = compileSeedPackets({ repoRoot: REPO_ROOT, harvestId, gitHead });

  if (!result.ok) {
    console.error("harvest:compile-seed-packets FAIL");
    for (const e of result.errors ?? []) console.error(`  - ${e}`);
    process.exit(1);
  }

  console.log(`harvest:compile-seed-packets PASS mode=${result.mode} seeds=${result.seedCount}`);
  console.log(`  receipt: artifacts/agent-runs/${harvestId}/compile-seed-packets-receipt.json`);
}

main();
