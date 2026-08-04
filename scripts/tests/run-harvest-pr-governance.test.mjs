#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { isGovernedPath } from "../harvest/lib/harvest-pr-diff-lib.mjs";
import { validatePrGovernance } from "../harvest/lib/harvest-pr-governance-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`ok - ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`not ok - ${name}`);
    console.error(`  ${error.message}`);
  }
}

function initRepo() {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), "pr-gov-"));
  fs.mkdirSync(path.join(repoRoot, "artifacts/agent-runs"), { recursive: true });
  fs.writeFileSync(path.join(repoRoot, "README.md"), "# pr\n");
  execFileSync("git", ["init", "-b", "main"], { cwd: repoRoot });
  execFileSync("git", ["config", "user.email", "pr-gov@test.local"], { cwd: repoRoot });
  execFileSync("git", ["config", "user.name", "PR Gov Test"], { cwd: repoRoot });
  execFileSync("git", ["add", "."], { cwd: repoRoot });
  execFileSync("git", ["commit", "-m", "base"], { cwd: repoRoot });
  const baseRef = execFileSync("git", ["rev-parse", "HEAD"], { cwd: repoRoot, encoding: "utf8" }).trim();
  return { repoRoot, baseRef };
}

test("governed path prefixes include harvest payloads", () => {
  assert.equal(isGovernedPath("artifacts/agent-runs/harvest-x/thread-autopsy-bundle.json"), true);
  assert.equal(isGovernedPath("work-progress/harvest-packet-registry.json"), true);
  assert.equal(isGovernedPath("scripts/harvest/foo.mjs"), false);
});

test("PR diff blocks new graph-extraction.json", () => {
  const { repoRoot, baseRef } = initRepo();
  const rel = "artifacts/agent-runs/harvest-pr-test-v1/graph-extraction.json";
  fs.mkdirSync(path.dirname(path.join(repoRoot, rel)), { recursive: true });
  fs.writeFileSync(path.join(repoRoot, rel), "{}\n");
  execFileSync("git", ["add", rel], { cwd: repoRoot });
  execFileSync("git", ["commit", "-m", "add graph"], { cwd: repoRoot });
  const result = validatePrGovernance({ repoRoot, baseRef, headRef: "HEAD" });
  assert.equal(result.ok, false);
  assert.ok(result.failures.some((f) => f.includes("graph-extraction.json")));
  fs.rmSync(repoRoot, { recursive: true, force: true });
});

test("PR diff allows compact manifest and pointer only", () => {
  const { repoRoot, baseRef } = initRepo();
  const harvestId = "harvest-pr-compact-v1";
  const runDir = path.join(repoRoot, "artifacts/agent-runs", harvestId);
  fs.mkdirSync(runDir, { recursive: true });
  const manifest = {
    schemaVersion: "cross-agent-harvest-manifest-v1@1.0.0",
    harvestId,
    manifestHash: "sha256:1111111111111111111111111111111111111111111111111111111111111111",
    payloadHash: "sha256:2222222222222222222222222222222222222222222222222222222222222222",
  };
  const pointer = {
    schemaVersion: "harvest-publication-pointer-v1@1.0.0",
    harvestId,
    manifestHash: manifest.manifestHash,
    payloadHash: manifest.payloadHash,
    authoritySourceCommit: "abc",
    phaseBVerdict: "PHASE_B_COMPLETE",
  };
  fs.writeFileSync(path.join(runDir, "harvest-manifest-v1.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  fs.writeFileSync(path.join(runDir, "harvest-publication-pointer-v1.json"), `${JSON.stringify(pointer, null, 2)}\n`);
  execFileSync("git", ["add", "."], { cwd: repoRoot });
  execFileSync("git", ["commit", "-m", "compact harvest"], { cwd: repoRoot });
  const result = validatePrGovernance({ repoRoot, baseRef, headRef: "HEAD" });
  assert.equal(result.ok, true, result.failures?.join("; "));
  fs.rmSync(repoRoot, { recursive: true, force: true });
});

console.log(`\n# tests ${passed + failed}`);
console.log(`# pass  ${passed}`);
console.log(`# fail  ${failed}`);
process.exit(failed > 0 ? 1 : 0);
