#!/usr/bin/env node
/**
 * Blind retrieval benchmark — driven by seed packet retrievalQuestions.
 *
 * Usage:
 *   npm run harvest:blind-retrieval -- --harvest-id=<id>
 */
import fs from "node:fs";
import path from "node:path";

import { runBlindRetrievalBenchmark } from "./lib/blind-retrieval-lib.mjs";
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
  const report = runBlindRetrievalBenchmark({ repoRoot: REPO_ROOT, harvestId });
  const outPath = path.join(harvestRunDir(harvestId), "blind-retrieval-report.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(JSON.stringify(report, null, 2));
  if (report.verdict === "BLIND_RETRIEVAL_FAIL") process.exit(1);
}

main();
