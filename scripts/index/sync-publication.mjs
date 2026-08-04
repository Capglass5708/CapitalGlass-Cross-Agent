#!/usr/bin/env node
/**
 * Operator chain: Supabase ingest → L: publish → freshness gate (all layers same SHA).
 */
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveAppBuilderRoot, resolveDataExtractionRoot } from "./lib/resolve-repo-roots.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const APP_BUILDER_ROOT = resolveAppBuilderRoot(REPO_ROOT);
const DATA_EXTRACTION_ROOT = resolveDataExtractionRoot(REPO_ROOT);
const HUB_ROOT = process.env.INTELLIGENCE_HUB_ROOT || "/mnt/l/Capital-Glass-Intelligence-Hub";

function run(cmd, cwd, env = {}) {
  console.log(`> ${cmd}`);
  execSync(cmd, {
    cwd,
    stdio: "inherit",
    env: { ...process.env, ...env },
  });
}

function main() {
  run(
    `CROSS_AGENT_LEDGER_INGEST_APPROVED=1 doppler run --project cg-mcp --config dev -- npm run cross-agent-ledger:ingest -- --apply --repo=${REPO_ROOT}`,
    APP_BUILDER_ROOT,
  );
  run(
    `INTELLIGENCE_HUB_ROOT=${HUB_ROOT} CG_APPBUILDER_MCP_ROOT=${APP_BUILDER_ROOT} CAPITALGLASS_CROSS_AGENT_ROOT=${REPO_ROOT} npm run agent-research-library:publish-active-work-ledger -- --repo=${REPO_ROOT} --json`,
    DATA_EXTRACTION_ROOT,
  );
  run(
    `INTELLIGENCE_HUB_ROOT=${HUB_ROOT} CAPITALGLASS_CROSS_AGENT_ROOT=${REPO_ROOT} doppler run --project cg-mcp --config dev -- npm run intelligence-hub:thread-autopsy:project-supabase -- --apply --json`,
    APP_BUILDER_ROOT,
  );
  run("npm run index:freshness-gate", REPO_ROOT, {
    CG_APPBUILDER_MCP_ROOT: APP_BUILDER_ROOT,
    INTELLIGENCE_HUB_ROOT: HUB_ROOT,
  });
}

main();
