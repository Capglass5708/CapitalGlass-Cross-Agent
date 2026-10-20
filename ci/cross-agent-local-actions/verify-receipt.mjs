import { createHash, verify } from "node:crypto";
import { readFileSync } from "node:fs";

import { canonicalSerialize } from "./canonical.mjs";

export const RECEIPT_SCHEMA = "night-owl-ci-receipt-v1";
export const EVIDENCE_SCHEMA = "night-owl-ci-evidence-v1";
export const LEDGER_SCHEMA = "night-owl-ci-ledger-v1";
export const PROFILES = Object.freeze(["night-owl", "general", "blackbox-server", "intelligence", "cross-agent"]);
export const EVIDENCE_KEYS = Object.freeze([
  "command",
  "commit",
  "exitCode",
  "finishedAt",
  "passed",
  "profile",
  "schema",
  "startedAt",
  "stderrSha256",
  "stdoutSha256",
]);

export function evidenceBytes(evidence) {
  assertEvidence(evidence);
  return Buffer.from(canonicalSerialize(evidence));
}

export function assertEvidence(evidence) {
  if (!evidence || typeof evidence !== "object" || Array.isArray(evidence)) {
    throw new Error("EVIDENCE_MALFORMED");
  }
  const keys = Object.keys(evidence).sort();
  if (keys.join(",") !== EVIDENCE_KEYS.join(",")) {
    throw new Error("EVIDENCE_KEYS");
  }
  if (evidence.schema !== EVIDENCE_SCHEMA) throw new Error("EVIDENCE_SCHEMA");
  if (!PROFILES.includes(evidence.profile)) throw new Error("EVIDENCE_PROFILE");
  if (evidence.passed !== true || evidence.exitCode !== 0) throw new Error("EVIDENCE_NOT_PASS");
  if (typeof evidence.commit !== "string" || !/^[0-9a-f]{40}$/.test(evidence.commit)) {
    throw new Error("EVIDENCE_COMMIT");
  }
  for (const field of ["stdoutSha256", "stderrSha256"]) {
    if (typeof evidence[field] !== "string" || !/^[0-9a-f]{64}$/.test(evidence[field])) {
      throw new Error("EVIDENCE_HASH");
    }
  }
}

export function unsignedReceipt(receipt) {
  const { signature, ...body } = receipt;
  if (signature === undefined) throw new Error("RECEIPT_UNSIGNED");
  return body;
}

export function verifyReceipt(receipt, publicKeyPem) {
  if (!receipt || receipt.schema !== RECEIPT_SCHEMA) throw new Error("RECEIPT_SCHEMA");
  const collectors = new Set(["night-owl-ci-collector", "local-actions-ci-collector"]);
  if (!collectors.has(receipt.collector)) throw new Error("RECEIPT_COLLECTOR");
  if (receipt.runnerAttested !== false) throw new Error("RUNNER_ATTESTED");
  if (typeof receipt.signature !== "string" || !receipt.signature) throw new Error("RECEIPT_UNSIGNED");
  assertEvidence(receipt.evidence);
  if (receipt.commit !== receipt.evidence.commit) throw new Error("RECEIPT_COMMIT");
  if (receipt.profile !== receipt.evidence.profile) throw new Error("RECEIPT_PROFILE");
  if (receipt.runnerDestroyed !== undefined && receipt.runnerDestroyed !== true) {
    throw new Error("RUNNER_NOT_DESTROYED");
  }
  assertObservation(receipt);
  const body = canonicalSerialize(unsignedReceipt(receipt));
  const ok = verify(null, Buffer.from(body), publicKeyPem, Buffer.from(receipt.signature, "base64"));
  if (!ok) throw new Error("RECEIPT_SIGNATURE");
  return { ok: true, commit: receipt.commit, bodySha256: createHash("sha256").update(body).digest("hex") };
}

export function verifyLedger(ledgerText, receipt) {
  const lines = ledgerText.split("\n").filter((line) => line.length > 0);
  if (lines.length < 2) throw new Error("LEDGER_SHORT");
  let prev = null;
  let found = null;
  for (let index = 0; index < lines.length; index += 1) {
    const row = JSON.parse(lines[index]);
    if (row.schema !== LEDGER_SCHEMA || row.seq !== index) throw new Error("LEDGER_SEQ");
    if (row.prev !== prev) throw new Error("LEDGER_PREV");
    prev = createHash("sha256").update(lines[index]).digest("hex");
    if (row.seq > 0 && row.receiptSha256 === createHash("sha256").update(canonicalSerialize(receipt)).digest("hex")) {
      found = row;
    }
  }
  if (!found) throw new Error("LEDGER_RECEIPT_ABSENT");
  if (found.commit !== receipt.commit) throw new Error("LEDGER_COMMIT");
  if (receipt.runnerDestroyed === true && found.runnerDestroyed !== true) throw new Error("LEDGER_DESTROYED");
  return { ok: true, seq: found.seq, commit: found.commit };
}

export function authoritativeCiCredit(receipt, publicKeyPem) {
  const verified = verifyReceipt(receipt, publicKeyPem);
  if (!receipt.observation || receipt.runnerDestroyed !== true) throw new Error("CI_CREDIT_REFUSED");
  return verified;
}

function assertObservation(receipt) {
  const observation = receipt.observation;
  if (!observation) return;
  if (observation.schema !== "night-owl-ci-observation-v1") throw new Error("OBSERVATION_SCHEMA");
  if (observation.destroyed !== true || receipt.runnerDestroyed !== true) throw new Error("RUNNER_NOT_DESTROYED");
  if (observation.exitCode !== receipt.observedExit || observation.exitCode !== receipt.evidence.exitCode) {
    throw new Error("OBSERVATION_EXIT");
  }
  if (observation.signingMaterialMounted !== false) throw new Error("OBSERVATION_MOUNT");
  if (observation.readonlyRootfs !== true || observation.networkNone !== true) throw new Error("OBSERVATION_RUNTIME");
  if (observation.manifestCommand !== receipt.evidence.command) throw new Error("OBSERVATION_COMMAND");
  if (typeof observation.containerId !== "string" || !/^[0-9a-f]{64}$/.test(observation.containerId)) {
    throw new Error("OBSERVATION_CONTAINER");
  }
}

export function loadPublicKey(path) {
  return readFileSync(path, "utf8");
}
