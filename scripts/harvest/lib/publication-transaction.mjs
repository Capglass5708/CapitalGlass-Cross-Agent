import fs from "node:fs";
import path from "node:path";

import { PUBLICATION_STATES } from "./publication-run-contract.mjs";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export function transactionStatePath(repoRoot, harvestId, runId) {
  return path.join(repoRoot, "artifacts/agent-runs", harvestId, runId, "transaction-state.json");
}

export function loadOrCreateTransaction({ repoRoot, harvestId, runId, sourceCommitSha }) {
  const statePath = transactionStatePath(repoRoot, harvestId, runId);
  if (fs.existsSync(statePath)) return readJson(statePath);

  const tx = {
    schemaVersion: "harvest-publication-transaction-v1@1.0.0",
    harvestId,
    runId,
    sourceCommitSha,
    state: "CREATED",
    completedPhases: [],
    failedPhase: null,
    phaseReceipts: {},
    resumeAvailable: true,
    rollbackStatus: "not-run",
    updatedAt: new Date().toISOString(),
  };
  writeJson(statePath, tx);
  return tx;
}

export function advanceTransaction({ repoRoot, harvestId, runId, phase, receipt = {}, nextState = null }) {
  const statePath = transactionStatePath(repoRoot, harvestId, runId);
  const tx = fs.existsSync(statePath)
    ? readJson(statePath)
    : loadOrCreateTransaction({ repoRoot, harvestId, runId, sourceCommitSha: receipt.sourceCommitSha ?? "unknown" });

  if (!tx.completedPhases.includes(phase)) tx.completedPhases.push(phase);
  tx.phaseReceipts[phase] = { ...receipt, at: new Date().toISOString() };
  if (nextState && PUBLICATION_STATES.includes(nextState)) tx.state = nextState;
  tx.updatedAt = new Date().toISOString();
  tx.resumeAvailable = tx.state !== "FINALIZED" && tx.state !== "BLOCKED";
  writeJson(statePath, tx);
  return tx;
}

export function shouldSkipPhase(tx, phase) {
  return tx.completedPhases.includes(phase);
}

export const PUBLICATION_PHASES = [
  "PREFLIGHT",
  "DRY_RUN",
  "PREPARE_STAGING",
  "CORE_L_PUBLICATION",
  "INDEX_UPDATE",
  "BLIND_RETRIEVAL",
  "OPTIONAL_PROJECTIONS",
  "POST_PUBLICATION_INTEGRITY",
  "GIT_DURABILITY",
  "FINALIZE",
];
