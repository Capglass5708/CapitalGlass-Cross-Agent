#!/usr/bin/env node
import { resolveHubRoot, publishLDurableBundle } from "./lib/l-durable-bundle-lib.mjs";
import { HARVEST_ID } from "./lib/paths.mjs";

function parseArgs(argv) {
  let harvestId = HARVEST_ID;
  let payloadHash = null;
  let hubRoot = resolveHubRoot();
  for (const arg of argv) {
    if (arg.startsWith("--harvest-id=")) harvestId = arg.slice("--harvest-id=".length);
    else if (arg.startsWith("--payload-hash=")) payloadHash = arg.slice("--payload-hash=".length);
    else if (arg.startsWith("--hub-root=")) hubRoot = arg.slice("--hub-root=".length);
  }
  if (!payloadHash) {
    console.error("harvest:publish-l-durable FAIL — --payload-hash is required");
    process.exit(1);
  }
  return { harvestId, payloadHash, hubRoot, json: argv.includes("--json") };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  try {
    const receipt = publishLDurableBundle({
      hubRoot: args.hubRoot,
      harvestId: args.harvestId,
      payloadHash: args.payloadHash,
    });
    if (args.json) {
      console.log(JSON.stringify(receipt, null, 2));
    } else {
      console.log(`harvest:publish-l-durable ${receipt.verdict}`);
      console.log(`  durablePath=${receipt.durablePath}`);
      console.log(`  publicationMethod=${receipt.publicationMethod}`);
    }
    if (receipt.verdict === "NOOP_CURRENT") {
      process.exitCode = 0;
    }
  } catch (error) {
    console.error(`harvest:publish-l-durable FAIL — ${error.message}`);
    process.exit(1);
  }
}

main();
