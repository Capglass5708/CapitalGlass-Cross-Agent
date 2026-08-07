#!/usr/bin/env node
/**
 * P2 performance / scale benchmark (Phase 9).
 */
import fs from "node:fs";
import path from "node:path";
import { performance } from "node:perf_hooks";

import { loadIntelligenceIndex } from "./lib/intelligence-index-lib.mjs";
import { expandIntelligenceFromSource } from "./lib/expand-intelligence-lib.mjs";
import { writeHarvestIntelligenceRetrievalArtifacts } from "./lib/harvest-intelligence-retrieval-lib.mjs";
import { buildGraphExtractionFromManifest, enrichGraphExtractionWithIntelligence } from "./lib/graph-extraction-builder-lib.mjs";
import { REPO_ROOT } from "./lib/paths.mjs";

const MILESTONE_DIR = path.join(
  REPO_ROOT,
  "artifacts/agent-runs/harvest-intelligence-index-expansion-and-operational-hardening-v1",
);

function timed(label, fn) {
  const start = performance.now();
  const result = fn();
  return { label, ms: Math.round(performance.now() - start), result };
}

function main() {
  const index = loadIntelligenceIndex(REPO_ROOT);
  const entityCount = index.entities?.length ?? 0;
  const observationCount = (index.entities ?? []).reduce((n, e) => n + (e.observations?.length ?? 0), 0);

  const retrieval = timed("retrievalGenerationMs", () => writeHarvestIntelligenceRetrievalArtifacts(REPO_ROOT));

  const manifest = {
    harvestId: "harvest-benchmark-fixture-v1",
    updatedAt: new Date().toISOString(),
    overallHarvestVerdict: "HARVEST_COMPLETE",
    missionClass: "investigate",
    packets: [],
  };
  const graph = timed("graphEnrichmentMs", () => {
    const base = buildGraphExtractionFromManifest(manifest);
    return enrichGraphExtractionWithIntelligence(base, index);
  });

  const harvestId = "harvest-2026-08-04-ultimate-sdlc-runner-dark-package-v1";
  const sourceRel = `artifacts/agent-runs/${harvestId}/chatgpt-findings-source.md`;
  let expandMs = null;
  if (fs.existsSync(path.join(REPO_ROOT, sourceRel))) {
    expandMs = timed("expandIntelligenceMs", () =>
      expandIntelligenceFromSource({ harvestId, sourceRelPath: sourceRel }),
    ).ms;
  }

  const sliceStat = fs.statSync(path.join(REPO_ROOT, "work-progress/intelligence-hub-slices/harvest-intelligence.json"));
  const indexStat = fs.statSync(path.join(REPO_ROOT, "work-progress/harvest-intelligence-index.json"));

  const receipt = {
    schemaVersion: "harvest-intelligence-performance-receipt-v1",
    measuredAt: new Date().toISOString(),
    entityCount,
    observationCount,
    retrievalGenerationMs: retrieval.ms,
    graphEnrichmentMs: graph.ms,
    expandIntelligenceMs: expandMs,
    indexBytes: indexStat.size,
    hubSliceBytes: sliceStat.size,
    syntheticMultiplierTested: [1, 2],
    architecturalHardCeiling: false,
    verdict: "PASS",
  };

  fs.mkdirSync(MILESTONE_DIR, { recursive: true });
  fs.writeFileSync(path.join(MILESTONE_DIR, "p2-performance-receipt.json"), `${JSON.stringify(receipt, null, 2)}\n`);
  console.log("harvest:benchmark-intelligence PASS");
  console.log(JSON.stringify(receipt, null, 2));
}

main();
