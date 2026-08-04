#!/usr/bin/env node
/**
 * Ingest ChatGPT findings Markdown into Cross-Agent harvest artifacts.
 *
 * Usage:
 *   npm run harvest:ingest-chatgpt-findings -- --input=/path/to/findings.md --harvest-id=harvest-2026-08-04-chatgpt-autopsy-findings-v1
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ingestChatGptFindings } from "./lib/ingest-chatgpt-findings-lib.mjs";
import { resolveGitHead } from "../index/lib/git-head.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function parseArgs(argv) {
  let input = null;
  let harvestId = "harvest-2026-08-04-chatgpt-autopsy-findings-v1";
  for (const arg of argv) {
    if (arg.startsWith("--input=")) input = arg.slice("--input=".length);
    if (arg.startsWith("--harvest-id=")) harvestId = arg.slice("--harvest-id=".length);
  }
  return { input, harvestId, json: argv.includes("--json") };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.input) {
    console.error("harvest:ingest-chatgpt-findings FAIL — --input=<findings.md> required");
    process.exit(1);
  }

  const inputPath = path.resolve(args.input);
  const gitHead = resolveGitHead(REPO_ROOT);
  const result = ingestChatGptFindings({
    repoRoot: REPO_ROOT,
    inputPath,
    harvestId: args.harvestId,
    gitHead,
  });

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`harvest:ingest-chatgpt-findings ${result.ok ? "INGEST_PASS" : "INGEST_PARTIAL"} harvest=${args.harvestId}`);
    console.log(`  runDir: ${result.runDir}`);
    console.log(`  seeds: ${result.seedCount}`);
    for (const step of result.receipt.nextSteps) console.log(`  next: ${step}`);
    for (const e of result.errors) console.error(`  error: ${e}`);
  }

  process.exit(result.ok ? 0 : 1);
}

main();
