#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { validateGitHarvestRetention } from "./lib/harvest-git-retention-lib.mjs";
import { harvestRunDir } from "./lib/phase-c-pointer-materialization-lib.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function parseArgs(argv) {
  let harvestId = null;
  for (const arg of argv) {
    if (arg.startsWith("--harvest-id=")) harvestId = arg.slice("--harvest-id=".length);
    else if (!arg.startsWith("-") && !harvestId) harvestId = arg;
  }
  return { harvestId, json: argv.includes("--json") };
}

function listStagedHarvestFiles(harvestId) {
  const prefix = `artifacts/agent-runs/${harvestId}/`;
  const out = execFileSync("git", ["diff", "--cached", "--name-only"], {
    cwd: REPO_ROOT,
    encoding: "utf8",
  });
  return out
    .split("\n")
    .map((l) => l.trim())
    .filter((rel) => rel.startsWith(prefix));
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.harvestId) {
    console.error("usage: harvest:check-staged-retention --harvest-id=<id> [--json]");
    process.exit(1);
  }

  const staged = listStagedHarvestFiles(args.harvestId);
  const runDir = harvestRunDir(REPO_ROOT, args.harvestId);
  const result = validateGitHarvestRetention({
    repoRoot: REPO_ROOT,
    harvestId: args.harvestId,
    mode: "new",
    stage: "pre-commit",
  });

  const stagedForbidden = staged.filter((rel) => {
    const base = path.basename(rel);
    return (
      base.includes("thread-autopsy") ||
      base.includes("seed-packet") ||
      base === "operational-publication-receipt.json" ||
      base === "graph-extraction.json"
    );
  });

  if (stagedForbidden.length > 0) {
    result.ok = false;
    result.failures = result.failures ?? [];
    for (const rel of stagedForbidden) {
      result.failures.push(`STAGED_FORBIDDEN:${rel}`);
    }
    result.verdict = "BLOCKED_GIT_PAYLOAD_DUPLICATION";
  }

  if (args.json) {
    console.log(JSON.stringify({ ...result, stagedFiles: staged }, null, 2));
  } else {
    console.log(`harvest:check-staged-retention ${result.verdict}`);
    for (const f of result.failures ?? []) console.error(`  - ${f}`);
  }

  process.exit(result.ok ? 0 : 1);
}

main();
