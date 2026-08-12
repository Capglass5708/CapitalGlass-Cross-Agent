#!/usr/bin/env node
/**
 * Scoped thread-autopsy lifecycle proof — does not require a dirty-tree reset.
 *
 * Agent-owned lanes only (validate, autopsy, git durability dry-run, publication dry-run).
 * Hub publish and index:publish remain operator-owned.
 *
 *   npm run harvest:proof:thread-autopsy-lifecycle
 *   npm run harvest:proof:thread-autopsy-lifecycle -- --harvest-id=<id> --json
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

import { buildGitDurabilityReport } from "./lib/git-durability-closeout.mjs";
import { buildPublicationDryRun } from "./lib/publication-dry-run.mjs";
import { validateThreadAutopsy } from "./lib/validate-thread-autopsy.mjs";
import { REPO_ROOT, harvestRunDir, manifestPath } from "./lib/paths.mjs";
import { resolveHarvestId } from "./lib/resolve-harvest-id.mjs";

const DEFAULT_PROOF_HARVEST_ID = "harvest-2026-08-04-three-lane-suite-closeout-v1";

function parseArgs(argv) {
  const json = argv.includes("--json");
  const skipAuthorityDogfood = argv.includes("--skip-authority-dogfood");
  const hasExplicitHarvestId = argv.some(
    (arg) => arg.startsWith("--harvest-id=") || (!arg.startsWith("-") && arg.trim()),
  );
  const harvestId = hasExplicitHarvestId
    ? resolveHarvestId(argv).harvestId
    : DEFAULT_PROOF_HARVEST_ID;
  return { harvestId, json, skipAuthorityDogfood };
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function runStep(label, command) {
  execSync(command, { cwd: REPO_ROOT, stdio: "pipe", encoding: "utf8" });
  return { step: label, verdict: "PASS" };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const { harvestId } = args;
  const runDir = harvestRunDir(harvestId);
  const manifestFile = manifestPath(harvestId);
  const steps = [];
  const blockers = [];

  if (!fs.existsSync(manifestFile)) {
    console.error(`harvest:proof FAIL — missing manifest for ${harvestId}`);
    console.error(`Expected: ${manifestFile}`);
    process.exit(1);
  }

  try {
    steps.push(runStep("harvest:record", `node scripts/harvest/record-harvest.mjs --harvest-id=${harvestId}`));
  } catch (error) {
    blockers.push(`harvest:record failed: ${error.message}`);
  }

  try {
    steps.push(runStep("harvest:validate", `node scripts/harvest/validate-harvest.mjs --harvest-id=${harvestId}`));
  } catch (error) {
    blockers.push(`harvest:validate failed: ${error.message}`);
  }

  try {
    const manifest = readJson(manifestFile);
    const autopsy = validateThreadAutopsy({ manifest, runDir, repoRoot: REPO_ROOT });
    if (autopsy.skipped) {
      steps.push({ step: "harvest:validate-autopsy", verdict: "SKIP", reason: autopsy.reason ?? "not applicable" });
    } else if (autopsy.errors?.length) {
      blockers.push(`thread autopsy: ${autopsy.errors.join("; ")}`);
      steps.push({ step: "harvest:validate-autopsy", verdict: "FAIL", errors: autopsy.errors });
    } else {
      steps.push({ step: "harvest:validate-autopsy", verdict: "PASS", tier: autopsy.tier });
    }
  } catch (error) {
    blockers.push(`harvest:validate-autopsy failed: ${error.message}`);
  }

  let gitDurability = null;
  try {
    gitDurability = buildGitDurabilityReport({
      repoRoot: REPO_ROOT,
      harvestId,
      runId: "proof-thread-autopsy-lifecycle",
      branch: `harvest/${harvestId}`,
      dryRun: true,
    });
    steps.push({
      step: "harvest:closeout-git",
      verdict: gitDurability.gitDurabilityStatus === "BLOCKED" ? "WARN" : "PASS",
      mode: "dry-run",
      includedFiles: gitDurability.includedFiles?.length ?? 0,
      blockedFiles: gitDurability.blockedFiles?.length ?? 0,
    });
  } catch (error) {
    blockers.push(`harvest:closeout-git dry-run failed: ${error.message}`);
  }

  let publicationDryRun = null;
  try {
    publicationDryRun = buildPublicationDryRun({ repoRoot: REPO_ROOT, harvestId });
    steps.push({
      step: "harvest:publication-dry-run",
      verdict: publicationDryRun.dryRunVerdict === "DRY_RUN_PASS" ? "PASS" : "FAIL",
      seedCount: publicationDryRun.lPublicationPlan?.seedCount ?? 0,
      hubPublish: "NOT_RUN_BY_CURSOR",
    });
    if (publicationDryRun.dryRunVerdict !== "DRY_RUN_PASS") {
      blockers.push(`publication dry-run: ${publicationDryRun.dryRunVerdict}`);
    }
  } catch (error) {
    blockers.push(`publication dry-run failed: ${error.message}`);
  }

  if (!args.skipAuthorityDogfood) {
    try {
      execSync("node scripts/tests/run-harvest-publication-authority-dogfood.test.mjs", {
        cwd: REPO_ROOT,
        stdio: "pipe",
        encoding: "utf8",
      });
      steps.push({ step: "test:harvest:authority-dogfood", verdict: "PASS" });
    } catch (error) {
      blockers.push(`authority dogfood failed: ${error.message}`);
      steps.push({ step: "test:harvest:authority-dogfood", verdict: "FAIL" });
    }
  }

  const receipt = {
    schemaVersion: "thread-autopsy-lifecycle-proof-v1@1.0.0",
    harvestId,
    checkedAt: new Date().toISOString(),
    verdict: blockers.length === 0 ? "LIFECYCLE_PROOF_PASS" : "LIFECYCLE_PROOF_BLOCKED",
    steps,
    gitDurability,
    publicationDryRun,
    blockers,
    operatorOwnedNotRun: [
      "harvest:publish-hub-seed",
      "harvest:publish-intelligence-full",
      "index:publish",
      "index:freshness-gate",
    ],
  };

  const receiptDir = path.join(REPO_ROOT, "artifacts/agent-runs/thread-autopsy-lifecycle-proof-v1");
  fs.mkdirSync(receiptDir, { recursive: true });
  const receiptPath = path.join(receiptDir, "latest.json");
  fs.writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);

  if (args.json) {
    console.log(JSON.stringify({ ...receipt, receiptPath }, null, 2));
  } else {
    console.log("thread-autopsy lifecycle proof");
    console.log(`harvestId: ${harvestId}`);
    for (const step of steps) {
      console.log(`  ${step.step}: ${step.verdict}`);
    }
    console.log(`verdict: ${receipt.verdict}`);
    console.log(`receipt: ${receiptPath}`);
  }

  if (blockers.length > 0) process.exit(1);
}

main();
