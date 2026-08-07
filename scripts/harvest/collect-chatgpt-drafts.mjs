#!/usr/bin/env node
/**
 * Inventory ChatGPT draft markdown on chat-gpt-harvest (draft queue).
 * Refreshes work-progress/chatgpt-draft-index.json.
 *
 * Usage:
 *   npm run harvest:collect-chatgpt-drafts
 *   npm run harvest:collect-chatgpt-drafts -- --json
 *   npm run harvest:collect-chatgpt-drafts -- --refresh-index
 */
import path from "node:path";

import { REPO_ROOT } from "./lib/paths.mjs";
import {
  collectChatgptDrafts,
  buildChatgptDraftIndex,
  writeGitDraftIndex,
  GIT_INDEX_PATH,
} from "./lib/chatgpt-draft-collect-lib.mjs";

function parseArgs(argv) {
  return {
    json: argv.includes("--json"),
    refreshIndex: argv.includes("--refresh-index") || !argv.includes("--no-refresh-index"),
  };
}

function main() {
  const { json, refreshIndex } = parseArgs(process.argv.slice(2));
  const drafts = collectChatgptDrafts();
  const index = buildChatgptDraftIndex(drafts);

  if (refreshIndex) {
    writeGitDraftIndex(index);
  }

  if (json) {
    console.log(JSON.stringify(index, null, 2));
  } else {
    console.log("harvest:collect-chatgpt-drafts OK");
    console.log(`  branch=${index.sourceBranch} commit=${index.sourceCommitSha.slice(0, 12)}`);
    console.log(
      `  drafts=${index.counts.total} (observed=${index.counts.observed} advancement=${index.counts.advancement})`,
    );
    console.log(
      `  draftOnly=${index.counts.draftOnly} cursorPartial=${index.counts.cursorPartial} onL=${index.counts.onL ?? 0}`,
    );
    console.log(`  index=${refreshIndex ? path.relative(REPO_ROOT, GIT_INDEX_PATH) : "not written"}`);
    for (const d of drafts) {
      console.log(`  - ${d.harvestId} [${d.lane}] ${d.cursorStage} ${d.draftVerdict} → ${d.draftPath}`);
    }
    console.log("  next: npm run harvest:stage-chatgpt-drafts-on-l (before batch assessor)");
  }
}

main();
