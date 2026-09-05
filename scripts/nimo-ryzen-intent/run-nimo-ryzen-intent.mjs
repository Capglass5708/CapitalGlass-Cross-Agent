#!/usr/bin/env node
/**
 * Operator front door: natural-language instruction → governed RYZEN execution.
 *
 * Example:
 *   npm run intent:ryzen -- "git status in CG-AppBuilder-MCP on ryzen9"
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { CROSS_AGENT_ROOT } from "./lib/sibling-authority-paths.mjs";
import { executeNimoRyzenIntent } from "./lib/nimo-ryzen-intent-executor.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const args = { json: false, dryRun: false, ref: process.env.CG_NIMO_RYZEN_PROOF_REF?.trim() || "main" };
  const positional = [];
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--json") args.json = true;
    else if (token === "--dry-run") args.dryRun = true;
    else if (token.startsWith("--ref=")) args.ref = token.split("=")[1];
    else positional.push(token);
  }
  args.instruction = positional.join(" ").trim();
  return args;
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.instruction) {
    console.error("usage: npm run intent:ryzen -- \"<operator instruction>\" [--json] [--dry-run] [--ref=main]");
    process.exit(1);
  }

  const result = await executeNimoRyzenIntent(args.instruction, {
    dryRun: args.dryRun,
    ref: args.ref,
    requestedBy: process.env.CG_NIMO_OPERATOR ?? "NIMO/operator",
  });

  const artifactDir = path.join(CROSS_AGENT_ROOT, "artifacts/agent-runs/cg-nimo-ryzen-intent-to-execution-v1");
  fs.mkdirSync(artifactDir, { recursive: true });
  const artifactPath = path.join(artifactDir, `intent-${Date.now()}.json`);
  fs.writeFileSync(artifactPath, `${JSON.stringify({ ...result, artifactPath }, null, 2)}\n`);

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
  } else if (result.operatorReceipt) {
    const r = result.operatorReceipt;
    console.log(
      `ok=${result.ok} operation=${r.operation} target=${r.targetMachine} controlHost=${r.controlHost} runId=${r.dispatch?.runId ?? "n/a"} summary=${r.stdoutStderrSummary ?? "n/a"}`,
    );
    console.log(`artifact=${artifactPath}`);
  } else {
    console.log(`ok=${result.ok} phase=${result.phase} reason=${result.resolution?.reasonCode ?? result.preflight?.reasonCode ?? "unknown"}`);
    console.log(`artifact=${artifactPath}`);
  }

  process.exit(result.ok ? 0 : 1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
