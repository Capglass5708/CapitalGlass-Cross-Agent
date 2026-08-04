#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";

import { resolveHubRoot } from "./lib/l-durable-bundle-lib.mjs";
import {
  createDefaultLDurablePublisher,
  createDefaultLayerVerifier,
  createDefaultOperationWriter,
  createDefaultSupabaseProjector,
  createDefaultZPublisher,
  runPhaseBPublication,
} from "./lib/phase-b-publication-orchestrator-lib.mjs";
import { HARVEST_ID } from "./lib/paths.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function parseArgs(argv) {
  let harvestId = HARVEST_ID;
  let payloadHash = null;
  let hubRoot = resolveHubRoot();
  for (const arg of argv) {
    if (arg.startsWith("--harvest-id=")) harvestId = arg.slice("--harvest-id=".length);
    else if (arg.startsWith("--payload-hash=")) payloadHash = arg.slice("--payload-hash=".length);
    else if (arg.startsWith("--hub-root=")) hubRoot = arg.slice("--hub-root=".length);
    else if (arg.startsWith("--z-cache-root=")) {
      // consumed via env below
    }
  }
  const zCacheRoot = argv.find((a) => a.startsWith("--z-cache-root="))?.slice("--z-cache-root=".length);
  return {
    harvestId,
    payloadHash,
    hubRoot,
    zCacheRoot,
    skipSupabase: argv.includes("--skip-supabase"),
    json: argv.includes("--json"),
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.payloadHash) {
    console.error("harvest:run-phase-b FAIL — --payload-hash is required");
    process.exit(1);
  }

  const zOptions = args.zCacheRoot ? { zCacheRoot: args.zCacheRoot } : {};
  const supabaseOptions = args.skipSupabase ? { skipApply: true } : {};

  try {
    const result = runPhaseBPublication({
      hubRoot: args.hubRoot,
      harvestId: args.harvestId,
      payloadHash: args.payloadHash,
      skipSupabase: args.skipSupabase,
      lDurablePublisher: createDefaultLDurablePublisher(),
      zPublisher: createDefaultZPublisher(zOptions),
      supabaseProjector: createDefaultSupabaseProjector(supabaseOptions),
      layerVerifier: createDefaultLayerVerifier(),
      operationWriter: createDefaultOperationWriter(),
    });

    if (args.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(`harvest:run-phase-b ${result.phaseBVerdict}`);
      console.log(`  harvestId=${result.harvestId}`);
      console.log(`  payloadHash=${result.payloadHash}`);
      console.log(`  pointerCandidate=${result.operations?.pointerCandidateRel ?? "n/a"}`);
    }

    if (!result.ok && result.phaseBVerdict !== "NOOP_CURRENT") {
      process.exit(1);
    }
  } catch (error) {
    console.error(`harvest:run-phase-b FAIL — ${error.message}`);
    process.exit(1);
  }
}

main();
