/** @typedef {import('./publication-run-contract-types.mjs').PublicationState} PublicationState */

export const PUBLICATION_RUN_SCHEMA = "harvest-publication-run-v1@1.0.0";

export const PUBLICATION_STATES = [
  "CREATED",
  "PREFLIGHTED",
  "DRY_RUN_VALIDATED",
  "PREPARED",
  "CORE_PUBLISHED",
  "INDEXED",
  "RETRIEVAL_VERIFIED",
  "OPTIONAL_PROJECTIONS_ATTEMPTED",
  "INTEGRITY_VERIFIED",
  "GIT_RECORDED",
  "FINALIZED",
  "ROLLED_BACK",
  "BLOCKED",
  "FAILED",
];

export const GATE_CLASSES = ["REQUIRED_CORE", "OPTIONAL_PROJECTION", "INFORMATIONAL"];

export const GATE_RESULTS = [
  "PASS",
  "WARN",
  "FAIL",
  "BLOCKED",
  "SKIPPED_NOT_APPLICABLE",
  "SKIPPED_OPTIONAL_UNAVAILABLE",
];

export const CAPABILITY_RESULTS = [
  "AVAILABLE",
  "OPTIONAL_UNAVAILABLE",
  "REQUIRED_UNAVAILABLE",
  "UNVERIFIED",
];

export const FINAL_VERDICTS = [
  "CLOSED_GO",
  "GO_WITH_WARN",
  "OPERATIONAL_GIT_PENDING",
  "BLOCKED",
  "FAILED",
  "ROLLED_BACK",
];

export const FAILURE_CODES = [
  "BLOCK_AUTHORITY_UNAVAILABLE",
  "BLOCK_AUTHORITY_CONFLICT",
  "BLOCK_BASELINE_DRIFT",
  "BLOCK_DIRTY_WORKTREE",
  "BLOCK_REQUIRED_CAPABILITY",
  "BLOCK_L_UNAVAILABLE",
  "BLOCK_Z_STALE_SOURCE",
  "BLOCK_Z_SOURCE_INCOMPLETE",
  "BLOCK_GIT_PROTOCOL_OVERWRITE_RISK",
  "BLOCK_DRY_RUN_DESTRUCTIVE",
  "BLOCK_TRANSACTION_UNRECOVERABLE",
  "BLOCK_DUPLICATION_INDEX_UNAVAILABLE",
  "BLOCK_INTEGRITY_REGRESSION",
  "BLOCK_GIT_DURABILITY",
  "WARN_OPTIONAL_SUPABASE_UNAVAILABLE",
  "WARN_OPTIONAL_Z_UNAVAILABLE",
  "WARN_PROMPTOPS_REVIEW_PENDING",
  "WARN_TESTS_PARTIAL",
  "WARN_GIT_RECORDING_PENDING",
];

export function createPublicationRun({
  harvestId,
  runId,
  sourceCommitSha,
  milestoneId = "harvest-publication-reliability-and-roi-hardening-v1",
  waveId = "harvest-publication-top10-roi-hardening-wave-v1",
} = {}) {
  const now = new Date().toISOString();
  return {
    schemaVersion: PUBLICATION_RUN_SCHEMA,
    harvestId,
    runId,
    milestoneId,
    waveId,
    startedAt: now,
    completedAt: null,
    sourceCommitSha,
    authoritySnapshot: {},
    capabilities: {},
    dryRun: null,
    transaction: {
      state: "CREATED",
      completedPhases: [],
      failedPhase: null,
      resumeAvailable: false,
      rollbackStatus: "not-run",
    },
    coreGates: {},
    optionalProjections: {},
    gitDurability: { gitDurabilityStatus: "NOT_REQUIRED" },
    integrity: null,
    promptTriage: null,
    duplication: null,
    publication: null,
    rollback: null,
    finalVerdict: null,
    remainingActions: [],
  };
}

export function classifyFinalVerdict({
  corePublication,
  authorityIntegrity,
  gitDurability,
  optionalWarnings = [],
  coreFailures = [],
}) {
  if (coreFailures.length > 0 || authorityIntegrity === "FAIL" || authorityIntegrity === "BLOCKED") {
    return coreFailures.some((c) => c.startsWith("BLOCK_")) ? "BLOCKED" : "FAILED";
  }
  if (gitDurability === "PENDING" || gitDurability === "BLOCKED") {
    if (corePublication === "PASS" && optionalWarnings.length > 0) return "GO_WITH_WARN";
    if (corePublication === "PASS") return "OPERATIONAL_GIT_PENDING";
  }
  if (optionalWarnings.length > 0 || corePublication === "WARN") return "GO_WITH_WARN";
  if (corePublication === "PASS" && authorityIntegrity === "PASS" && gitDurability === "RECORDED") {
    return "CLOSED_GO";
  }
  if (corePublication === "PASS") return "GO_WITH_WARN";
  return "FAILED";
}
