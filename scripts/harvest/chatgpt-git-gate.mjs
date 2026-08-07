#!/usr/bin/env node
/**
 * Verify CHATGPT_HARVEST_GIT_GATE for a harvest draft on chat-gpt-harvest branch.
 */
import { resolveHarvestIdFromProcessArgv } from "./lib/resolve-harvest-id.mjs";
import {
  runChatgptGitGate,
  writeGitPublicationReceipt,
} from "./lib/chatgpt-git-gate-lib.mjs";
import { REPO_ROOT } from "./lib/paths.mjs";

const dryRun = process.argv.includes("--dry-run");

function main() {
  const { harvestId } = resolveHarvestIdFromProcessArgv();
  const result = runChatgptGitGate({ harvestId, repoRoot: REPO_ROOT, dryRun });
  const receiptPath = writeGitPublicationReceipt(result.receipt, harvestId, REPO_ROOT);

  if (result.ok) {
    console.log("harvest:chatgpt-git-gate PASS");
    console.log(`  receipt=${receiptPath}`);
    process.exit(0);
  }

  console.error("harvest:chatgpt-git-gate BLOCKED_GIT_PUBLICATION");
  for (const e of result.errors) console.error(`  - ${e}`);
  console.error(`  receipt=${receiptPath}`);
  process.exit(1);
}

main();
