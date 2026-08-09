#!/usr/bin/env node
/**
 * Build graph-extraction.json from harvest-manifest-v1.json.
 */
import fs from "node:fs";
import { harvestRunDir, manifestPath, HARVEST_ID } from "./lib/paths.mjs";
import { writeGraphExtraction } from "./lib/graph-extraction-builder-lib.mjs";

function parseHarvestId(argv) {
  for (const arg of argv) {
    if (arg.startsWith("--harvest-id=")) return arg.slice("--harvest-id=".length);
  }
  const positional = argv.find((a) => !a.startsWith("-"));
  return positional || HARVEST_ID;
}

const harvestId = parseHarvestId(process.argv.slice(2));
const manifestFile = manifestPath(harvestId);
const runDir = harvestRunDir(harvestId);

if (!fs.existsSync(manifestFile)) {
  console.error(`harvest:build-graph-extraction FAIL — missing ${manifestFile}`);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8"));
const { extraction, outPath } = writeGraphExtraction(runDir, manifest);

console.log(
  JSON.stringify(
    {
      verdict: "PASS",
      harvestId,
      path: outPath,
      extractionId: extraction.extractionId,
      counts: {
        nodes: extraction.nodes.length,
        edges: extraction.edges.length,
        warnings: extraction.warnings.length,
      },
    },
    null,
    2,
  ),
);
