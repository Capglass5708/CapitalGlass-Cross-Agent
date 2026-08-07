#!/usr/bin/env node
/**
 * harvest:expand-intelligence — lossless ChatGPT findings expansion (P1-A).
 */
import fs from "node:fs";
import path from "node:path";

import {
  expandIntelligenceFromSource,
  mergeExpansionIntoIntelligenceIndex,
  writeExpansionArtifacts,
} from "./lib/expand-intelligence-lib.mjs";
import { saveUnmodeledQueue } from "./lib/unmodeled-intelligence-queue-lib.mjs";
import { resolveHarvestIdFromProcessArgv } from "./lib/resolve-harvest-id.mjs";
import { REPO_ROOT } from "./lib/paths.mjs";

function parseArgs(argv) {
  const out = { harvestId: null, source: null, json: false };
  for (const arg of argv) {
    if (arg === "--json") out.json = true;
    else if (arg.startsWith("--harvest-id=")) out.harvestId = arg.slice("--harvest-id=".length);
    else if (arg.startsWith("--source=")) out.source = arg.slice("--source=".length);
  }
  return out;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const { harvestId } = resolveHarvestIdFromProcessArgv();
  const runDir = path.join(REPO_ROOT, "artifacts/agent-runs", harvestId);
  const sourceRel =
    args.source ||
    (fs.existsSync(path.join(runDir, "chatgpt-findings-source.md"))
      ? `artifacts/agent-runs/${harvestId}/chatgpt-findings-source.md`
      : null);

  if (!sourceRel || !fs.existsSync(path.join(REPO_ROOT, sourceRel))) {
    console.error(`BLOCKED_MISSING_CHATGPT_SOURCE: ${sourceRel ?? "chatgpt-findings-source.md"}`);
    process.exit(2);
  }

  let manifest = null;
  const manifestPath = path.join(runDir, "harvest-manifest-v1.json");
  if (fs.existsSync(manifestPath)) {
    manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  }

  const result = expandIntelligenceFromSource({
    harvestId,
    sourceRelPath: sourceRel,
    sourceCommitSha: manifest?.sourceCommitSha ?? null,
    manifest,
  });

  const mergeStats = mergeExpansionIntoIntelligenceIndex(result.expansionEntities, harvestId);
  saveUnmodeledQueue(result.queue);
  const paths = writeExpansionArtifacts(runDir, result);

  const summary = {
    ok: result.receipt.verdict === "PASS",
    harvestId,
    verdict: result.receipt.verdict,
    sourceSectionsDropped: result.receipt.sourceSectionsDropped,
    projectionsEmitted: result.receipt.projectionsEmitted,
    ...paths,
    mergeStats,
  };

  if (args.json) {
    console.log(JSON.stringify(summary, null, 2));
  } else {
    console.log(
      `expand-intelligence ${summary.ok ? "PASS" : "FAIL"} harvest=${harvestId} dropped=${summary.sourceSectionsDropped} projections=${summary.projectionsEmitted}`,
    );
  }
  process.exit(summary.ok ? 0 : 1);
}

main();
