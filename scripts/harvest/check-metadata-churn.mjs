#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { validateMetadataChurn } from "./lib/harvest-metadata-churn-lib.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function parseArgs(argv) {
  let mode = "staged";
  for (const arg of argv) {
    if (arg.startsWith("--mode=")) mode = arg.slice("--mode=".length);
  }
  return { mode, json: argv.includes("--json") };
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

function main() {
  const args = parseArgs(process.argv.slice(2));
  const files = listStagedFiles();
  const beforeContent = {};
  const afterContent = {};

  for (const rel of files) {
    try {
      const pair = filePair(rel);
      beforeContent[rel] = pair.before;
      afterContent[rel] = pair.after;
    } catch {
      afterContent[rel] = fs.readFileSync(path.join(REPO_ROOT, rel), "utf8");
    }
  }

  const result = validateMetadataChurn({
    repoRoot: REPO_ROOT,
    files,
    beforeContent,
    afterContent,
  });

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`harvest:check-metadata-churn ${result.verdict}`);
    for (const f of result.failures) console.error(`  - ${f}`);
  }

  process.exit(result.ok ? 0 : 1);
}

main();
