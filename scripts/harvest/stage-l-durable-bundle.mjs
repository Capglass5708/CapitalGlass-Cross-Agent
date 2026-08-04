#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { HARVEST_ID, harvestRunDir, REPO_ROOT } from "./lib/paths.mjs";
import { resolveHubRoot, stageLDurableBundle } from "./lib/l-durable-bundle-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  let harvestId = HARVEST_ID;
  let sourceRunDir = null;
  let hubRoot = resolveHubRoot();
  const supersede = [];
  for (const arg of argv) {
    if (arg.startsWith("--harvest-id=")) harvestId = arg.slice("--harvest-id=".length);
    else if (arg.startsWith("--source-run-dir=")) sourceRunDir = arg.slice("--source-run-dir=".length);
    else if (arg.startsWith("--hub-root=")) hubRoot = arg.slice("--hub-root=".length);
    else if (arg.startsWith("--supersedes=")) {
      const [id, priorHash, reason] = arg.slice("--supersedes=".length).split("|");
      supersede.push({ id, priorHash, reason: reason ?? "supersession" });
    }
  }
  const positional = argv.find((a) => !a.startsWith("-"));
  if (positional) harvestId = positional;
  return {
    harvestId,
    sourceRunDir: sourceRunDir ?? harvestRunDir(harvestId),
    hubRoot,
    json: argv.includes("--json"),
    supersedes: supersede,
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  try {
    const result = stageLDurableBundle({
      hubRoot: args.hubRoot,
      sourceRunDir: path.isAbsolute(args.sourceRunDir)
        ? args.sourceRunDir
        : path.join(REPO_ROOT, args.sourceRunDir),
      harvestId: args.harvestId,
      options: { supersedes: args.supersedes },
    });
    if (args.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(`harvest:stage-l-durable ${result.verdict}`);
      console.log(`  harvestId=${result.harvestId}`);
      console.log(`  payloadHash=${result.payloadHash}`);
      console.log(`  stagingPath=${result.stagingPath}`);
    }
  } catch (error) {
    console.error(`harvest:stage-l-durable FAIL — ${error.message}`);
    process.exit(1);
  }
}

main();
