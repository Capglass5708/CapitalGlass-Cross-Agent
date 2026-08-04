#!/usr/bin/env node
/**
 * Phase C — materialize harvest-publication-pointer-v1.json and record L: phase-c receipt.
 * Apply requires PHASE_C_POINTER_APPROVED=1. Never embeds the Git commit SHA in the pointer file.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

import { resolveHubRoot } from "./lib/publish-hub-seed-lib.mjs";
import { materializePhaseCPointer } from "./lib/phase-c-pointer-materialization-lib.mjs";
import { HARVEST_ID, REPO_ROOT } from "./lib/paths.mjs";

function parseArgs(argv) {
  let harvestId = HARVEST_ID;
  let payloadHash = null;
  let hubRoot = resolveHubRoot();
  let repoRoot = REPO_ROOT;
  for (const arg of argv) {
    if (arg.startsWith("--harvest-id=")) harvestId = arg.slice("--harvest-id=".length);
    else if (arg.startsWith("--payload-hash=")) payloadHash = arg.slice("--payload-hash=".length);
    else if (arg.startsWith("--hub-root=")) hubRoot = arg.slice("--hub-root=".length);
    else if (arg.startsWith("--repo-root=")) repoRoot = arg.slice("--repo-root=".length);
  }
  return {
    harvestId,
    payloadHash,
    hubRoot,
    repoRoot,
    apply: argv.includes("--apply"),
    json: argv.includes("--json"),
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.payloadHash) {
    console.error("harvest:materialize-pointer FAIL — --payload-hash is required");
    process.exit(1);
  }

  const result = materializePhaseCPointer({
    hubRoot: args.hubRoot,
    harvestId: args.harvestId,
    payloadHash: args.payloadHash,
    repoRoot: path.resolve(args.repoRoot),
    apply: args.apply,
  });

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`harvest:materialize-pointer ${result.verdict}`);
    if (result.commit?.gitPointerCommit) {
      console.log(`  gitPointerCommit=${result.commit.gitPointerCommit}`);
    }
    if (result.lReceipt?.receiptRel) {
      console.log(`  phaseCReceipt=${result.lReceipt.receiptRel}`);
    }
    if (result.failures?.length) {
      console.log(`  failures=${result.failures.join(",")}`);
    }
  }

  if (!result.ok) {
    process.exit(1);
  }
}

main();
