#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

import { runDuplicationPreflight } from "./lib/duplication-preflight-lib.mjs";
import { HARVEST_ID, REPO_ROOT, harvestRunDir } from "./lib/paths.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  let harvestId = HARVEST_ID;
  for (const arg of argv) {
    if (arg.startsWith("--harvest-id=")) harvestId = arg.slice("--harvest-id=".length);
  }
  const positional = argv.find((a) => !a.startsWith("-"));
  if (positional) harvestId = positional;
  return { harvestId, json: argv.includes("--json") };
}

function main() {
  const { harvestId, json } = parseArgs(process.argv.slice(2));
  const runDir = harvestRunDir(harvestId);
  const bundlePath = path.join(runDir, "thread-autopsy-bundle.json");

  const result = runDuplicationPreflight({
    repoRoot: REPO_ROOT,
    harvestId,
    runDir,
    mode: "preflight",
    writeReceipt: true,
  });

  if (fs.existsSync(bundlePath) && result.receipt?.contentHash) {
    const bundle = JSON.parse(fs.readFileSync(bundlePath, "utf8"));
    bundle.duplicationCheck = {
      ...(bundle.duplicationCheck ?? {}),
      registryConsulted: true,
      commandIndexConsulted: true,
      hubSlicesConsulted: [
        "active-work-blockers.json",
        "thread-autopsy-index.json",
        "work-progress/harvest-packet-registry.json",
      ],
      checkedAt: new Date().toISOString(),
      preflightReceiptHash: result.receipt.contentHash,
    };
    fs.writeFileSync(bundlePath, `${JSON.stringify(bundle, null, 2)}\n`);
  }

  if (json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`harvest:duplication-preflight ${result.verdict}`);
    if (result.errors?.length) {
      for (const e of result.errors) console.error(`  - ${e}`);
    }
    if (result.warnings?.length) {
      for (const w of result.warnings) console.warn(`  warn: ${w}`);
    }
    console.log(`  receipt: ${result.receipt?.receiptPath ?? "none"}`);
  }

  process.exit(result.ok ? 0 : 1);
}

main();
