#!/usr/bin/env node
/**
 * Sync Harvest protocol docs to repo harvest/ mirror and Z:\Capital-Glass-Dev\Harvest when mounted.
 * npm run harvest:sync-z-mirror
 */
import { execSync } from "node:child_process";

import { REPO_ROOT } from "./lib/paths.mjs";
import { syncZHarvestMirror } from "./lib/z-harvest-mirror-lib.mjs";

function gitHead(repoRoot) {
  try {
    return execSync("git rev-parse HEAD", { cwd: repoRoot, encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

function main() {
  const json = process.argv.includes("--json");
  const repoMirrorOnly = process.argv.includes("--repo-mirror-only");
  const result = syncZHarvestMirror({
    repoRoot: REPO_ROOT,
    sourceCommitSha: gitHead(REPO_ROOT),
    requireZPublication: !repoMirrorOnly,
  });

  if (json) {
    console.log(JSON.stringify(result.receipt, null, 2));
  } else {
    console.log(`harvest:sync-z-mirror ${result.receipt.verdict}`);
    console.log(`  repoMirror=${result.receipt.repoMirrorRoot}`);
    console.log(`  zMounted=${result.zMounted}`);
    console.log(`  updated=${result.receipt.updatedCount}/${result.receipt.fileCount}`);
    if (result.receipt.errors.length) {
      for (const err of result.receipt.errors) console.error(`  error: ${err}`);
    }
  }

  process.exit(result.ok ? 0 : 1);
}

main();
