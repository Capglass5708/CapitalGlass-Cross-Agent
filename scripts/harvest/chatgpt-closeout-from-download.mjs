#!/usr/bin/env node
/**
 * Orchestrate ChatGPT download → Git publish → ingest → expand (stops before HARVEST_COMPLETE).
 */
import { execSync } from "node:child_process";

import { resolveHarvestIdFromProcessArgv } from "./lib/resolve-harvest-id.mjs";
import { REPO_ROOT } from "./lib/paths.mjs";

function parseInput(argv) {
  for (const arg of argv) {
    if (arg.startsWith("--input=")) return arg.slice("--input=".length);
  }
  return null;
}

function run(cmd) {
  execSync(cmd, { cwd: REPO_ROOT, stdio: "inherit", env: { ...process.env } });
}

function main() {
  const { harvestId } = resolveHarvestIdFromProcessArgv();
  const input = parseInput(process.argv.slice(2));
  if (!input) {
    console.error("harvest:chatgpt-closeout-from-download FAIL — --input required");
    process.exit(1);
  }

  const apply = process.argv.includes("--apply");
  const publishCmd = apply
    ? `node scripts/harvest/chatgpt-publish-draft.mjs --input=${JSON.stringify(input)} --harvest-id=${harvestId} --apply`
    : `node scripts/harvest/chatgpt-publish-draft.mjs --input=${JSON.stringify(input)} --harvest-id=${harvestId}`;

  console.log(`harvest:chatgpt-closeout-from-download — ${harvestId}`);
  run(publishCmd);
  run(`node scripts/harvest/chatgpt-git-gate.mjs --harvest-id=${harvestId} --dry-run`);
  run(`node scripts/harvest/ingest-chatgpt-findings.mjs --input=${JSON.stringify(input)} --harvest-id=${harvestId}`);
  try {
    run(`node scripts/harvest/run-duplication-preflight.mjs --harvest-id=${harvestId}`);
  } catch {
    console.warn("harvest:chatgpt-closeout-from-download — duplication preflight skipped or failed (non-fatal in bridge)");
  }
  try {
    run(`node scripts/harvest/collect-chatgpt-drafts.mjs`);
  } catch {
    console.warn("harvest:chatgpt-closeout-from-download — collect-chatgpt-drafts skipped");
  }

  console.log("harvest:chatgpt-closeout-from-download OK — stopped before HARVEST_COMPLETE");
  console.log("  next: Cursor validates manifest/bundle, then npm run harvest:record -- --harvest-id=" + harvestId);
}

main();
