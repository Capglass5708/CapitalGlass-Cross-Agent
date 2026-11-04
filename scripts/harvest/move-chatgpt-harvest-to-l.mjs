#!/usr/bin/env node
/**
 * Deterministic move of ChatGPT harvest draft markdown to the Z:/BlackBoxAi canonical folder
 * (L: retired 2026-11-03; script and npm names kept for compatibility).
 *
 * Destination:
 *   Z:\BlackBoxAi\02-catalog\chatgpt-draft-staging\chat-gpt-harvest\
 *   /mnt/z/BlackBoxAi/02-catalog/chatgpt-draft-staging/chat-gpt-harvest/
 *
 * Usage:
 *   npm run harvest:move-chatgpt-harvest-to-l
 *   npm run harvest:move-chatgpt-harvest-to-l -- --json
 *   npm run harvest:move-chatgpt-harvest-to-l -- --dry-run
 */
import fs from "node:fs";
import path from "node:path";

import { REPO_ROOT } from "./lib/paths.mjs";
import {
  moveChatgptHarvestToL,
  resolveZBlackBoxAiRoot,
  PASS_VERDICT,
} from "./lib/chatgpt-harvest-deterministic-move-lib.mjs";

const RECEIPT_DIR = path.join(REPO_ROOT, "artifacts/agent-runs/chatgpt-harvest-l-move");

function parseArgs(argv) {
  let lDriveRoot = resolveZBlackBoxAiRoot();
  for (const arg of argv) {
    if (arg.startsWith("--z-root=")) lDriveRoot = arg.slice("--z-root=".length);
    // Deprecated alias (L: retired 2026-11-03).
    if (arg.startsWith("--l-drive-root=")) lDriveRoot = arg.slice("--l-drive-root=".length);
  }
  return {
    lDriveRoot,
    json: argv.includes("--json"),
    dryRun: argv.includes("--dry-run"),
  };
}

function writeRepoReceipt(receipt) {
  fs.mkdirSync(RECEIPT_DIR, { recursive: true });
  const latestPath = path.join(RECEIPT_DIR, "latest.json");
  fs.writeFileSync(latestPath, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");
  return latestPath;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  try {
    const receipt = moveChatgptHarvestToL({
      lDriveRoot: args.lDriveRoot,
      dryRun: args.dryRun,
    });

    const repoReceiptPath =
      args.dryRun || receipt.failureCount > 0 ? null : writeRepoReceipt(receipt);

    if (args.json) {
      console.log(JSON.stringify({ ...receipt, repoReceiptPath }, null, 2));
    } else {
      console.log(`harvest:move-chatgpt-harvest-to-l ${receipt.verdict}`);
      console.log(`  destination=${receipt.destinationRoot}`);
      console.log(
        `  moved=${receipt.movedCount} skipped=${receipt.skippedCount} failures=${receipt.failureCount}`,
      );
      if (repoReceiptPath) {
        console.log(`  repoReceipt=${path.relative(REPO_ROOT, repoReceiptPath)}`);
      }
      for (const m of receipt.moved) {
        console.log(`  moved ${m.sourcePath} -> ${m.destinationPath}`);
      }
    }

    if (receipt.verdict !== PASS_VERDICT && receipt.verdict !== "DRY_RUN") {
      process.exit(1);
    }
  } catch (error) {
    console.error(`harvest:move-chatgpt-harvest-to-l FAIL — ${error.message}`);
    process.exit(1);
  }
}

main();
