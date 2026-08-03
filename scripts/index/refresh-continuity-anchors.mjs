#!/usr/bin/env node
/**
 * Refresh continuity metadata to match current git HEAD (handoff anchor, packet registry).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveGitHead, resolveGitHeadShort } from "./lib/git-head.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const now = new Date().toISOString();

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(REPO_ROOT, rel), "utf8"));
}

function writeJson(rel, value) {
  fs.writeFileSync(path.join(REPO_ROOT, rel), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function refreshHandoff(gitHeadShort) {
  const handoffPath = path.join(REPO_ROOT, "handoffs/CURRENT_HANDOFF.md");
  let body = fs.readFileSync(handoffPath, "utf8");
  body = body.replace(
    /\*\*Last reconciled:\*\* .+/,
    `**Last reconciled:** ${now.slice(0, 10)}`,
  );
  body = body.replace(
    /\*\*Ledger commit anchor:\*\* `[^`]+`.+/,
    `**Ledger commit anchor:** \`${gitHeadShort}\` (verify with \`git rev-parse HEAD\` in this repo)`,
  );
  fs.writeFileSync(handoffPath, body, "utf8");
}

function refreshPacketRegistry(gitHead) {
  const rel = "work-progress/harvest-packet-registry.json";
  const registry = readJson(rel);
  registry.updatedAt = now;
  for (const packet of Object.values(registry.packets)) {
    packet.lastUpdatedCommit = gitHead;
    packet.lastUpdatedAt = now;
  }
  writeJson(rel, registry);
}

function refreshOwnerBoundaryIndex() {
  const rel = "work-progress/owner-repo-boundary-index.json";
  const index = readJson(rel);
  index.updatedAt = now;
  writeJson(rel, index);
}

function refreshCommandIndex(gitHead) {
  const rel = "work-progress/command-index.json";
  if (!fs.existsSync(path.join(REPO_ROOT, rel))) return;
  const index = readJson(rel);
  index.updatedAt = now;
  index.sourceCommitSha = gitHead;
  writeJson(rel, index);
}

function main() {
  const gitHead = resolveGitHead(REPO_ROOT);
  const gitHeadShort = resolveGitHeadShort(REPO_ROOT);
  refreshHandoff(gitHeadShort);
  refreshPacketRegistry(gitHead);
  refreshOwnerBoundaryIndex();
  refreshCommandIndex(gitHead);
  console.log(`index:refresh-anchors OK gitHead=${gitHead}`);
}

main();
