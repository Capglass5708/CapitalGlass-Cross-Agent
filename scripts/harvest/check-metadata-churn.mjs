#!/usr/bin/env node
/**
 * Validate proposed harvest Git changes for metadata-only churn / self-pin loops.
 *
 * Usage:
 *   npm run harvest:check-metadata-churn -- --files=a.json,b.json --json
 *   npm run harvest:check-metadata-churn -- --harvest-id=<id> --json
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  scanHarvestRunForRuntimeReceipts,
  validateMetadataChurn,
} from "./lib/harvest-metadata-churn-lib.mjs";
import { HARVEST_ID } from "./lib/paths.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function parseArgs(argv) {
  let harvestId = HARVEST_ID;
  let files = [];
  for (const arg of argv) {
    if (arg.startsWith("--harvest-id=")) harvestId = arg.slice("--harvest-id=".length);
    else if (arg.startsWith("--files=")) {
      files = arg
        .slice("--files=".length)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return { harvestId, files, json: argv.includes("--json") };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const runDir = path.join(REPO_ROOT, "artifacts/agent-runs", args.harvestId);
  const runtimeBlocked = scanHarvestRunForRuntimeReceipts(runDir);
  const files =
    args.files.length > 0
      ? args.files
      : runtimeBlocked.map((name) => path.join("artifacts/agent-runs", args.harvestId, name));

  const result = validateMetadataChurn({ files });
  if (runtimeBlocked.length > 0 && result.ok) {
    result.ok = false;
    result.verdict = "BLOCKED_RUNTIME_RECEIPT_IN_GIT";
    result.failures = [
      ...result.failures,
      ...runtimeBlocked.map((name) => `BLOCKED_RUNTIME_RECEIPT_IN_GIT:${name}`),
    ];
  }

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
  } else if (result.ok) {
    console.log(`harvest:check-metadata-churn ${result.verdict}`);
  } else {
    console.error(`harvest:check-metadata-churn FAIL — ${result.verdict}`);
    for (const f of result.failures ?? []) console.error(`  - ${f}`);
    process.exit(1);
  }

  if (!result.ok) process.exit(1);
}

main();
