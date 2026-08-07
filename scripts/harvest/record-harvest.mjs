#!/usr/bin/env node
/**
 * harvest:record — sync derived views, merge intelligence index, reconcile registry, validate.
 */
import fs from "node:fs";
import { execSync } from "node:child_process";
import { manifestPath, REPO_ROOT } from "./lib/paths.mjs";
import { resolveHarvestIdFromProcessArgv } from "./lib/resolve-harvest-id.mjs";

const { harvestId } = resolveHarvestIdFromProcessArgv();
const manifestFile = manifestPath(harvestId);

if (!fs.existsSync(manifestFile)) {
  console.error(`harvest:record FAIL — missing ${manifestFile}`);
  console.error("Create or edit harvest-manifest-v1.json first.");
  process.exit(1);
}

const childEnv = { ...process.env, HARVEST_ID: harvestId };

function run(cmd, label) {
  try {
    execSync(cmd, { cwd: REPO_ROOT, stdio: "inherit", env: childEnv });
  } catch {
    console.error(`harvest:record FAIL — ${label}`);
    process.exit(1);
  }
}

console.log(`harvest:record — syncing derived views for ${harvestId}`);
run(`node scripts/harvest/sync-derived.mjs --harvest-id=${harvestId}`, "sync-derived");
run(`node scripts/harvest/reconcile-registry-boundary.mjs --harvest-id=${harvestId}`, "reconcile-registry-boundary");
const chatgptSource = path.join(REPO_ROOT, "artifacts/agent-runs", harvestId, "chatgpt-findings-source.md");
if (fs.existsSync(chatgptSource)) {
  run(`node scripts/harvest/expand-intelligence.mjs --harvest-id=${harvestId}`, "expand-intelligence");
}
run(`node scripts/harvest/merge-intelligence-index.mjs --harvest-id=${harvestId}`, "merge-intelligence-index");
run("node scripts/harvest/render-harvest-index.mjs", "render-harvest-index");
run(`node scripts/harvest/validate-harvest.mjs --harvest-id=${harvestId}`, "validate-harvest");
console.log("harvest:record OK");
