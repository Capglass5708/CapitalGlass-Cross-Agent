#!/usr/bin/env node
/**
 * Phase C preparation only — reads L: pointer candidate and validates Phase B state.
 * Does not commit Git pointers or trigger republication.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { resolveHubRoot } from "./lib/l-durable-bundle-lib.mjs";
import { readPointerCandidate } from "./lib/publication-pointer-candidate-lib.mjs";
import { PHASE_B_VERDICTS } from "./lib/publication-layer-verdict-lib.mjs";
import { HARVEST_ID } from "./lib/paths.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const GIT_POINTER_FILENAME = "harvest-publication-pointer-v1.json";

function parseArgs(argv) {
  let harvestId = HARVEST_ID;
  let payloadHash = null;
  let hubRoot = resolveHubRoot();
  for (const arg of argv) {
    if (arg.startsWith("--harvest-id=")) harvestId = arg.slice("--harvest-id=".length);
    else if (arg.startsWith("--payload-hash=")) payloadHash = arg.slice("--payload-hash=".length);
    else if (arg.startsWith("--hub-root=")) hubRoot = arg.slice("--hub-root=".length);
  }
  return {
    harvestId,
    payloadHash,
    hubRoot,
    dryRun: argv.includes("--dry-run"),
    json: argv.includes("--json"),
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.payloadHash) {
    console.error("harvest:materialize-pointer FAIL — --payload-hash is required");
    process.exit(1);
  }

  const candidate = readPointerCandidate(args.hubRoot, args.harvestId, args.payloadHash);
  if (!candidate) {
    console.error("harvest:materialize-pointer FAIL — pointer candidate missing on L:");
    process.exit(1);
  }

  if (candidate.receiptCommit !== null) {
    console.error("harvest:materialize-pointer FAIL — receiptCommit must be null before Phase C");
    process.exit(1);
  }

  const allowedVerdicts = [PHASE_B_VERDICTS.COMPLETE, PHASE_B_VERDICTS.NOOP];
  if (!allowedVerdicts.includes(candidate.phaseBVerdict)) {
    console.error(
      `harvest:materialize-pointer FAIL — phaseBVerdict=${candidate.phaseBVerdict} (requires PHASE_B_COMPLETE or NOOP_CURRENT)`,
    );
    process.exit(1);
  }

  const gitPointerPath = path.join(
    REPO_ROOT,
    "artifacts/agent-runs",
    args.harvestId,
    GIT_POINTER_FILENAME,
  );

  const materialization = {
    verdict: "POINTER_CANDIDATE_VALID",
    harvestId: args.harvestId,
    payloadHash: args.payloadHash,
    candidatePath: candidate,
    plannedGitPointerPath: path.relative(REPO_ROOT, gitPointerPath),
    receiptCommit: null,
    note: "Phase C commits harvest-publication-pointer-v1.json separately; not executed automatically.",
  };

  if (args.dryRun) {
    materialization.dryRun = true;
    materialization.wouldWrite = gitPointerPath;
  }

  if (args.json) {
    console.log(JSON.stringify(materialization, null, 2));
  } else {
    console.log(`harvest:materialize-pointer ${materialization.verdict}`);
    console.log(`  candidate harvestId=${args.harvestId}`);
    console.log(`  planned path=${materialization.plannedGitPointerPath}`);
    console.log(`  receiptCommit remains null until Phase C commit`);
  }
}

main();
