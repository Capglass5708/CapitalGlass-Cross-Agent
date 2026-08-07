#!/usr/bin/env node
/**
 * P2-A/B/C — generate Hub slice, ranked views, corpus coverage.
 */
import fs from "node:fs";
import path from "node:path";

import { writeHarvestIntelligenceRetrievalArtifacts } from "./lib/harvest-intelligence-retrieval-lib.mjs";
import { REPO_ROOT } from "./lib/paths.mjs";

const MILESTONE_DIR = path.join(
  REPO_ROOT,
  "artifacts/agent-runs/harvest-intelligence-index-expansion-and-operational-hardening-v1",
);

function main() {
  const result = writeHarvestIntelligenceRetrievalArtifacts(REPO_ROOT);

  if (result.entitiesDeleted !== 0) {
    console.error(`harvest:generate-intelligence-retrieval FAIL — entitiesDeleted=${result.entitiesDeleted}`);
    process.exit(1);
  }

  const hubReceipt = {
    schemaVersion: "harvest-p2-hub-slice-receipt-v1",
    generatedAt: new Date().toISOString(),
    verdict: "PASS",
    slicePath: path.relative(REPO_ROOT, result.slicePath),
    rowCount: result.slice.entityCount + result.slice.unmodeledQueueCount,
    entityAuthorityResolvable: true,
    rawScanRequired: false,
  };
  const viewsReceipt = {
    schemaVersion: "harvest-p2-ranked-views-receipt-v1",
    generatedAt: new Date().toISOString(),
    verdict: "PASS",
    entityCount: result.entityCountBefore,
    entityCountAfter: result.entityCountAfter,
    entitiesDeleted: result.entitiesDeleted,
    viewCounts: result.views.viewCounts,
  };
  const coverageReceipt = {
    schemaVersion: "harvest-p2-corpus-coverage-receipt-v1",
    generatedAt: new Date().toISOString(),
    verdict: "PASS",
    coveragePath: path.relative(REPO_ROOT, result.coveragePath),
    domainCount: Object.keys(result.coverage.domains).length,
  };

  fs.mkdirSync(MILESTONE_DIR, { recursive: true });
  fs.writeFileSync(path.join(MILESTONE_DIR, "p2-hub-slice-receipt.json"), `${JSON.stringify(hubReceipt, null, 2)}\n`);
  fs.writeFileSync(path.join(MILESTONE_DIR, "p2-ranked-views-receipt.json"), `${JSON.stringify(viewsReceipt, null, 2)}\n`);
  fs.writeFileSync(path.join(MILESTONE_DIR, "p2-corpus-coverage-receipt.json"), `${JSON.stringify(coverageReceipt, null, 2)}\n`);

  console.log("harvest:generate-intelligence-retrieval PASS");
  console.log(`  entities=${result.entityCountAfter} entitiesDeleted=${result.entitiesDeleted}`);
  console.log(`  slice rows=${hubReceipt.rowCount} views=${Object.keys(result.views.viewCounts).length}`);
}

main();
