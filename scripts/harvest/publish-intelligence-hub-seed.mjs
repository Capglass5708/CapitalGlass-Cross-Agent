#!/usr/bin/env node
/**
 * Publish harvest seeds to L: Intelligence Hub (generalized).
 *
 * Usage:
 *   npm run harvest:publish-hub-seed -- --harvest-id=<id>
 */
import fs from "node:fs";
import path from "node:path";

import { resolveGitHead } from "../index/lib/git-head.mjs";
import { compileSeedPackets } from "./lib/compile-seed-packets-lib.mjs";
import { publishHubSeed, resolveHubRoot } from "./lib/publish-hub-seed-lib.mjs";
import {
  registerThreadAutopsyHubIndex,
  syncDoNotAdvanceToHub,
} from "./lib/register-hub-index.mjs";
import { REPO_ROOT, HARVEST_ID, harvestRunDir } from "./lib/paths.mjs";

function parseHarvestId(argv) {
  for (const arg of argv) {
    if (arg.startsWith("--harvest-id=")) return arg.slice("--harvest-id=".length);
  }
  const positional = argv.find((a) => !a.startsWith("-"));
  return positional || HARVEST_ID;
}

function main() {
  const harvestId = parseHarvestId(process.argv.slice(2));
  const gitHead = resolveGitHead(REPO_ROOT);
  const hubRoot = resolveHubRoot();
  const runDir = harvestRunDir(harvestId);

  const compile = compileSeedPackets({ repoRoot: REPO_ROOT, harvestId, gitHead });
  if (!compile.ok && !fs.existsSync(path.join(runDir, "qa-index.json"))) {
    console.error("harvest:publish-hub-seed FAIL — compile failed");
    for (const e of compile.errors ?? []) console.error(`  - ${e}`);
    process.exit(1);
  }

  const publish = publishHubSeed({ repoRoot: REPO_ROOT, harvestId, gitHead, hubRoot });
  if (!publish.ok) {
    console.error("harvest:publish-hub-seed FAIL");
    for (const e of publish.errors ?? []) console.error(`  - ${e}`);
    process.exit(1);
  }

  const register = registerThreadAutopsyHubIndex({ hubRoot: publish.hubRoot, gitHead });
  const dna = syncDoNotAdvanceToHub({ repoRoot: REPO_ROOT, hubRoot: publish.hubRoot });

  console.log(`harvest:publish-hub-seed PUBLISH_PASS sha=${gitHead}`);
  console.log(`  seeds=${publish.publishedIds.length} inserted=${publish.counts.inserted} updated=${publish.counts.updated}`);
  console.log(`  thread-autopsy-index: ${register.slicePath}`);
  console.log(`  do-not-advance entries: ${dna.ok ? dna.entryCount : "SKIP"}`);
  console.log(`  receipt: artifacts/agent-runs/${harvestId}/hub-publication-receipt.json`);
  if (register.errors?.length) {
    for (const e of register.errors) console.warn(`  warn: ${e}`);
  }
}

main();
