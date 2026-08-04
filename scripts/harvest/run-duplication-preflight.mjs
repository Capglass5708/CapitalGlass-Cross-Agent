#!/usr/bin/env node
/**
 * Run automated duplication preflight and write receipt + bundle hash fields.
 *
 * Usage:
 *   npm run harvest:duplication-preflight -- --harvest-id=<id>
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  attachPreflightHashToBundle,
  runDuplicationPreflight,
} from "./lib/duplication-preflight-lib.mjs";
import { resolveGitHead } from "../index/lib/git-head.mjs";
import { HARVEST_ID } from "./lib/paths.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function parseHarvestId(argv) {
  for (const arg of argv) {
    if (arg.startsWith("--harvest-id=")) return arg.slice("--harvest-id=".length);
  }
  const positional = argv.find((a) => !a.startsWith("-"));
  return positional || HARVEST_ID;
}

function main() {
  const argv = process.argv.slice(2);
  const harvestId = parseHarvestId(argv);
  const runDir = path.join(REPO_ROOT, "artifacts/agent-runs", harvestId);
  const bundlePath = path.join(runDir, "thread-autopsy-bundle.json");
  const gitHead = resolveGitHead(REPO_ROOT);

  const preflight = runDuplicationPreflight({
    repoRoot: REPO_ROOT,
    harvestId,
    runDir,
    gitHead,
    mode: "preflight",
    writeReceipt: true,
    allowRepublish: argv.includes("--allow-republish"),
  });

  if (fs.existsSync(bundlePath)) {
    const bundle = JSON.parse(fs.readFileSync(bundlePath, "utf8"));
    attachPreflightHashToBundle(bundle, preflight);
    fs.writeFileSync(bundlePath, `${JSON.stringify(bundle, null, 2)}\n`, "utf8");
    console.log(`updated thread-autopsy-bundle.json duplicationCheck.preflightReceiptHash`);
  }

  console.log(`harvest:duplication-preflight ${preflight.verdict} harvest=${harvestId}`);
  console.log(`  receipt: ${preflight.receipt.receiptPath ?? "not written"}`);
  console.log(`  contentHash: ${preflight.receipt.contentHash}`);
  for (const w of preflight.warnings) console.warn(`  warn: ${w}`);
  for (const e of preflight.errors) console.error(`  error: ${e}`);

  if (!preflight.ok && !argv.includes("--json")) process.exit(1);
  if (argv.includes("--json")) console.log(JSON.stringify(preflight, null, 2));
}

main();
