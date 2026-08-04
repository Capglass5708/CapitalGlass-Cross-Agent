#!/usr/bin/env node
/**
 * Validate graph-extraction.json via CG-MASTER-GRAPH graph:validate-extraction CLI.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { harvestRunDir, HARVEST_ID } from "./lib/paths.mjs";
import {
  graphRepoRoot,
  graphExtractionPath,
  graphExtractionValidationPath,
} from "./lib/graph-extraction-paths.mjs";

const harvestId = process.argv[2] || HARVEST_ID;
const runDir = harvestRunDir(harvestId);
const extractionPath = graphExtractionPath(runDir);
const graphRoot = graphRepoRoot();
const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";

function writeResult(body) {
  fs.mkdirSync(runDir, { recursive: true });
  fs.writeFileSync(graphExtractionValidationPath(runDir), `${JSON.stringify(body, null, 2)}\n`, "utf8");
}

if (!fs.existsSync(extractionPath)) {
  const result = {
    schemaVersion: "cross-agent-graph-extraction-validation-v1@1.0.0",
    harvestId,
    validatedAt: new Date().toISOString(),
    verdict: "FAIL",
    error: "graph-extraction.json missing — run harvest:build-graph-extraction",
    graphRepoRoot: graphRoot,
  };
  writeResult(result);
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}

if (!fs.existsSync(path.join(graphRoot, "package.json"))) {
  const result = {
    schemaVersion: "cross-agent-graph-extraction-validation-v1@1.0.0",
    harvestId,
    validatedAt: new Date().toISOString(),
    verdict: "FAIL",
    error: `CG-MASTER-GRAPH not found at ${graphRoot}`,
    graphRepoRoot: graphRoot,
  };
  writeResult(result);
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}

try {
  const stdout = execFileSync(
    npmCmd,
    ["run", "graph:validate-extraction", "--", extractionPath],
    { cwd: graphRoot, encoding: "utf8" },
  );
  const jsonStart = stdout.indexOf("{");
  if (jsonStart === -1) throw new Error("graph:validate-extraction produced no JSON");
  const graphVerdict = JSON.parse(stdout.slice(jsonStart));
  const result = {
    schemaVersion: "cross-agent-graph-extraction-validation-v1@1.0.0",
    harvestId,
    validatedAt: new Date().toISOString(),
    verdict: graphVerdict.verdict === "PASS" ? "PASS" : "FAIL",
    graphRepoRoot: graphRoot,
    extractionPath,
    graphValidateOutput: graphVerdict,
  };
  writeResult(result);
  console.log(JSON.stringify(result, null, 2));
  if (result.verdict !== "PASS") process.exit(1);
} catch (err) {
  const result = {
    schemaVersion: "cross-agent-graph-extraction-validation-v1@1.0.0",
    harvestId,
    validatedAt: new Date().toISOString(),
    verdict: "FAIL",
    graphRepoRoot: graphRoot,
    extractionPath,
    error: err.message,
    stderr: err.stderr?.toString?.() ?? null,
  };
  writeResult(result);
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
