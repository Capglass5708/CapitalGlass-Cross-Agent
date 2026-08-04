import fs from "node:fs";
import path from "node:path";

import { bundleLayout } from "./l-durable-bundle-lib.mjs";

export const POINTER_CANDIDATE_SCHEMA = "harvest-publication-pointer-v1@1.0.0";
export const POINTER_CANDIDATE_FILENAME = "harvest-publication-pointer-candidate-v1.json";
export const PHASE_B_RECEIPT_FILENAME = "phase-b-receipt.json";

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export function phaseBOperationsDir(hubRoot, harvestId, payloadHash) {
  const layout = bundleLayout(hubRoot, harvestId, payloadHash);
  const dir = path.join(
    hubRoot,
    "00-master-index",
    "_operations",
    "harvest-publication",
    harvestId,
    layout.hashDir,
  );
  return {
    dir,
    phaseBReceiptPath: path.join(dir, PHASE_B_RECEIPT_FILENAME),
    pointerCandidatePath: path.join(dir, POINTER_CANDIDATE_FILENAME),
  };
}

export function buildPointerCandidate({
  identity,
  durablePath,
  layers,
  phaseBVerdict,
  zCache = {},
  supabaseProjection = {},
}) {
  return {
    schemaVersion: POINTER_CANDIDATE_SCHEMA,
    harvestId: identity.harvestId,
    manifestHash: identity.manifestHash,
    payloadHash: identity.payloadHash,
    authoritySourceCommit: identity.authoritySourceCommit,
    receiptCommit: null,
    lPublication: {
      status: layers.lDurable?.status === "NOOP_CURRENT" ? "current" : "current",
      durablePath,
    },
    zCache: {
      status: mapLayerStatusForPointer(layers.zCache?.status),
      sourcePayloadHash: zCache.sourcePayloadHash ?? identity.payloadHash,
    },
    supabaseProjection: {
      status: mapSupabaseStatusForPointer(layers.supabaseProjection?.status),
      sourcePayloadHash: supabaseProjection.sourcePayloadHash ?? identity.payloadHash,
    },
    phaseBVerdict,
  };
}

function mapLayerStatusForPointer(status) {
  if (status === "NOT_REQUIRED") return "not_required";
  if (status === "NOOP_CURRENT") return "current";
  if (status === "CURRENT") return "current";
  if (status === "FAILED_REQUIRED") return "failed";
  if (status === "SKIPPED_NOT_CONFIGURED") return "skipped";
  return "pending";
}

function mapSupabaseStatusForPointer(status) {
  if (status === "IN_SYNC" || status === "NOOP_CURRENT") return "in_sync";
  if (status === "FAILED_REQUIRED") return "failed";
  if (status === "SKIPPED") return "skipped";
  return "pending";
}

export function writePhaseBOperations({
  hubRoot,
  harvestId,
  payloadHash,
  phaseBReceipt,
  pointerCandidate,
}) {
  const ops = phaseBOperationsDir(hubRoot, harvestId, payloadHash);
  writeJson(ops.phaseBReceiptPath, phaseBReceipt);
  writeJson(ops.pointerCandidatePath, pointerCandidate);
  return {
    phaseBReceiptPath: ops.phaseBReceiptPath,
    pointerCandidatePath: ops.pointerCandidatePath,
    phaseBReceiptRel: path
      .relative(hubRoot, ops.phaseBReceiptPath)
      .replace(/\\/g, "/"),
    pointerCandidateRel: path
      .relative(hubRoot, ops.pointerCandidatePath)
      .replace(/\\/g, "/"),
  };
}

export function readPointerCandidate(hubRoot, harvestId, payloadHash) {
  const ops = phaseBOperationsDir(hubRoot, harvestId, payloadHash);
  if (!fs.existsSync(ops.pointerCandidatePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(ops.pointerCandidatePath, "utf8"));
}
