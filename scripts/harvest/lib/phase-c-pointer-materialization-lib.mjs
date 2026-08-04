import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

import { bundleLayout, isBundlePublicationComplete, readPublishedBundle } from "./l-durable-bundle-lib.mjs";
import {
  QUALITY_RECEIPT_FILENAME,
} from "./knowledge-quality-gate-lib.mjs";
import { PHASE_B_VERDICTS } from "./publication-layer-verdict-lib.mjs";
import {
  phaseBOperationsDir,
  readPointerCandidate,
  POINTER_CANDIDATE_SCHEMA,
  PHASE_B_RECEIPT_FILENAME,
} from "./publication-pointer-candidate-lib.mjs";

export const GIT_POINTER_SCHEMA = "harvest-publication-pointer-v1@1.0.0";
export const GIT_POINTER_FILENAME = "harvest-publication-pointer-v1.json";
export const PHASE_C_RECEIPT_SCHEMA = "harvest-phase-c-pointer-receipt-v1@1.0.0";
export const PHASE_C_RECEIPT_FILENAME = "phase-c-receipt.json";

const FORBIDDEN_POINTER_KEYS = new Set([
  "threadAutopsyBundle",
  "threadEventInventory",
  "seedPackets",
  "seedPacketBodies",
  "autopsy",
  "compactRecords",
  "packets",
  "evidenceRecords",
  "commandRecords",
  "qaIndex",
  "transcript",
  "snapshot_body",
  "snapshotBody",
]);

const ALLOWED_PHASE_B_VERDICTS = new Set([
  PHASE_B_VERDICTS.COMPLETE,
  PHASE_B_VERDICTS.NOOP,
]);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function walkForbidden(value, pathKeys = [], violations = []) {
  if (value === null || typeof value !== "object") {
    return violations;
  }
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i += 1) {
      walkForbidden(value[i], [...pathKeys, String(i)], violations);
    }
    return violations;
  }
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_POINTER_KEYS.has(key)) {
      violations.push(`FORBIDDEN_POINTER_FIELD:${[...pathKeys, key].join(".")}`);
    }
    walkForbidden(child, [...pathKeys, key], violations);
  }
  return violations;
}

export function gitPointerPath(repoRoot, harvestId) {
  return path.join(repoRoot, "artifacts/agent-runs", harvestId, GIT_POINTER_FILENAME);
}

export function harvestRunDir(repoRoot, harvestId) {
  return path.join(repoRoot, "artifacts/agent-runs", harvestId);
}

function readQualityReceipt(hubRoot, harvestId, payloadHash) {
  const layout = bundleLayout(hubRoot, harvestId, payloadHash);
  const catalogReceipt = path.join(
    layout.catalogRoot,
    "payload",
    QUALITY_RECEIPT_FILENAME,
  );
  if (fs.existsSync(catalogReceipt)) {
    return readJson(catalogReceipt);
  }
  const stagingReceipt = path.join(layout.payloadStaging, QUALITY_RECEIPT_FILENAME);
  if (fs.existsSync(stagingReceipt)) {
    return readJson(stagingReceipt);
  }
  return null;
}

function readPhaseBReceipt(hubRoot, harvestId, payloadHash) {
  const ops = phaseBOperationsDir(hubRoot, harvestId, payloadHash);
  if (!fs.existsSync(ops.phaseBReceiptPath)) {
    return null;
  }
  return readJson(ops.phaseBReceiptPath);
}

export function validatePhaseCInputs({
  hubRoot,
  harvestId,
  payloadHash,
  repoRoot,
}) {
  const failures = [];
  const candidate = readPointerCandidate(hubRoot, harvestId, payloadHash);
  if (!candidate) {
    failures.push("PHASE_C_INPUT_VALIDATION:missing_pointer_candidate");
  } else {
    if (candidate.schemaVersion !== POINTER_CANDIDATE_SCHEMA) {
      failures.push("PHASE_C_INPUT_VALIDATION:invalid_candidate_schema");
    }
    if (candidate.receiptCommit !== null && candidate.receiptCommit !== undefined) {
      failures.push("PHASE_C_NO_SELF_REFERENCE:candidate_receipt_commit_must_be_null");
    }
    if (candidate.payloadHash !== payloadHash) {
      failures.push("PHASE_C_INPUT_VALIDATION:candidate_payload_hash_mismatch");
    }
    if (!ALLOWED_PHASE_B_VERDICTS.has(candidate.phaseBVerdict)) {
      failures.push(`PHASE_C_INPUT_VALIDATION:phase_b_verdict:${candidate.phaseBVerdict}`);
    }
  }

  const phaseBReceipt = readPhaseBReceipt(hubRoot, harvestId, payloadHash);
  if (!phaseBReceipt) {
    failures.push("PHASE_C_INPUT_VALIDATION:missing_phase_b_receipt");
  } else if (!ALLOWED_PHASE_B_VERDICTS.has(phaseBReceipt.phaseBVerdict)) {
    failures.push(`PHASE_C_INPUT_VALIDATION:phase_b_receipt_verdict:${phaseBReceipt.phaseBVerdict}`);
  }

  const qualityReceipt = readQualityReceipt(hubRoot, harvestId, payloadHash);
  if (!qualityReceipt) {
    failures.push("PHASE_C_QUALITY_GATE:missing_knowledge_quality_receipt");
  } else {
    if (qualityReceipt.knowledgeVerdict !== "KNOWLEDGE_QUALITY_PASS") {
      failures.push(`PHASE_C_QUALITY_GATE:${qualityReceipt.knowledgeVerdict}`);
    }
    if (qualityReceipt.publicationEligibility !== "DURABLE_PUBLICATION_READY") {
      failures.push(`PHASE_C_QUALITY_GATE:${qualityReceipt.publicationEligibility}`);
    }
  }

  const published = readPublishedBundle(hubRoot, harvestId);
  const layout = bundleLayout(hubRoot, harvestId, payloadHash);
  if (!published || published.identity.payloadHash !== payloadHash) {
    failures.push("PHASE_C_INPUT_VALIDATION:l_durable_not_current");
  } else if (!isBundlePublicationComplete(layout.catalogRoot)) {
    failures.push("PHASE_C_INPUT_VALIDATION:l_durable_incomplete");
  }

  if (candidate) {
    const zHash = candidate.zCache?.sourcePayloadHash;
    const sbHash = candidate.supabaseProjection?.sourcePayloadHash;
    if (zHash && zHash !== payloadHash) {
      failures.push("PHASE_C_INPUT_VALIDATION:z_source_payload_hash_mismatch");
    }
    if (sbHash && sbHash !== payloadHash) {
      failures.push("PHASE_C_INPUT_VALIDATION:supabase_source_payload_hash_mismatch");
    }
    if (candidate.manifestHash && published?.identity?.manifestHash) {
      if (candidate.manifestHash !== published.identity.manifestHash) {
        failures.push("PHASE_C_INPUT_VALIDATION:manifest_hash_mismatch");
      }
    }
  }

  const existingPointer = gitPointerPath(repoRoot, harvestId);
  if (fs.existsSync(existingPointer)) {
    try {
      const existing = readJson(existingPointer);
      if (existing.payloadHash === payloadHash) {
        failures.push("PHASE_C_INPUT_VALIDATION:pointer_already_materialized");
      } else if (!existing.supersedes?.length) {
        failures.push("PHASE_C_INPUT_VALIDATION:authority_conflict_existing_pointer");
      }
    } catch {
      failures.push("PHASE_C_INPUT_VALIDATION:invalid_existing_pointer");
    }
  }

  const verdict = failures.length === 0 ? "PHASE_C_INPUT_VALIDATION_PASS" : "PHASE_C_HOLD";
  return {
    ok: failures.length === 0,
    verdict,
    failures,
    candidate,
    phaseBReceipt,
    qualityReceipt,
    published,
  };
}

export function buildGitPublicationPointer({
  candidate,
  qualityReceipt,
  phaseBReceipt,
  published,
}) {
  const identity = published?.identity ?? {};
  return {
    schemaVersion: GIT_POINTER_SCHEMA,
    harvestId: candidate.harvestId,
    manifestHash: candidate.manifestHash,
    payloadHash: candidate.payloadHash,
    authoritySourceCommit: candidate.authoritySourceCommit,
    lPublication: {
      status: "current",
      durablePath: candidate.lPublication?.durablePath ?? published?.layout?.catalogRel,
    },
    zCache: {
      status: candidate.zCache?.status ?? "current",
      sourcePayloadHash: candidate.zCache?.sourcePayloadHash ?? candidate.payloadHash,
    },
    supabaseProjection: {
      status: candidate.supabaseProjection?.status ?? "in_sync",
      sourcePayloadHash:
        candidate.supabaseProjection?.sourcePayloadHash ?? candidate.payloadHash,
    },
    knowledgeVerdict: qualityReceipt?.knowledgeVerdict ?? "KNOWLEDGE_QUALITY_PASS",
    publicationEligibility: qualityReceipt?.publicationEligibility ?? "DURABLE_PUBLICATION_READY",
    phaseBVerdict: phaseBReceipt?.phaseBVerdict ?? candidate.phaseBVerdict,
    supersedes: identity.supersedes ?? [],
    generatedAt: new Date().toISOString(),
  };
}

export function validateGitPointerBudget(pointer, repoRoot, harvestId) {
  const failures = walkForbidden(pointer);
  const runDir = harvestRunDir(repoRoot, harvestId);
  if (fs.existsSync(runDir)) {
    const entries = fs.readdirSync(runDir);
    const allowed = new Set([GIT_POINTER_FILENAME]);
    for (const entry of entries) {
      if (!allowed.has(entry)) {
        failures.push(`PHASE_C_POINTER_BUDGET:unexpected_run_file:${entry}`);
      }
    }
  }
  const serialized = JSON.stringify(pointer);
  if (serialized.length > 16_384) {
    failures.push("PHASE_C_POINTER_BUDGET:pointer_too_large");
  }
  return {
    ok: failures.length === 0,
    failures,
    verdict: failures.length === 0 ? "PHASE_C_POINTER_BUDGET_PASS" : "PHASE_C_HOLD",
  };
}

export function writeGitPointer(repoRoot, harvestId, pointer) {
  const pointerPath = gitPointerPath(repoRoot, harvestId);
  fs.mkdirSync(path.dirname(pointerPath), { recursive: true });
  fs.writeFileSync(pointerPath, `${JSON.stringify(pointer, null, 2)}\n`, "utf8");
  return pointerPath;
}

export function commitGitPointer({
  repoRoot,
  harvestId,
  commitMessage = null,
}) {
  const pointerPath = gitPointerPath(repoRoot, harvestId);
  const relPath = path.relative(repoRoot, pointerPath).replace(/\\/g, "/");
  const status = execFileSync("git", ["-C", repoRoot, "status", "--porcelain", relPath], {
    encoding: "utf8",
  }).trim();
  if (!status) {
    return { committed: false, gitPointerCommit: null, reason: "no_changes" };
  }

  execFileSync("git", ["-C", repoRoot, "add", relPath], { encoding: "utf8" });
  const message =
    commitMessage ?? `chore(harvest): materialize Phase C pointer for ${harvestId}`;
  execFileSync("git", ["-C", repoRoot, "commit", "-m", message], { encoding: "utf8" });
  const gitPointerCommit = execFileSync("git", ["-C", repoRoot, "rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim();
  return { committed: true, gitPointerCommit, relPath };
}

export function writePhaseCReceipt(hubRoot, harvestId, payloadHash, receipt) {
  const ops = phaseBOperationsDir(hubRoot, harvestId, payloadHash);
  const receiptPath = path.join(ops.dir, PHASE_C_RECEIPT_FILENAME);
  fs.mkdirSync(ops.dir, { recursive: true });
  fs.writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");
  return {
    receiptPath,
    receiptRel: path.relative(hubRoot, receiptPath).replace(/\\/g, "/"),
  };
}

export function readPhaseCReceipt(hubRoot, harvestId, payloadHash) {
  const ops = phaseBOperationsDir(hubRoot, harvestId, payloadHash);
  const receiptPath = path.join(ops.dir, PHASE_C_RECEIPT_FILENAME);
  if (!fs.existsSync(receiptPath)) {
    return null;
  }
  return readJson(receiptPath);
}

export function materializePhaseCPointer({
  hubRoot,
  harvestId,
  payloadHash,
  repoRoot,
  apply = false,
  env = process.env,
}) {
  const validation = validatePhaseCInputs({ hubRoot, harvestId, payloadHash, repoRoot });
  if (!validation.ok) {
    return {
      ok: false,
      verdict: "PHASE_C_HOLD",
      validation,
    };
  }

  const pointer = buildGitPublicationPointer({
    candidate: validation.candidate,
    qualityReceipt: validation.qualityReceipt,
    phaseBReceipt: validation.phaseBReceipt,
    published: validation.published,
  });

  if (pointer.receiptCommit !== undefined) {
    return {
      ok: false,
      verdict: "PHASE_C_HOLD",
      failures: ["PHASE_C_NO_SELF_REFERENCE:pointer_contains_receipt_commit"],
    };
  }

  const preWriteBudget = validateGitPointerBudget(pointer, repoRoot, harvestId);
  if (!preWriteBudget.ok) {
    return {
      ok: false,
      verdict: "PHASE_C_HOLD",
      validation,
      budget: preWriteBudget,
    };
  }

  if (!apply) {
    return {
      ok: true,
      verdict: "PHASE_C_DRY_RUN_PASS",
      validation,
      budget: preWriteBudget,
      pointer,
      gitPointerPath: gitPointerPath(repoRoot, harvestId),
    };
  }

  if (env.PHASE_C_POINTER_APPROVED !== "1") {
    return {
      ok: false,
      verdict: "PHASE_C_HOLD",
      failures: ["BLOCKED_OPERATOR_APPROVAL:PHASE_C_POINTER_APPROVED"],
    };
  }

  const pointerPath = writeGitPointer(repoRoot, harvestId, pointer);
  const postWriteBudget = validateGitPointerBudget(pointer, repoRoot, harvestId);
  if (!postWriteBudget.ok) {
    return {
      ok: false,
      verdict: "PHASE_C_HOLD",
      validation,
      budget: postWriteBudget,
      pointerPath,
    };
  }

  const commit = commitGitPointer({ repoRoot, harvestId });
  if (!commit.committed) {
    return {
      ok: false,
      verdict: "PHASE_C_HOLD",
      failures: [`PHASE_C_SINGLE_COMMIT_FAIL:${commit.reason}`],
      pointerPath,
    };
  }

  const phaseCReceipt = {
    schemaVersion: PHASE_C_RECEIPT_SCHEMA,
    harvestId,
    manifestHash: pointer.manifestHash,
    payloadHash: pointer.payloadHash,
    gitPointerCommit: commit.gitPointerCommit,
    gitPointerRel: commit.relPath,
    pointerSchemaVersion: GIT_POINTER_SCHEMA,
    phaseBVerdict: pointer.phaseBVerdict,
    knowledgeVerdict: pointer.knowledgeVerdict,
    publicationEligibility: pointer.publicationEligibility,
    receiptCommit: null,
    generatedAt: new Date().toISOString(),
    verdict: "PHASE_C_POINTER_PASS",
  };

  const lReceipt = writePhaseCReceipt(hubRoot, harvestId, payloadHash, phaseCReceipt);

  return {
    ok: true,
    verdict: "PHASE_C_POINTER_PASS",
    validation,
    budget: postWriteBudget,
    pointer,
    pointerPath,
    phaseCReceipt,
    lReceipt,
    commit,
  };
}
