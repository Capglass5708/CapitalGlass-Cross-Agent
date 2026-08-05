#!/usr/bin/env node
/**
 * Alias for deterministic move to L: canonical chat-gpt-harvest folder.
 * See move-chatgpt-harvest-to-l.mjs — move only, no copy under Intelligence Hub.
 */
import fs from "node:fs";
import path from "node:path";

import { REPO_ROOT } from "./lib/paths.mjs";
import {
  moveChatgptHarvestToL,
  resolveLDriveRoot,
  PASS_VERDICT,
} from "./lib/chatgpt-harvest-deterministic-move-lib.mjs";

const RECEIPT_DIR = path.join(REPO_ROOT, "artifacts/agent-runs/chatgpt-harvest-l-move");

function parseArgs(argv) {
  let lDriveRoot = resolveLDriveRoot();
  for (const arg of argv) {
    if (arg.startsWith("--l-drive-root=")) lDriveRoot = arg.slice("--l-drive-root=".length);
  }
  return {
    lDriveRoot,
    json: argv.includes("--json"),
    dryRun: argv.includes("--dry-run"),
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  try {
    const receipt = moveChatgptHarvestToL({
      lDriveRoot: args.lDriveRoot,
      dryRun: args.dryRun,
    });

    if (!args.dryRun && receipt.failureCount === 0) {
      const latestPath = path.join(RECEIPT_DIR, "latest.json");
      fs.mkdirSync(RECEIPT_DIR, { recursive: true });
      fs.writeFileSync(latestPath, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");
    }

    if (args.json) {
      console.log(JSON.stringify(receipt, null, 2));
    } else {
      console.log(`harvest:stage-chatgpt-drafts-on-l ${receipt.verdict}`);
      console.log(`  (deterministic move alias → ${receipt.destinationRoot})`);
      console.log(`  moved=${receipt.movedCount} skipped=${receipt.skippedCount}`);
    }

    if (receipt.verdict !== PASS_VERDICT && receipt.verdict !== "DRY_RUN") {
      process.exit(1);
    }
  } catch (error) {
    console.error(`harvest:stage-chatgpt-drafts-on-l FAIL — ${error.message}`);
    process.exit(1);
  }
}

main();
