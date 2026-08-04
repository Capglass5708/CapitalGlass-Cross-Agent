#!/usr/bin/env node
/**
 * Post-push hook: run AppBuilder index auto-publisher when enabled.
 */
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveAppBuilderRoot } from "../index/lib/resolve-repo-roots.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function main() {
  if (process.env.CG_INDEX_AUTO_PUBLISH_ENABLED !== "1") {
    console.log("post-push-index-publish: skipped (set CG_INDEX_AUTO_PUBLISH_ENABLED=1 to enable)");
    process.exit(0);
  }

  const appBuilderRoot = resolveAppBuilderRoot(REPO_ROOT);
  const cmd = [
    "npm run intelligence-hub:index-auto-publisher:run",
    "--",
    `--trigger=post-push`,
    `--cross-agent-root=${REPO_ROOT}`,
    "--skip-ingest",
  ].join(" ");

  execSync(cmd, { cwd: appBuilderRoot, stdio: "inherit" });
}

main();
