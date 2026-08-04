#!/usr/bin/env node
/**
 * Build graph extraction into L: staging (not Cross-Agent Git).
 */
import fs from "node:fs";
import { harvestRunDir, manifestPath, HARVEST_ID } from "./lib/paths.mjs";
import { writeGraphExtraction } from "./lib/graph-extraction-builder-lib.mjs";

const harvestId = process.argv[2] || HARVEST_ID;
const manifestFile = manifestPath(harvestId);
const runDir = harvestRunDir(harvestId);

if (!fs.existsSync(manifestFile)) {
  console.error(`harvest:build-graph-extraction FAIL — missing ${manifestFile}`);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8"));
const result = writeGraphExtraction(runDir, manifest);

console.log(
  JSON.stringify(
    {
      verdict: result.verdict ?? "PASS",
      harvestId,
      graphEligible: result.graphEligible,
      extractionPath: result.outPath,
      extractionHash: result.staging?.extractionHash ?? result.pointer?.extractionHash ?? null,
      lExtractionPath: result.pointer?.lExtractionPath ?? null,
      counts: result.extraction
        ? {
            nodes: result.extraction.nodes.length,
            edges: result.extraction.edges.length,
            warnings: result.extraction.warnings.length,
          }
        : null,
    },
    null,
    2,
  ),
);
