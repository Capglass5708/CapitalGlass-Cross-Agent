#!/usr/bin/env node
/**
 * Reconcile owner-repo-boundary-index from harvest-packet-registry authority.
 */
import { resolveHarvestIdFromProcessArgv } from "./lib/resolve-harvest-id.mjs";
import { reconcileRegistryBoundary } from "./lib/reconcile-registry-boundary-lib.mjs";
import { REPO_ROOT } from "./lib/paths.mjs";
import fs from "node:fs";
import path from "node:path";

function main() {
  let harvestId = null;
  try {
    ({ harvestId } = resolveHarvestIdFromProcessArgv({ allowReferenceDefault: true }));
  } catch {
    harvestId = null;
  }

  const receipt = reconcileRegistryBoundary({
    repoRoot: REPO_ROOT,
    latestHarvestId: harvestId,
  });

  const outDir = harvestId
    ? path.join(REPO_ROOT, "artifacts/agent-runs", harvestId)
    : path.join(REPO_ROOT, "work-progress");
  fs.mkdirSync(outDir, { recursive: true });
  const receiptPath = path.join(outDir, "registry-boundary-reconcile-receipt.json");
  fs.writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");

  if (!receipt.packetIdsMatch) {
    console.error("harvest:reconcile-registry-boundary FAIL — packet IDs still mismatch");
    process.exit(1);
  }

  console.log("harvest:reconcile-registry-boundary OK");
  console.log(`  registryCount=${receipt.registryCount} boundaryAfter=${receipt.boundaryAfter}`);
  console.log(`  rowsAdded=${receipt.rowsAdded} rowsUpdated=${receipt.rowsUpdated} orphansRemoved=${receipt.orphansRemoved}`);
}

main();
