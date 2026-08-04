#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";

import { validatePrGovernance } from "./lib/harvest-pr-governance-lib.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function parseArgs(argv) {
  const args = { baseRef: null, headRef: "HEAD", json: false };
  for (const arg of argv) {
    if (arg.startsWith("--base-ref=")) args.baseRef = arg.slice("--base-ref=".length);
    else if (arg.startsWith("--head-ref=")) args.headRef = arg.slice("--head-ref=".length);
    else if (arg === "--json") args.json = true;
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const result = validatePrGovernance({
    repoRoot: REPO_ROOT,
    baseRef: args.baseRef,
    headRef: args.headRef,
  });

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`harvest:check-pr-governance ${result.verdict}`);
    console.log(`  base=${result.baseRef} head=${result.headRef} governed=${result.governedChangeCount}`);
    for (const f of result.failures) console.error(`  - ${f}`);
  }

  process.exit(result.ok ? 0 : 1);
}

main();
