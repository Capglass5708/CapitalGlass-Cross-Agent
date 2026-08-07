#!/usr/bin/env node
/**
 * Merge harvest manifest packets into harvest-intelligence-index.json (non-destructive).
 */
import fs from "node:fs";

import { resolveHarvestIdFromProcessArgv } from "./lib/resolve-harvest-id.mjs";
import {
  mergeManifestIntoIntelligenceIndex,
  writeMergeReceipt,
} from "./lib/intelligence-index-lib.mjs";
import { manifestPath, REPO_ROOT } from "./lib/paths.mjs";

function main() {
  const { harvestId } = resolveHarvestIdFromProcessArgv();
  const manifestFile = manifestPath(harvestId);
  if (!fs.existsSync(manifestFile)) {
    console.error(`harvest:merge-intelligence FAIL — missing ${manifestFile}`);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8"));
  const { receipt } = mergeManifestIntoIntelligenceIndex(manifest, { repoRoot: REPO_ROOT });
  const receiptPath = writeMergeReceipt(receipt, harvestId, REPO_ROOT);

  console.log("harvest:merge-intelligence OK");
  console.log(
    `  entities ${receipt.entitiesBefore}→${receipt.entitiesAfter} new=${receipt.newEntities} obs+=${receipt.observationsAdded} deleted=${receipt.deletedEntities}`,
  );
  console.log(`  receipt=${receiptPath}`);
}

main();
