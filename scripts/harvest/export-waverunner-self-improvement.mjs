#!/usr/bin/env node
/**
 * Export Data-Extraction-ready WaveRunner self-improvement handoff from canonical harvest.
 *
 * Usage:
 *   npm run harvest:export:waverunner-self-improvement -- --harvest-id=<id> --json
 */
import { exportWaverunnerSelfImprovement } from "./lib/waverunner-export-lib.mjs";
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
  const result = exportWaverunnerSelfImprovement({
    harvestId: args.harvestId,
    options: { allowUnvalidated: args.allowUnvalidated },
  });

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
  } else if (result.ok) {
    console.log(`harvest:export:waverunner-self-improvement ${result.verdict}`);
    console.log(`  harvestId=${result.harvestId}`);
    console.log(`  contentHash=${result.contentHash}`);
    console.log(`  candidates=${result.candidateCount}`);
    console.log(`  outDir=${result.outDir}`);
  } else {
    console.error(`harvest:export:waverunner-self-improvement FAIL — ${result.code}`);
    if (result.message) console.error(`  ${result.message}`);
  }

  process.exit(result.ok ? 0 : 1);
}

main();
