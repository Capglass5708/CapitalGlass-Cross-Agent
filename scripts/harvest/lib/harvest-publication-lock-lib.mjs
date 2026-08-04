import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { stripHashPrefix } from "./l-durable-bundle-lib.mjs";
import { phaseBOperationsDir } from "./publication-pointer-candidate-lib.mjs";
import { PHASE_B_VERDICTS } from "./publication-layer-verdict-lib.mjs";

export const LOCK_SCHEMA = "harvest-publication-lock-v1@1.0.0";
export const LOCK_SCOPES = {
  PHASE_B: "PHASE_B_PUBLICATION",
  PHASE_C: "PHASE_C_POINTER",
};
export const TARGET_VERDICT = "HARVEST_SINGLE_FLIGHT_PASS";

export const LOCK_VERDICTS = {
  ACQUIRED: "LOCK_ACQUIRED",
  RESUMED: "LOCK_RESUMED",
  RELEASED: "LOCK_RELEASED",
  BLOCKED_PHASE_B: "BLOCKED_PUBLICATION_IN_PROGRESS",
  BLOCKED_PHASE_C: "BLOCKED_POINTER_COMMIT_IN_PROGRESS",
  STALE_RECOVERED: "STALE_LOCK_RECOVERED",
  CONFLICT: "LOCK_CONFLICT",
  IO_FAILURE: "LOCK_IO_FAILURE",
};

const DEFAULT_TTL_MS = 5 * 60 * 1000;
const STALE_RECOVERY_FILENAME = "stale-lock-recovery-receipt.json";
const LOCK_FILENAME = "lock.json";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export function hashResumeToken(token) {
  return `sha256:${crypto.createHash("sha256").update(String(token)).digest("hex")}`;
}

export function generateResumeToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function lockScopeDir(hubRoot, harvestId, payloadHash, scope) {
  const hashDir = stripHashPrefix(payloadHash);
  const scopeDir = scope === LOCK_SCOPES.PHASE_B ? "phase-b" : "phase-c";
  return path.join(
    hubRoot,
    "00-master-index",
    "_operations",
    "locks",
    "harvest-publication",
    harvestId,
    hashDir,
    scopeDir,
  );
}

export function lockFilePath(hubRoot, harvestId, payloadHash, scope) {
  return path.join(lockScopeDir(hubRoot, harvestId, payloadHash, scope), LOCK_FILENAME);
}

function blockVerdictForScope(scope) {
  return scope === LOCK_SCOPES.PHASE_C
    ? LOCK_VERDICTS.BLOCKED_PHASE_C
    : LOCK_VERDICTS.BLOCKED_PHASE_B;
}

function isExpired(lock) {
  return Date.parse(lock.expiresAt) <= Date.now();
}

function isActive(lock) {
  return lock.status === "ACTIVE" && !isExpired(lock);
}

export function readPublicationLock(hubRoot, harvestId, payloadHash, scope) {
  const filePath = lockFilePath(hubRoot, harvestId, payloadHash, scope);
  if (!fs.existsSync(filePath)) return null;
  return readJson(filePath);
}

export function heartbeatPublicationLock({
  hubRoot,
  harvestId,
  payloadHash,
  scope,
  ownerId,
  resumeToken,
  ttlMs = DEFAULT_TTL_MS,
}) {
  const filePath = lockFilePath(hubRoot, harvestId, payloadHash, scope);
  const lock = readPublicationLock(hubRoot, harvestId, payloadHash, scope);
  if (!lock || lock.status !== "ACTIVE") {
    return { ok: false, verdict: LOCK_VERDICTS.CONFLICT };
  }
  if (lock.ownerId !== ownerId || lock.resumeTokenHash !== hashResumeToken(resumeToken)) {
    return { ok: false, verdict: LOCK_VERDICTS.CONFLICT };
  }
  const now = new Date();
  lock.heartbeatAt = now.toISOString();
  lock.expiresAt = new Date(now.getTime() + ttlMs).toISOString();
  writeJson(filePath, lock);
  return { ok: true, verdict: "LOCK_HEARTBEAT", lock };
}

function writeStaleRecoveryReceipt(scopeDir, receipt) {
  writeJson(path.join(scopeDir, STALE_RECOVERY_FILENAME), receipt);
}

function tryExclusiveCreate(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, { flag: "wx" });
}

export function acquirePublicationLock({
  hubRoot,
  harvestId,
  payloadHash,
  scope,
  ownerId,
  runId = crypto.randomUUID(),
  host = os.hostname(),
  processId = process.pid,
  resumeToken = generateResumeToken(),
  ttlMs = DEFAULT_TTL_MS,
  allowStaleRecovery = true,
}) {
  const filePath = lockFilePath(hubRoot, harvestId, payloadHash, scope);
  const scopeDir = lockScopeDir(hubRoot, harvestId, payloadHash, scope);
  const now = new Date();
  const record = {
    schemaVersion: LOCK_SCHEMA,
    harvestId,
    payloadHash,
    scope,
    ownerId,
    runId,
    host,
    processId,
    acquiredAt: now.toISOString(),
    heartbeatAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + ttlMs).toISOString(),
    status: "ACTIVE",
    resumeTokenHash: hashResumeToken(resumeToken),
    recoveryPolicy: "OWNER_RESUME_OR_EXPIRED_RECOVERY",
  };

  try {
    tryExclusiveCreate(filePath, `${JSON.stringify(record, null, 2)}\n`);
    return {
      ok: true,
      verdict: LOCK_VERDICTS.ACQUIRED,
      lock: record,
      resumeToken,
      lockPath: filePath,
    };
  } catch (error) {
    if (error.code !== "EEXIST") {
      return { ok: false, verdict: LOCK_VERDICTS.IO_FAILURE, error: error.message };
    }
  }

  let existing;
  try {
    existing = readPublicationLock(hubRoot, harvestId, payloadHash, scope);
  } catch (error) {
    return { ok: false, verdict: LOCK_VERDICTS.IO_FAILURE, error: error.message };
  }

  if (!existing) {
    return { ok: false, verdict: LOCK_VERDICTS.IO_FAILURE, error: "lock_exists_but_unreadable" };
  }

  if (
    existing.ownerId === ownerId &&
    existing.resumeTokenHash === hashResumeToken(resumeToken) &&
    isActive(existing)
  ) {
    return {
      ok: true,
      verdict: LOCK_VERDICTS.RESUMED,
      lock: existing,
      resumeToken,
      lockPath: filePath,
    };
  }

  if (isActive(existing)) {
    return {
      ok: false,
      verdict: blockVerdictForScope(scope),
      lock: existing,
      lockPath: filePath,
    };
  }

  if (!allowStaleRecovery) {
    return { ok: false, verdict: LOCK_VERDICTS.CONFLICT, lock: existing };
  }

  const staleReceipt = {
    schemaVersion: "harvest-stale-lock-recovery-receipt-v1@1.0.0",
    harvestId,
    payloadHash,
    scope,
    priorLock: existing,
    recoveredAt: now.toISOString(),
    recoveredBy: ownerId,
    verdict: LOCK_VERDICTS.STALE_RECOVERED,
  };
  writeStaleRecoveryReceipt(scopeDir, staleReceipt);

  const archivedPath = path.join(scopeDir, `lock-archived-${Date.now()}.json`);
  writeJson(archivedPath, { ...existing, status: "STALE_RECOVERED" });
  fs.unlinkSync(filePath);

  try {
    const replacement = {
      ...record,
      acquiredAt: now.toISOString(),
      heartbeatAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + ttlMs).toISOString(),
    };
    tryExclusiveCreate(filePath, `${JSON.stringify(replacement, null, 2)}\n`);
    return {
      ok: true,
      verdict: LOCK_VERDICTS.STALE_RECOVERED,
      lock: replacement,
      resumeToken,
      lockPath: filePath,
      staleRecoveryReceipt: staleReceipt,
      archivedPath,
    };
  } catch (error) {
    return { ok: false, verdict: LOCK_VERDICTS.IO_FAILURE, error: error.message, staleRecoveryReceipt: staleReceipt };
  }
}

export function releasePublicationLock({
  hubRoot,
  harvestId,
  payloadHash,
  scope,
  ownerId,
  resumeToken,
}) {
  const filePath = lockFilePath(hubRoot, harvestId, payloadHash, scope);
  const lock = readPublicationLock(hubRoot, harvestId, payloadHash, scope);
  if (!lock) {
    return { ok: true, verdict: LOCK_VERDICTS.RELEASED, reason: "already_absent" };
  }
  if (lock.ownerId !== ownerId || lock.resumeTokenHash !== hashResumeToken(resumeToken)) {
    return { ok: false, verdict: LOCK_VERDICTS.CONFLICT };
  }
  const released = { ...lock, status: "RELEASED", releasedAt: new Date().toISOString() };
  writeJson(path.join(path.dirname(filePath), `lock-released-${Date.now()}.json`), released);
  fs.unlinkSync(filePath);
  return { ok: true, verdict: LOCK_VERDICTS.RELEASED, lock: released };
}

export function isPhaseBAlreadyComplete(hubRoot, harvestId, payloadHash) {
  const ops = phaseBOperationsDir(hubRoot, harvestId, payloadHash);
  const receiptPath = path.join(ops.dir, "phase-b-receipt.json");
  if (!fs.existsSync(receiptPath)) return false;
  const receipt = readJson(receiptPath);
  return (
    receipt.phaseBVerdict === PHASE_B_VERDICTS.COMPLETE ||
    receipt.phaseBVerdict === PHASE_B_VERDICTS.NOOP
  );
}

function gitPointerPath(repoRoot, harvestId) {
  return path.join(repoRoot, "artifacts/agent-runs", harvestId, "harvest-publication-pointer-v1.json");
}

export function isPhaseCAlreadyComplete(repoRoot, harvestId, payloadHash) {
  const pointerPath = gitPointerPath(repoRoot, harvestId);
  if (!fs.existsSync(pointerPath)) return false;
  const pointer = readJson(pointerPath);
  return pointer.payloadHash === payloadHash;
}

export function withPublicationLock({
  hubRoot,
  harvestId,
  payloadHash,
  scope,
  ownerId,
  resumeToken,
  runId,
  fn,
}) {
  const acquired = acquirePublicationLock({
    hubRoot,
    harvestId,
    payloadHash,
    scope,
    ownerId,
    runId,
    resumeToken,
  });
  if (!acquired.ok) {
    return { ok: false, lock: acquired, verdict: acquired.verdict };
  }
  const token = acquired.resumeToken;
  try {
    const result = fn({ lock: acquired.lock, resumeToken: token, lockVerdict: acquired.verdict });
    releasePublicationLock({
      hubRoot,
      harvestId,
      payloadHash,
      scope,
      ownerId,
      resumeToken: token,
    });
    return { ok: true, lock: acquired, result, verdict: result?.verdict ?? acquired.verdict };
  } catch (error) {
    releasePublicationLock({
      hubRoot,
      harvestId,
      payloadHash,
      scope,
      ownerId,
      resumeToken: token,
    });
    throw error;
  }
}
