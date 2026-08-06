#!/usr/bin/env node
/**
 * Export Data-Extraction-ready harvest protocol self-learning handoff.
 *
 * Usage:
 *   npm run harvest:export:protocol-self-learning -- --harvest-id=<id> --json
 */
import { exportProtocolSelfLearning } from "./lib/protocol-self-learning-export-lib.mjs";
import { HARVEST_ID } from "./lib/paths.mjs";

function parseArgs(argv) {
  let harvestId = HARVEST_ID;
  let allowUnvalidated = false;
  for (const arg of argv) {
    if (arg.startsWith("--harvest-id=")) harvestId = arg.slice("--harvest-id=".length);
    if (arg === "--allow-unvalidated") allowUnvalidated = true;
  }
  const positional = argv.find((a) => !a.startsWith("-"));
  if (positional) harvestId = positional;
  return { harvestId, allowUnvalidated, json: argv.includes("--json") };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const result = exportProtocolSelfLearning({
    harvestId: args.harvestId,
    options: { allowUnvalidated: args.allowUnvalidated },
  });

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
  } else if (result.ok) {
    console.log(`harvest:export:protocol-self-learning ${result.verdict}`);
    console.log(`  harvestId=${result.harvestId}`);
    console.log(`  contentHash=${result.contentHash}`);
    console.log(`  candidates=${result.candidateCount}`);
  } else {
    console.error(`harvest:export:protocol-self-learning FAIL — ${result.code}`);
    if (result.message) console.error(`  ${result.message}`);
  }

  process.exit(result.ok ? 0 : 1);
}

main();
