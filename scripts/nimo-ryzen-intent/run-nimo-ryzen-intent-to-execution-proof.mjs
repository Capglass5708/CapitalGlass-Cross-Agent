#!/usr/bin/env node
/**
 * CG_NIMO_RYZEN_INTENT_TO_EXECUTION_V1 — acceptance canaries + negative controls from NIMO.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { CROSS_AGENT_ROOT, resolveAppBuilderRoot, resolveOfficeAdminRoot } from "./lib/sibling-authority-paths.mjs";
import { executeNimoRyzenIntent } from "./lib/nimo-ryzen-intent-executor.mjs";
import { resolveNimoRyzenIntent } from "./lib/nimo-ryzen-intent-resolver.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MILESTONE = "CG_NIMO_RYZEN_INTENT_TO_EXECUTION_V1_PASS";

const CANARIES = [
  "hostname on ryzen9",
  "git status in CG-AppBuilder-MCP on ryzen9",
  "run a bounded test suite in Office Admin on ryzen9",
];

const NEGATIVE_CONTROLS = [
  {
    instruction: "git pull in CG-AppBuilder-MCP on ryzen9",
    expectedReasonCode: "MUTATING_INTENT_NOT_CATALOGUED",
  },
  {
    instruction: "delete repo CG-AppBuilder-MCP on ryzen9",
    expectedReasonCode: "DESTRUCTIVE_INTENT_BLOCKED",
  },
];

function parseArgs(argv) {
  const args = {
    json: false,
    dryRun: false,
    ref: process.env.CG_NIMO_RYZEN_PROOF_REF?.trim() || "main",
  };
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--json") args.json = true;
    else if (token === "--dry-run") args.dryRun = true;
    else if (token.startsWith("--ref=")) args.ref = token.split("=")[1];
  }
  return args;
}

function readGitSha(repoRoot) {
  try {
    return execSync("git rev-parse HEAD", { cwd: repoRoot, encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

async function main() {
  const options = parseArgs(process.argv);
  const startedAt = new Date().toISOString();
  const canaryResults = [];

  for (let i = 0; i < CANARIES.length; i += 1) {
    const instruction = CANARIES[i];
    const result = await executeNimoRyzenIntent(instruction, {
      dryRun: options.dryRun,
      ref: options.ref,
      approvalRef: `nimo-ryzen-intent-canary-${i + 1}`,
      requestedBy: "NIMO/operator",
    });
    canaryResults.push({ canaryIndex: i + 1, instruction, ...result });
  }

  const negativeResults = NEGATIVE_CONTROLS.map((control) => {
    const resolution = resolveNimoRyzenIntent(control.instruction);
    const pass =
      resolution.ok === false && resolution.reasonCode === control.expectedReasonCode;
    return {
      instruction: control.instruction,
      expectedReasonCode: control.expectedReasonCode,
      actualReasonCode: resolution.reasonCode ?? null,
      pass,
      resolution,
    };
  });

  const canariesPass = canaryResults.every((r) => r.ok);
  const negativesPass = negativeResults.every((r) => r.pass);
  const allPass = canariesPass && negativesPass;

  const packet = {
    schemaVersion: "cg-nimo-ryzen-intent-to-execution-v1@1.0.0",
    milestone: MILESTONE,
    verdict: allPass ? MILESTONE : "CG_NIMO_RYZEN_INTENT_TO_EXECUTION_V1_HOLD",
    generatedAt: new Date().toISOString(),
    startedAt,
    workflowRef: options.ref,
    authorityShas: {
      crossAgent: readGitSha(CROSS_AGENT_ROOT),
      officeAdmin: readGitSha(resolveOfficeAdminRoot() ?? ""),
      appBuilder: readGitSha(resolveAppBuilderRoot()),
    },
    controllerMachine: "CG-NIMO-01",
    targetMachine: "CG-RYZEN9DESK-01",
    canaries: CANARIES,
    canariesPass: canaryResults.filter((r) => r.ok).length,
    canaryResults,
    negativeControls: negativeResults,
    negativesPass,
  };

  const outDir = path.join(CROSS_AGENT_ROOT, "artifacts/agent-runs/cg-nimo-ryzen-intent-to-execution-v1");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${packet.verdict}.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(packet, null, 2)}\n`);

  if (options.json) {
    console.log(JSON.stringify(packet, null, 2));
  } else {
    console.log(
      `verdict=${packet.verdict} canaries=${packet.canariesPass}/${CANARIES.length} negatives=${negativesPass ? "PASS" : "FAIL"} artifact=${outPath}`,
    );
  }

  process.exit(allPass ? 0 : 1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
