#!/usr/bin/env node
/**
 * Copy ChatGPT findings Markdown into harvest run dir as chatgpt-findings-source.md.
 * Canonical artifacts are produced by Cursor validation (manifest, bundle, seeds).
 *
 * Usage:
 *   npm run harvest:ingest-chatgpt-findings -- --input=<findings.md> --harvest-id=<id>
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { HARVEST_ID, REPO_ROOT } from "./lib/paths.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  let input = null;
  let harvestId = HARVEST_ID;
  for (const arg of argv) {
    if (arg.startsWith("--input=")) input = arg.slice("--input=".length);
    else if (arg.startsWith("--harvest-id=")) harvestId = arg.slice("--harvest-id=".length);
  }
  return { input, harvestId };
}

function main() {
  const { input, harvestId } = parseArgs(process.argv.slice(2));
  if (!input) {
    console.error("harvest:ingest-chatgpt-findings FAIL — --input is required");
    process.exit(1);
  }

  const inputPath = path.isAbsolute(input) ? input : path.resolve(process.cwd(), input);
  if (!fs.existsSync(inputPath)) {
    console.error(`harvest:ingest-chatgpt-findings FAIL — input not found: ${inputPath}`);
    process.exit(1);
  }

  const runDir = path.join(REPO_ROOT, "artifacts/agent-runs", harvestId);
  fs.mkdirSync(runDir, { recursive: true });
  const dest = path.join(runDir, "chatgpt-findings-source.md");
  fs.copyFileSync(inputPath, dest);

  console.log("harvest:ingest-chatgpt-findings OK");
  console.log(`  harvestId=${harvestId}`);
  console.log(`  source=${dest}`);
  console.log("  next: Cursor validates receipts, writes harvest-manifest-v1.json + bundle + seeds, then:");
  console.log(`    npm run harvest:record -- ${harvestId}`);
}

main();
