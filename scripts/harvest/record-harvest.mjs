#!/usr/bin/env node
/**
 * harvest:record — edit harvest-manifest-v1.json first, then run this to regenerate derived views.
 */
import fs from "node:fs";
import { execSync } from "node:child_process";
import { manifestPath, HARVEST_ID, REPO_ROOT } from "./lib/paths.mjs";

const harvestId = process.argv[2] || HARVEST_ID;
const manifestFile = manifestPath(harvestId);

if (!fs.existsSync(manifestFile)) {
  console.error(`harvest:record FAIL — missing ${manifestFile}`);
  console.error("Create or edit harvest-manifest-v1.json first.");
  process.exit(1);
}

console.log(`harvest:record — syncing derived views for ${harvestId}`);
execSync("node scripts/harvest/sync-derived.mjs", { cwd: REPO_ROOT, stdio: "inherit" });
execSync("node scripts/harvest/render-harvest-index.mjs", { cwd: REPO_ROOT, stdio: "inherit" });
execSync("node scripts/harvest/validate-harvest.mjs", { cwd: REPO_ROOT, stdio: "inherit" });
console.log("harvest:record OK");
