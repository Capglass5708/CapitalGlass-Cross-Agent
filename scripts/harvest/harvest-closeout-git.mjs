#!/usr/bin/env node
/**
 * Git durability closeout for harvest publication artifacts.
 *
 *   npm run harvest:closeout-git -- --harvest-id=<id> [--dry-run] [--json]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

import { buildGitDurabilityReport, classifyGitChanges } from "./lib/git-durability-closeout.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function parseArgs(argv) {
  let harvestId = null;
  let runId = "closeout";
  let dryRun = true;
  let branch = null;
  for (const arg of argv) {
    if (arg.startsWith("--harvest-id=")) harvestId = arg.slice("--harvest-id=".length);
    if (arg.startsWith("--run-id=")) runId = arg.slice("--run-id=".length);
    if (arg.startsWith("--branch=")) branch = arg.slice("--branch=".length);
    if (arg === "--apply") dryRun = false;
    if (arg === "--dry-run") dryRun = true;
  }
  return { harvestId, runId, dryRun, branch, json: argv.includes("--json") };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.harvestId) {
    console.error("harvest:closeout-git FAIL — --harvest-id required");
    process.exit(1);
  }

  const report = buildGitDurabilityReport({
    repoRoot: REPO_ROOT,
    harvestId: args.harvestId,
    runId: args.runId,
    branch: args.branch ?? `harvest/${args.harvestId}`,
    dryRun: args.dryRun,
  });

  const outDir = path.join(
    REPO_ROOT,
    "artifacts/agent-runs/harvest-publication-reliability-and-roi-hardening-v1",
  );
  fs.mkdirSync(outDir, { recursive: true });
  const reportPath = path.join(outDir, "git-durability-report.json");
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);

  if (!args.dryRun && report.includedFiles.length > 0 && report.gitDurabilityStatus !== "BLOCKED") {
    const branch = report.branch;
    try {
      execSync(`git checkout -b ${JSON.stringify(branch)}`, { cwd: REPO_ROOT, stdio: "inherit" });
    } catch {
      execSync(`git checkout ${JSON.stringify(branch)}`, { cwd: REPO_ROOT, stdio: "inherit" });
    }
    for (const f of report.includedFiles) {
      execSync(`git add ${JSON.stringify(f)}`, { cwd: REPO_ROOT });
    }
    const msg = `chore(harvest): durable closeout for ${args.harvestId}`;
    execSync(`git commit -m ${JSON.stringify(msg)}`, { cwd: REPO_ROOT, stdio: "inherit" });
    report.commitSha = execSync("git rev-parse HEAD", { cwd: REPO_ROOT, encoding: "utf8" }).trim();
    report.finalSha = report.commitSha;
    report.gitDurabilityStatus = "RECORDED";
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  }

  if (args.json) console.log(JSON.stringify({ ...report, reportPath }, null, 2));
  else console.log(`harvest:closeout-git ${report.gitDurabilityStatus} dryRun=${args.dryRun}`);

  if (report.gitDurabilityStatus === "BLOCKED") process.exit(1);
}

main();
