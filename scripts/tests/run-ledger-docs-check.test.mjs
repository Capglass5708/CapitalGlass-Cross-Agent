#!/usr/bin/env node
/**
 * Applicable PR check for work-progress ledger/docs mutations.
 * G7 fail-closes when GitHub reports no checks; this is the Cross-Agent
 * check that covers the live current-milestone pointers.
 *
 * INDEX historically names retired files. This check does not require every
 * INDEX filename to exist. It requires the live ACTIVE_WORK pointers to be
 * real files listed in INDEX.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const INDEX_PATH = path.join(REPO_ROOT, "work-progress/projects/INDEX.md");
const ACTIVE_PATH = path.join(REPO_ROOT, "work-progress/ACTIVE_WORK.md");
const PROJECTS_DIR = path.join(REPO_ROOT, "work-progress/projects");

assert.ok(fs.existsSync(INDEX_PATH), "work-progress/projects/INDEX.md must exist");
assert.ok(fs.existsSync(ACTIVE_PATH), "work-progress/ACTIVE_WORK.md must exist");

const indexMd = fs.readFileSync(INDEX_PATH, "utf8");
const activeMd = fs.readFileSync(ACTIVE_PATH, "utf8");

assert.match(indexMd, /\*\*Last updated:\*\*/i, "INDEX.md must record Last updated");
assert.match(activeMd, /Current focus/i, "ACTIVE_WORK.md must record Current focus");

const pointerRe = /work-progress\/projects\/(\d{4}-\d{2}-\d{2}_[a-z0-9][a-z0-9._-]*\.md)/g;
const pointers = [...new Set([...activeMd.matchAll(pointerRe)].map((m) => m[1]))];
assert.ok(pointers.length > 0, "ACTIVE_WORK.md must point at a dated project file");

const missing = [];
const unindexed = [];
for (const name of pointers) {
  if (!fs.existsSync(path.join(PROJECTS_DIR, name))) missing.push(name);
  else if (!indexMd.includes(name)) unindexed.push(name);
}
assert.equal(missing.length, 0, `ACTIVE_WORK points at missing project files: ${missing.join(", ")}`);
assert.equal(unindexed.length, 0, `INDEX.md must list ACTIVE_WORK project files: ${unindexed.join(", ")}`);

console.log(`ok - ledger-docs-check (${pointers.length} ACTIVE_WORK project pointers present and indexed)`);
