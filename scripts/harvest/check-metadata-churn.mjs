#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { validateMetadataChurn } from "./lib/harvest-metadata-churn-lib.mjs";
import {
  buildPrDiffContentPairs,
  listChangedFiles,
  resolveDiffRefs,
} from "./lib/harvest-pr-diff-lib.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function parseArgs(argv) {
  const args = {
    mode: "staged",
    baseRef: null,
    headRef: "HEAD",
    json: false,
  };
  for (const arg of argv) {
    if (arg.startsWith("--mode=")) args.mode = arg.slice("--mode=".length);
    else if (arg.startsWith("--base-ref=")) args.baseRef = arg.slice("--base-ref=".length);
    else if (arg.startsWith("--head-ref=")) args.headRef = arg.slice("--head-ref=".length);
    else if (arg === "--json") args.json = true;
  }
  return args;
}

function listStagedFiles() {
  const out = execFileSync("git", ["diff", "--cached", "--name-only"], {
    cwd: REPO_ROOT,
    encoding: "utf8",
  });
  return out
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function filePair(rel) {
  const abs = path.join(REPO_ROOT, rel);
  const before = execFileSync("git", ["show", `:${rel}`], {
    cwd: REPO_ROOT,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "ignore"],
  });
  const after = fs.readFileSync(abs, "utf8");
  return { before, after };
}

function collectPrDiffFiles(baseRef, headRef) {
  const refs = resolveDiffRefs({ repoRoot: REPO_ROOT, baseRef, headRef });
  const changes = listChangedFiles({ repoRoot: REPO_ROOT, ...refs });
  return {
    refs,
    files: changes
      .filter((c) => (c.status === "A" || c.status === "M") && c.path.endsWith(".json"))
      .map((c) => c.path),
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  let files = [];
  let beforeContent = {};
  let afterContent = {};
  let meta = { mode: args.mode };

  if (args.mode === "pr-diff") {
    const { refs, files: prFiles } = collectPrDiffFiles(args.baseRef, args.headRef);
    files = prFiles;
    const pairs = buildPrDiffContentPairs({
      repoRoot: REPO_ROOT,
      baseRef: refs.baseRef,
      headRef: refs.headRef,
      files,
    });
    beforeContent = pairs.beforeContent;
    afterContent = pairs.afterContent;
    meta = { mode: args.mode, baseRef: refs.baseRef, headRef: refs.headRef, fileCount: files.length };
  } else {
    files = listStagedFiles();
    for (const rel of files) {
      try {
        const pair = filePair(rel);
        beforeContent[rel] = pair.before;
        afterContent[rel] = pair.after;
      } catch {
        afterContent[rel] = fs.readFileSync(path.join(REPO_ROOT, rel), "utf8");
      }
    }
    meta = { mode: args.mode, fileCount: files.length };
  }

  const result = validateMetadataChurn({
    repoRoot: REPO_ROOT,
    files,
    beforeContent,
    afterContent,
  });

  const payload = { ...meta, ...result };

  if (args.json) {
    console.log(JSON.stringify(payload, null, 2));
  } else {
    console.log(`harvest:check-metadata-churn ${result.verdict} mode=${args.mode} files=${files.length}`);
    for (const f of result.failures) console.error(`  - ${f}`);
  }

  process.exit(result.ok ? 0 : 1);
}

main();
