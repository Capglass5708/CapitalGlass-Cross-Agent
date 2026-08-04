#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  validateKnowledgeQuality,
  writeKnowledgeQualityReceipt,
} from "./lib/knowledge-quality-gate-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");

function parseArgs(argv) {
  let runDir = null;
  let json = false;
  for (const arg of argv) {
    if (arg.startsWith("--run-dir=")) runDir = arg.slice("--run-dir=".length);
    else if (arg === "--json") json = true;
  }
  return { runDir, json };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.runDir) {
    console.error("harvest:validate-knowledge-quality FAIL — --run-dir is required");
    process.exit(1);
  }

  const absRunDir = path.isAbsolute(args.runDir) ? args.runDir : path.join(REPO_ROOT, args.runDir);
  const manifestPath = path.join(absRunDir, "harvest-manifest-v1.json");
  if (!fs.existsSync(manifestPath)) {
    console.error("harvest:validate-knowledge-quality FAIL — harvest-manifest-v1.json missing");
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const receipt = validateKnowledgeQuality({ manifest, runDir: absRunDir });
  writeKnowledgeQualityReceipt(absRunDir, receipt);

  if (args.json) {
    console.log(JSON.stringify(receipt, null, 2));
  } else {
    console.log(`harvest:validate-knowledge-quality ${receipt.knowledgeVerdict}`);
    console.log(`  publicationEligibility=${receipt.publicationEligibility}`);
    if (receipt.failures?.length) {
      console.log(`  failures=${receipt.failures.length}`);
    }
  }

  if (receipt.knowledgeVerdict !== "KNOWLEDGE_QUALITY_PASS") {
    process.exit(1);
  }
}

main();
