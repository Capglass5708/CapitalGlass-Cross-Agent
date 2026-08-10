#!/usr/bin/env node
/**
 * Fail-closed guard: block legacy publication for real harvest identities.
 *
 * Usage:
 *   npm run harvest:guard-legacy-publication -- --harvest-id=<id>
 *   npm run harvest:guard-legacy-publication -- --harvest-id=<id> --json
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

import { guardLegacyPublication } from "./lib/harvest-legacy-publication-guard-lib.mjs";
import { HARVEST_ID } from "./lib/paths.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function parseArgs(argv) {
  let harvestId = HARVEST_ID;
  for (const arg of argv) {
    if (arg.startsWith("--harvest-id=")) harvestId = arg.slice("--harvest-id=".length);
  }
  const positional = argv.find((a) => !a.startsWith("-"));
  if (positional) harvestId = positional;
  return { harvestId, json: argv.includes("--json") };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const result = guardLegacyPublication({
    repoRoot: REPO_ROOT,
    harvestId: args.harvestId,
    pipeline: "legacy",
  });

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
  } else if (result.ok) {
    console.log(`harvest:guard-legacy-publication ${result.verdict ?? "OK"} harvest=${args.harvestId}`);
  } else {
    console.error(`harvest:guard-legacy-publication FAIL — ${result.verdict}`);
    for (const e of result.errors ?? []) console.error(`  - ${e}`);
    process.exit(1);
  }
}

main();
