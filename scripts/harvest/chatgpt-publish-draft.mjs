#!/usr/bin/env node
/**
 * Publish ChatGPT findings MD to chat-gpt-harvest branch artifact path.
 * Default: dry-run. Pass --apply to commit and push.
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

import { resolveHarvestId } from "./lib/resolve-harvest-id.mjs";
import { OBSERVED_ARTIFACT, CHATGPT_BRANCH } from "./lib/chatgpt-git-gate-lib.mjs";
import { REPO_ROOT } from "./lib/paths.mjs";

function parseArgs(argv) {
  let input = null;
  let harvestId = null;
  let apply = false;
  for (const arg of argv) {
    if (arg.startsWith("--input=")) input = arg.slice("--input=".length);
    else if (arg.startsWith("--harvest-id=")) harvestId = arg.slice("--harvest-id=".length);
    else if (arg === "--apply") apply = true;
  }
  if (!harvestId) {
    ({ harvestId } = resolveHarvestId(argv.filter((a) => a !== "--apply"), { allowReferenceDefault: false }));
  }
  return { input, harvestId, apply };
}

function main() {
  const { input, harvestId, apply } = parseArgs(process.argv.slice(2));
  if (!input) {
    console.error("harvest:chatgpt-publish-draft FAIL — --input required");
    process.exit(1);
  }

  const inputPath = path.isAbsolute(input) ? input : path.resolve(process.cwd(), input);
  if (!fs.existsSync(inputPath)) {
    console.error(`harvest:chatgpt-publish-draft FAIL — input not found: ${inputPath}`);
    process.exit(1);
  }

  const runDir = path.join(REPO_ROOT, "artifacts/agent-runs", harvestId);
  const dest = path.join(runDir, OBSERVED_ARTIFACT);
  fs.mkdirSync(runDir, { recursive: true });
  fs.copyFileSync(inputPath, dest);

  const artifactRel = path.relative(REPO_ROOT, dest);
  console.log(`harvest:chatgpt-publish-draft staged ${artifactRel}`);

  if (!apply) {
    console.log("harvest:chatgpt-publish-draft DRY_RUN — pass --apply to commit and push on chat-gpt-harvest");
    process.exit(0);
  }

  const branch = execSync("git rev-parse --abbrev-ref HEAD", { cwd: REPO_ROOT, encoding: "utf8" }).trim();
  if (branch !== CHATGPT_BRANCH) {
    console.error(`harvest:chatgpt-publish-draft FAIL — must be on ${CHATGPT_BRANCH} (current: ${branch})`);
    process.exit(1);
  }

  execSync(`git add ${artifactRel}`, { cwd: REPO_ROOT, stdio: "inherit" });
  execSync(`git commit -m "chatgpt: publish ${harvestId} findings source"`, { cwd: REPO_ROOT, stdio: "inherit" });
  execSync(`git push origin ${CHATGPT_BRANCH}`, { cwd: REPO_ROOT, stdio: "inherit" });
  console.log("harvest:chatgpt-publish-draft OK — pushed to origin/chat-gpt-harvest");
}

main();
