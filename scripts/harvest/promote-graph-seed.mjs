#!/usr/bin/env node
/**
 * Copy validated graph-extraction.json into CG-MASTER-GRAPH graph/seeds for collect.
 */
import fs from "node:fs";
import path from "node:path";
import { harvestRunDir, HARVEST_ID } from "./lib/paths.mjs";
import {
  graphRepoRoot,
  graphExtractionPath,
  graphExtractionValidationPath,
} from "./lib/graph-extraction-paths.mjs";

const harvestId = process.argv[2] || HARVEST_ID;
const runDir = harvestRunDir(harvestId);
const extractionPath = graphExtractionPath(runDir);
const validationPath = graphExtractionValidationPath(runDir);
const graphRoot = graphRepoRoot();
const seedsDir = path.join(graphRoot, "graph/seeds");

if (!fs.existsSync(validationPath)) {
  console.error("harvest:promote-graph-seed FAIL — run harvest:validate-graph-extraction first");
  process.exit(1);
}

const validation = JSON.parse(fs.readFileSync(validationPath, "utf8"));
if (validation.verdict !== "PASS") {
  console.error("harvest:promote-graph-seed FAIL — graph extraction validation not PASS");
  process.exit(1);
}

if (!fs.existsSync(extractionPath)) {
  console.error("harvest:promote-graph-seed FAIL — graph-extraction.json missing");
  process.exit(1);
}

const extraction = JSON.parse(fs.readFileSync(extractionPath, "utf8"));
const slug = harvestId.replace(/^harvest-/, "");
const destName = `${slug}.extraction.v1.json`;
const destPath = path.join(seedsDir, destName);

fs.mkdirSync(seedsDir, { recursive: true });
fs.copyFileSync(extractionPath, destPath);

console.log(
  JSON.stringify(
    {
      verdict: "PASS",
      harvestId,
      destPath,
      extractionId: extraction.extractionId,
      note: "Run npm run validate in CG-MASTER-GRAPH to compile promoted seed",
    },
    null,
    2,
  ),
);
