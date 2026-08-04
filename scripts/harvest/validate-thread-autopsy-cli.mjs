#!/usr/bin/env node
/**
 * Standalone thread autopsy validation CLI.
 *
 * Usage:
 *   npm run harvest:validate-autopsy -- --harvest-id=<id>
 *   npm run harvest:validate-autopsy -- <harvest-id>
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { validateThreadAutopsy } from "./lib/validate-thread-autopsy.mjs";
import { harvestRunDir, manifestPath, HARVEST_ID, REPO_ROOT } from "./lib/paths.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseHarvestId(argv) {
  for (const arg of argv) {
    if (arg.startsWith("--harvest-id=")) return arg.slice("--harvest-id=".length);
  }
  const positional = argv.find((a) => !a.startsWith("-"));
  return positional || HARVEST_ID;
}

function main() {
  const harvestId = parseHarvestId(process.argv.slice(2));
  const manifestFile = manifestPath(harvestId);
  const runDir = harvestRunDir(harvestId);

  if (!fs.existsSync(manifestFile)) {
    console.error(`harvest:validate-autopsy FAIL — missing ${manifestFile}`);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8"));
  const result = validateThreadAutopsy({ manifest, runDir, repoRoot: REPO_ROOT });

  const outPath = path.join(runDir, "thread-autopsy-validation-result.json");
  const receipt = {
    schemaVersion: "cross-agent-thread-autopsy-validation-result-v1@1.0.0",
    harvestId,
    validatedAt: new Date().toISOString(),
    skipped: result.skipped,
    tier: result.tier,
    verdict: result.skipped ? "SKIPPED" : result.errors.length === 0 ? "PASS" : "FAIL",
    errorCount: result.errors.length,
    warningCount: result.warnings.length,
    errors: result.errors,
    warnings: result.warnings,
  };
  fs.mkdirSync(runDir, { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(receipt, null, 2)}\n`);

  if (result.skipped) {
    console.log(`harvest:validate-autopsy SKIPPED (no threadAutopsy on manifest)`);
    process.exit(0);
  }

  if (result.errors.length > 0) {
    console.error(`harvest:validate-autopsy FAIL tier=${result.tier}`);
    for (const e of result.errors) console.error(`  - ${e}`);
    process.exit(1);
  }

  console.log(`harvest:validate-autopsy PASS tier=${result.tier}`);
  if (result.warnings.length) {
    for (const w of result.warnings) console.log(`  warn: ${w}`);
  }
  console.log(`  receipt: ${outPath}`);
}

main();
