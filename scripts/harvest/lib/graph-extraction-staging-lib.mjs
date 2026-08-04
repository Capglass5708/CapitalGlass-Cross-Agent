import fs from "node:fs";
import path from "node:path";

import { hashCanonicalJson, hashFileContent } from "./hash.mjs";
import { resolveHubRoot } from "./publish-hub-seed-lib.mjs";

export const GRAPH_POINTER_SCHEMA = "cross-agent-graph-extraction-pointer-v1@1.0.0";
export const STAGING_REL_ROOT = "_staging/graph-extractions";

function toSha256Prefixed(hex) {
  return hex.startsWith("sha256:") ? hex : `sha256:${hex}`;
}

export function graphStagingLayout(hubRoot, harvestId, extractionHash) {
  const hashDir = extractionHash.replace(/^sha256:/, "");
  const base = path.join(hubRoot, STAGING_REL_ROOT, harvestId, hashDir);
  return {
    base,
    extractionPath: path.join(base, "graph-extraction.json"),
    validationReceiptPath: path.join(base, "validation-receipt.json"),
    promotionCandidatePath: path.join(base, "promotion-candidate.json"),
    lExtractionRel: `${STAGING_REL_ROOT}/${harvestId}/${hashDir}/graph-extraction.json`,
  };
}

export function writeGraphExtractionStaging({
  hubRoot = resolveHubRoot(),
  harvestId,
  extractionBody,
  validationResult = null,
}) {
  const contentHash = toSha256Prefixed(hashCanonicalJson(extractionBody));
  const layout = graphStagingLayout(hubRoot, harvestId, contentHash);
  fs.mkdirSync(layout.base, { recursive: true });
  fs.writeFileSync(layout.extractionPath, `${JSON.stringify(extractionBody, null, 2)}\n`, "utf8");

  const fileHash = toSha256Prefixed(hashFileContent(fs.readFileSync(layout.extractionPath, "utf8")));
  const validationReceipt = {
    schemaVersion: "cross-agent-graph-extraction-validation-receipt-v1@1.0.0",
    harvestId,
    extractionHash: fileHash,
    verdict: validationResult?.verdict ?? "PENDING",
    validatedAt: new Date().toISOString(),
    nodeCount: extractionBody.nodes?.length ?? 0,
    edgeCount: extractionBody.edges?.length ?? 0,
  };
  fs.writeFileSync(
    layout.validationReceiptPath,
    `${JSON.stringify(validationReceipt, null, 2)}\n`,
    "utf8",
  );

  return {
    ok: true,
    extractionHash: fileHash,
    layout,
    lExtractionPath: layout.lExtractionRel,
    noop: false,
  };
}

export function buildGraphExtractionPointer({
  harvestId,
  payloadHash,
  extractionHash,
  lExtractionPath,
  graphReleaseId = null,
  promotionVerdict = "PENDING",
  nodeCount = 0,
  edgeCount = 0,
}) {
  return {
    schemaVersion: GRAPH_POINTER_SCHEMA,
    harvestId,
    payloadHash,
    extractionHash,
    lExtractionPath,
    graphAuthorityRepo: "CG-MASTER-GRAPH",
    graphReleaseId,
    promotionVerdict,
    nodeCount,
    edgeCount,
  };
}

export function validateGraphPointerCompact(pointer) {
  const failures = [];
  if (pointer.nodes?.length || pointer.edges?.length) {
    failures.push("BLOCKED_GRAPH_PAYLOAD_IN_GIT:embedded_nodes_or_edges");
  }
  for (const key of ["threadAutopsyBundle", "seedPackets", "graphExtraction"]) {
    if (pointer[key]) {
      failures.push(`BLOCKED_GRAPH_PAYLOAD_IN_GIT:embedded_${key}`);
    }
  }
  const serialized = JSON.stringify(pointer);
  if (Buffer.byteLength(serialized, "utf8") > 4096) {
    failures.push("BLOCKED_GRAPH_POINTER_TOO_LARGE");
  }
  return { ok: failures.length === 0, failures };
}

export function readStagingExtraction(hubRoot, harvestId, extractionHash) {
  const layout = graphStagingLayout(hubRoot, harvestId, extractionHash);
  if (!fs.existsSync(layout.extractionPath)) {
    return { ok: false, error: "staging_extraction_missing" };
  }
  return {
    ok: true,
    extraction: JSON.parse(fs.readFileSync(layout.extractionPath, "utf8")),
    layout,
  };
}
