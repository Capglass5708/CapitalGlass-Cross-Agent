#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";

import { guardLegacyPublication } from "./lib/harvest-legacy-publication-guard-lib.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function parseArgs(argv) {
  let harvestId = null;
  let pipeline = "legacy";
  for (const arg of argv) {
    if (arg.startsWith("--harvest-id=")) harvestId = arg.slice("--harvest-id=".length);
    else if (arg.startsWith("--pipeline=")) pipeline = arg.slice("--pipeline=".length);
    else if (!arg.startsWith("-") && !harvestId) harvestId = arg;
  }
  return { harvestId, pipeline, json: argv.includes("--json") };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.harvestId) {
    console.error("usage: harvest:guard-legacy-publication --harvest-id=<id> [--pipeline=legacy] [--json]");
    process.exit(1);
  }

  const result = guardLegacyPublication({
    repoRoot: REPO_ROOT,
    harvestId: args.harvestId,
    pipeline: args.pipeline,
  });

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
  } else if (result.ok) {
    console.log(`harvest:guard-legacy-publication ${result.verdict ?? "PASS"}`);
  } else {
    console.error(`harvest:guard-legacy-publication ${result.verdict}`);
    for (const e of result.errors ?? []) console.error(`  - ${e}`);
  }

  process.exit(result.ok ? 0 : 1);
}

main();
