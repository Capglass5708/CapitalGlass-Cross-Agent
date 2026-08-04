#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import {
  acquirePublicationLock,
  heartbeatPublicationLock,
  lockScopeDir,
  LOCK_SCOPES,
  LOCK_VERDICTS,
  readPublicationLock,
  releasePublicationLock,
  TARGET_VERDICT,
} from "../harvest/lib/harvest-publication-lock-lib.mjs";
import { stripHashPrefix } from "../harvest/lib/l-durable-bundle-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const WORKER = path.join(REPO_ROOT, "scripts/harvest/lock-worker.mjs");
const HARVEST_ID = "harvest-single-flight-fixture-v1";
const PAYLOAD_HASH = "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

const gates = {
  SINGLE_FLIGHT_PASS: false,
  ATOMIC_LOCK_ACQUISITION_PASS: false,
  REAL_PROCESS_CONTENTION_PASS: false,
  SECOND_OWNER_BLOCK_PASS: false,
  RESUME_AUTHORITY_PASS: false,
  RESUME_OWNER_PASS: false,
  HEARTBEAT_PROTECTION_PASS: false,
  STALE_LOCK_RECOVERY_PASS: false,
  STALE_LOCK_EVIDENCE_RETENTION_PASS: false,
  PHASE_B_LOCK_INTEGRATION_PASS: false,
  PHASE_C_LOCK_PASS: false,
  LOCKS_OUTSIDE_GIT_PASS: false,
  LOCKS_OUTSIDE_PAYLOAD_HASH_PASS: false,
  LOCK_RELEASE_PASS: false,
};

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

function withHub(fn) {
  const hubRoot = fs.mkdtempSync(path.join(os.tmpdir(), "harvest-lock-hub-"));
  try {
    return fn(hubRoot);
  } finally {
    fs.rmSync(hubRoot, { recursive: true, force: true });
  }
}

function gitPorcelain(repoRoot) {
  return execFileSync("git", ["-C", repoRoot, "status", "--porcelain"], { encoding: "utf8" }).trim();
}

test("first owner acquires Phase B lock", () => {
  withHub((hubRoot) => {
    const result = acquirePublicationLock({
      hubRoot,
      harvestId: HARVEST_ID,
      payloadHash: PAYLOAD_HASH,
      scope: LOCK_SCOPES.PHASE_B,
      ownerId: "owner-a",
    });
    assert.equal(result.ok, true);
    assert.equal(result.verdict, LOCK_VERDICTS.ACQUIRED);
    releasePublicationLock({
      hubRoot,
      harvestId: HARVEST_ID,
      payloadHash: PAYLOAD_HASH,
      scope: LOCK_SCOPES.PHASE_B,
      ownerId: "owner-a",
      resumeToken: result.resumeToken,
    });
    gates.ATOMIC_LOCK_ACQUISITION_PASS = true;
  });
});

test("authorized same owner resumes with matching resume token", () => {
  withHub((hubRoot) => {
    const first = acquirePublicationLock({
      hubRoot,
      harvestId: HARVEST_ID,
      payloadHash: PAYLOAD_HASH,
      scope: LOCK_SCOPES.PHASE_B,
      ownerId: "owner-a",
    });
    const resumed = acquirePublicationLock({
      hubRoot,
      harvestId: HARVEST_ID,
      payloadHash: PAYLOAD_HASH,
      scope: LOCK_SCOPES.PHASE_B,
      ownerId: "owner-a",
      resumeToken: first.resumeToken,
    });
    assert.equal(resumed.verdict, LOCK_VERDICTS.RESUMED);
    releasePublicationLock({
      hubRoot,
      harvestId: HARVEST_ID,
      payloadHash: PAYLOAD_HASH,
      scope: LOCK_SCOPES.PHASE_B,
      ownerId: "owner-a",
      resumeToken: first.resumeToken,
    });
    gates.RESUME_OWNER_PASS = true;
    gates.RESUME_AUTHORITY_PASS = true;
  });
});

test("different owner blocks while active lock exists", () => {
  withHub((hubRoot) => {
    const first = acquirePublicationLock({
      hubRoot,
      harvestId: HARVEST_ID,
      payloadHash: PAYLOAD_HASH,
      scope: LOCK_SCOPES.PHASE_B,
      ownerId: "owner-a",
    });
    const blocked = acquirePublicationLock({
      hubRoot,
      harvestId: HARVEST_ID,
      payloadHash: PAYLOAD_HASH,
      scope: LOCK_SCOPES.PHASE_B,
      ownerId: "owner-b",
    });
    assert.equal(blocked.ok, false);
    assert.equal(blocked.verdict, LOCK_VERDICTS.BLOCKED_PHASE_B);
    releasePublicationLock({
      hubRoot,
      harvestId: HARVEST_ID,
      payloadHash: PAYLOAD_HASH,
      scope: LOCK_SCOPES.PHASE_B,
      ownerId: "owner-a",
      resumeToken: first.resumeToken,
    });
    gates.SECOND_OWNER_BLOCK_PASS = true;
  });
});

test("two subprocesses race and exactly one acquires", () => {
  withHub((hubRoot) => {
    const outA = path.join(os.tmpdir(), `lock-race-a-${process.pid}.json`);
    const outB = path.join(os.tmpdir(), `lock-race-b-${process.pid}.json`);
    const cmd = `
      node "${WORKER}" --hub "${hubRoot}" --harvest "${HARVEST_ID}" --hash "${PAYLOAD_HASH}" --scope "${LOCK_SCOPES.PHASE_B}" --owner race-a > "${outA}" 2>/dev/null &
      node "${WORKER}" --hub "${hubRoot}" --harvest "${HARVEST_ID}" --hash "${PAYLOAD_HASH}" --scope "${LOCK_SCOPES.PHASE_B}" --owner race-b > "${outB}" 2>/dev/null &
      wait
    `;
    execFileSync("bash", ["-c", cmd]);
    const outcomes = [outA, outB].map((file) => JSON.parse(fs.readFileSync(file, "utf8")));
    fs.rmSync(outA, { force: true });
    fs.rmSync(outB, { force: true });
    const acquired = outcomes.filter((o) => o.ok).length;
    const blocked = outcomes.filter((o) => !o.ok).length;
    assert.equal(acquired, 1);
    assert.equal(blocked, 1);
    for (const lock of outcomes.filter((o) => o.ok)) {
      releasePublicationLock({
        hubRoot,
        harvestId: HARVEST_ID,
        payloadHash: PAYLOAD_HASH,
        scope: LOCK_SCOPES.PHASE_B,
        ownerId: lock.lock.ownerId,
        resumeToken: lock.resumeToken,
      });
    }
    gates.REAL_PROCESS_CONTENTION_PASS = true;
  });
});

test("heartbeat protects active lock from stale recovery", () => {
  withHub((hubRoot) => {
    const first = acquirePublicationLock({
      hubRoot,
      harvestId: HARVEST_ID,
      payloadHash: PAYLOAD_HASH,
      scope: LOCK_SCOPES.PHASE_B,
      ownerId: "owner-a",
      ttlMs: 200,
    });
    const hb = heartbeatPublicationLock({
      hubRoot,
      harvestId: HARVEST_ID,
      payloadHash: PAYLOAD_HASH,
      scope: LOCK_SCOPES.PHASE_B,
      ownerId: "owner-a",
      resumeToken: first.resumeToken,
      ttlMs: 5000,
    });
    assert.equal(hb.ok, true);
    const blocked = acquirePublicationLock({
      hubRoot,
      harvestId: HARVEST_ID,
      payloadHash: PAYLOAD_HASH,
      scope: LOCK_SCOPES.PHASE_B,
      ownerId: "owner-b",
    });
    assert.equal(blocked.verdict, LOCK_VERDICTS.BLOCKED_PHASE_B);
    releasePublicationLock({
      hubRoot,
      harvestId: HARVEST_ID,
      payloadHash: PAYLOAD_HASH,
      scope: LOCK_SCOPES.PHASE_B,
      ownerId: "owner-a",
      resumeToken: first.resumeToken,
    });
    gates.HEARTBEAT_PROTECTION_PASS = true;
  });
});

test("expired lock is recoverable with evidence retained", () => {
  withHub((hubRoot) => {
    const first = acquirePublicationLock({
      hubRoot,
      harvestId: HARVEST_ID,
      payloadHash: PAYLOAD_HASH,
      scope: LOCK_SCOPES.PHASE_B,
      ownerId: "owner-dead",
      ttlMs: 1,
    });
    const lockPath = path.join(
      lockScopeDir(hubRoot, HARVEST_ID, PAYLOAD_HASH, LOCK_SCOPES.PHASE_B),
      "lock.json",
    );
    const stale = JSON.parse(fs.readFileSync(lockPath, "utf8"));
    stale.expiresAt = new Date(Date.now() - 1000).toISOString();
    stale.heartbeatAt = stale.expiresAt;
    fs.writeFileSync(lockPath, `${JSON.stringify(stale, null, 2)}\n`);
    const recovered = acquirePublicationLock({
      hubRoot,
      harvestId: HARVEST_ID,
      payloadHash: PAYLOAD_HASH,
      scope: LOCK_SCOPES.PHASE_B,
      ownerId: "owner-new",
    });
    assert.equal(recovered.ok, true);
    assert.equal(recovered.verdict, LOCK_VERDICTS.STALE_RECOVERED);
    const scopeDir = lockScopeDir(hubRoot, HARVEST_ID, PAYLOAD_HASH, LOCK_SCOPES.PHASE_B);
    assert.equal(fs.existsSync(path.join(scopeDir, "stale-lock-recovery-receipt.json")), true);
    releasePublicationLock({
      hubRoot,
      harvestId: HARVEST_ID,
      payloadHash: PAYLOAD_HASH,
      scope: LOCK_SCOPES.PHASE_B,
      ownerId: "owner-new",
      resumeToken: recovered.resumeToken,
    });
    gates.STALE_LOCK_RECOVERY_PASS = true;
    gates.STALE_LOCK_EVIDENCE_RETENTION_PASS = true;
  });
});

test("different payload hashes use independent locks", () => {
  withHub((hubRoot) => {
    const hashB = "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
    const a = acquirePublicationLock({
      hubRoot,
      harvestId: HARVEST_ID,
      payloadHash: PAYLOAD_HASH,
      scope: LOCK_SCOPES.PHASE_B,
      ownerId: "owner-a",
    });
    const b = acquirePublicationLock({
      hubRoot,
      harvestId: HARVEST_ID,
      payloadHash: hashB,
      scope: LOCK_SCOPES.PHASE_B,
      ownerId: "owner-b",
    });
    assert.equal(a.ok, true);
    assert.equal(b.ok, true);
    releasePublicationLock({
      hubRoot,
      harvestId: HARVEST_ID,
      payloadHash: PAYLOAD_HASH,
      scope: LOCK_SCOPES.PHASE_B,
      ownerId: "owner-a",
      resumeToken: a.resumeToken,
    });
    releasePublicationLock({
      hubRoot,
      harvestId: HARVEST_ID,
      payloadHash: hashB,
      scope: LOCK_SCOPES.PHASE_B,
      ownerId: "owner-b",
      resumeToken: b.resumeToken,
    });
  });
});

test("Phase B and Phase C scopes are independent", () => {
  withHub((hubRoot) => {
    const phaseB = acquirePublicationLock({
      hubRoot,
      harvestId: HARVEST_ID,
      payloadHash: PAYLOAD_HASH,
      scope: LOCK_SCOPES.PHASE_B,
      ownerId: "owner-a",
    });
    const phaseC = acquirePublicationLock({
      hubRoot,
      harvestId: HARVEST_ID,
      payloadHash: PAYLOAD_HASH,
      scope: LOCK_SCOPES.PHASE_C,
      ownerId: "owner-b",
    });
    assert.equal(phaseB.ok, true);
    assert.equal(phaseC.ok, true);
    releasePublicationLock({
      hubRoot,
      harvestId: HARVEST_ID,
      payloadHash: PAYLOAD_HASH,
      scope: LOCK_SCOPES.PHASE_B,
      ownerId: "owner-a",
      resumeToken: phaseB.resumeToken,
    });
    releasePublicationLock({
      hubRoot,
      harvestId: HARVEST_ID,
      payloadHash: PAYLOAD_HASH,
      scope: LOCK_SCOPES.PHASE_C,
      ownerId: "owner-b",
      resumeToken: phaseC.resumeToken,
    });
    gates.PHASE_B_LOCK_INTEGRATION_PASS = true;
    gates.PHASE_C_LOCK_PASS = true;
  });
});

test("lock operations leave Git porcelain unchanged", () => {
  withHub((hubRoot) => {
    const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), "harvest-lock-git-"));
    fs.writeFileSync(path.join(repoRoot, "README.md"), "# lock git\n");
    execFileSync("git", ["init"], { cwd: repoRoot });
    execFileSync("git", ["add", "."], { cwd: repoRoot });
    execFileSync("git", ["commit", "-m", "init"], { cwd: repoRoot });
    const before = gitPorcelain(repoRoot);
    const lock = acquirePublicationLock({
      hubRoot,
      harvestId: HARVEST_ID,
      payloadHash: PAYLOAD_HASH,
      scope: LOCK_SCOPES.PHASE_C,
      ownerId: "owner-a",
    });
    releasePublicationLock({
      hubRoot,
      harvestId: HARVEST_ID,
      payloadHash: PAYLOAD_HASH,
      scope: LOCK_SCOPES.PHASE_C,
      ownerId: "owner-a",
      resumeToken: lock.resumeToken,
    });
    assert.equal(gitPorcelain(repoRoot), before);
    fs.rmSync(repoRoot, { recursive: true, force: true });
    gates.LOCKS_OUTSIDE_GIT_PASS = true;
  });
});

test("lock path is outside payload hash inventory", () => {
  withHub((hubRoot) => {
    const lock = acquirePublicationLock({
      hubRoot,
      harvestId: HARVEST_ID,
      payloadHash: PAYLOAD_HASH,
      scope: LOCK_SCOPES.PHASE_B,
      ownerId: "owner-a",
    });
    const lockRel = path.relative(hubRoot, lock.lockPath).replace(/\\/g, "/");
    assert.ok(lockRel.includes("_operations/locks/harvest-publication"));
    assert.ok(lockRel.includes(stripHashPrefix(PAYLOAD_HASH)));
    assert.equal(lockRel.includes("payload"), false);
    releasePublicationLock({
      hubRoot,
      harvestId: HARVEST_ID,
      payloadHash: PAYLOAD_HASH,
      scope: LOCK_SCOPES.PHASE_B,
      ownerId: "owner-a",
      resumeToken: lock.resumeToken,
    });
    assert.equal(readPublicationLock(hubRoot, HARVEST_ID, PAYLOAD_HASH, LOCK_SCOPES.PHASE_B), null);
    gates.LOCKS_OUTSIDE_PAYLOAD_HASH_PASS = true;
    gates.LOCK_RELEASE_PASS = true;
  });
});

if (failed === 0) {
  gates.SINGLE_FLIGHT_PASS = true;
}

console.log(`\n# tests ${passed + failed}`);
console.log(`# pass  ${passed}`);
console.log(`# fail  ${failed}`);
console.log(`# target ${TARGET_VERDICT}`);
for (const [gate, ok] of Object.entries(gates)) {
  console.log(`# gate ${gate} ${ok ? "PASS" : "FAIL"}`);
}

process.exit(failed === 0 && gates.SINGLE_FLIGHT_PASS ? 0 : 1);
