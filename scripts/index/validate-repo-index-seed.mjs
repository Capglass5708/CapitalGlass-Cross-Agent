#!/usr/bin/env node
/**
 * Validate index/repo-index.seed.v1.json — the hand-authored authority the
 * CG-AppBuilder-MCP federated-repo-index compiler reads to produce
 * index/cg-federated-repo-index.v1.json.
 *
 * The compiler owns repoSha, digests and provenance. This gate owns the claims
 * the seed makes about this repo: that every path it points at exists, every
 * entrypoint it names is a real function, and every cross-reference resolves.
 *
 * A federated index whose pointers have rotted routes agents to nothing, so
 * this fails closed.
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const REPO_ROOT = path.resolve(import.meta.dirname, "..", "..");
const SEED_PATH = path.join(REPO_ROOT, "index", "repo-index.seed.v1.json");

const failures = [];
const fail = (msg) => failures.push(msg);

function exists(rel) {
  return fs.existsSync(path.join(REPO_ROOT, rel));
}

function main() {
  if (!fs.existsSync(SEED_PATH)) {
    console.error(`index:validate-seed FAIL — missing ${SEED_PATH}`);
    process.exit(1);
  }

  let seed;
  try {
    seed = JSON.parse(fs.readFileSync(SEED_PATH, "utf8"));
  } catch (err) {
    console.error(`index:validate-seed FAIL — seed is not valid JSON: ${err.message}`);
    process.exit(1);
  }

  const codePointers = seed.CODE_POINTERS ?? [];
  const workPackages = new Set(seed.WORK_PACKAGES ?? []);
  const programIds = new Set((seed.PROGRAMS ?? []).map((p) => p.id));
  const authorityIds = new Set((seed.authorities ?? []).map((a) => a.authorityId));

  // Every code pointer resolves on disk, and its program is declared.
  for (const pointer of codePointers) {
    if (!exists(pointer.path)) fail(`CODE_POINTERS path does not exist: ${pointer.path}`);
    if (pointer.program && !workPackages.has(pointer.program)) {
      fail(`CODE_POINTERS program not in WORK_PACKAGES: ${pointer.program} (${pointer.path})`);
    }
  }

  // PROGRAMS and WORK_PACKAGES describe the same set.
  for (const id of programIds) {
    if (!workPackages.has(id)) fail(`PROGRAMS id missing from WORK_PACKAGES: ${id}`);
  }
  for (const id of workPackages) {
    if (!programIds.has(id)) fail(`WORK_PACKAGES id missing from PROGRAMS: ${id}`);
  }

  // requireStructured means the structured arrays must actually carry records.
  if (seed.requireStructured === true) {
    if ((seed.authorities ?? []).length === 0) fail("requireStructured is true but authorities[] is empty");
    if ((seed.capabilities ?? []).length === 0) fail("requireStructured is true but capabilities[] is empty");
  }

  // Structured capabilities must point at a real function in a real file.
  for (const capability of seed.capabilities ?? []) {
    const implPath = capability.implementation?.path;
    const entrypoint = capability.implementation?.entrypoint;

    if (!implPath || !entrypoint) {
      fail(`capability ${capability.capabilityId} is missing implementation.path or .entrypoint`);
    } else if (!exists(implPath)) {
      fail(`capability ${capability.capabilityId} implementation path does not exist: ${implPath}`);
    } else {
      const source = fs.readFileSync(path.join(REPO_ROOT, implPath), "utf8");
      const declared = new RegExp(`function\\s+${entrypoint}\\b`).test(source);
      if (!declared) {
        fail(`capability ${capability.capabilityId} entrypoint "${entrypoint}" is not a function in ${implPath}`);
      }
    }

    if (capability.authorityId && !authorityIds.has(capability.authorityId)) {
      fail(`capability ${capability.capabilityId} references undeclared authorityId: ${capability.authorityId}`);
    }
  }

  // Receipts, decisions and artifact roots must resolve.
  for (const receipt of seed.LATEST_RECEIPTS ?? []) {
    if (!exists(receipt.path)) fail(`LATEST_RECEIPTS path does not exist: ${receipt.path}`);
  }
  for (const decision of seed.DECISIONS ?? []) {
    if (!exists(decision)) fail(`DECISIONS path does not exist: ${decision}`);
  }
  for (const root of seed.ARTIFACT_ROOTS ?? []) {
    if (!exists(root)) fail(`ARTIFACT_ROOTS path does not exist: ${root}`);
  }

  // Supersession must land on a package this repo actually declares.
  for (const item of seed.SUPERSEDED_ITEMS ?? []) {
    if (item.supersededBy && !workPackages.has(item.supersededBy)) {
      fail(`SUPERSEDED_ITEMS supersededBy is not a declared work package: ${item.supersededBy}`);
    }
  }

  // Identifiers are unique.
  for (const [key, idField] of [["authorities", "authorityId"], ["capabilities", "capabilityId"]]) {
    const ids = (seed[key] ?? []).map((entry) => entry[idField]);
    const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
    for (const duplicate of new Set(duplicates)) fail(`duplicate ${idField}: ${duplicate}`);
  }

  if (failures.length > 0) {
    console.error("index:validate-seed FAIL");
    for (const failure of failures) console.error(`  - ${failure}`);
    process.exit(1);
  }

  console.log(
    `index:validate-seed PASS — ${codePointers.length} code pointers, ` +
      `${(seed.capabilities ?? []).length} capabilities, ${(seed.authorities ?? []).length} authorities, ` +
      `${(seed.PROGRAMS ?? []).length} programs, ${(seed.LATEST_RECEIPTS ?? []).length} receipts`
  );
}

main();
