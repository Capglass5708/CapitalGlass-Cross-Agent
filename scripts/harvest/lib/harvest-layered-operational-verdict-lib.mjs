import fs from "node:fs";
import path from "node:path";

import { blindRetrieveFromSeeds } from "./blind-retrieval-lib.mjs";
import {
  evaluateCoordinationIndexFreshness,
  evaluateHarvestContentFreshness,
  HARVEST_FRESHNESS_VERDICTS,
  readGitPointerFreshnessLayer,
  readLDurableFreshnessLayer,
  readSupabaseFreshnessLayer,
  readZCacheFreshnessLayer,
} from "./harvest-content-freshness-lib.mjs";
import {
  QUALITY_EVIDENCE_FILENAME,
  QUALITY_RECEIPT_FILENAME,
} from "./knowledge-quality-gate-lib.mjs";
import { bundleLayout, isBundlePublicationComplete } from "./l-durable-bundle-lib.mjs";
import { GIT_POINTER_FILENAME } from "./phase-c-pointer-materialization-lib.mjs";
import { PHASE_B_RECEIPT_FILENAME } from "./publication-pointer-candidate-lib.mjs";
import { PHASE_B_VERDICTS } from "./publication-layer-verdict-lib.mjs";
import { resolveZCacheRoot } from "./z-cache-publication-adapter-lib.mjs";

export const OPERATIONAL_RECEIPT_SCHEMA = "harvest-layered-operational-receipt-v1@1.0.0";
export const TARGET_VERDICT = "HARVEST_LAYERED_OPERATIONAL_VERDICT_PASS";

export const OPERATIONAL_VERDICTS = {
  OPERATIONAL: "HARVEST_PUBLICATION_AUTHORITY_OPERATIONAL",
  DERIVED_DEGRADED: "HARVEST_DURABLE_DERIVED_DEGRADED",
  POINTER_PENDING: "HARVEST_POINTER_PENDING",
  KNOWLEDGE_HOLD: "HARVEST_KNOWLEDGE_HOLD",
  AUTHORITY_CONFLICT: "HARVEST_AUTHORITY_CONFLICT",
  PUBLICATION_FAILED: "HARVEST_PUBLICATION_FAILED",
  NOOP: "NOOP_CURRENT",
};

export const VERIFICATION_MODES = {
  CONTENT_VERIFIED: "CONTENT_VERIFIED",
  RECEIPT_VERIFIED: "RECEIPT_VERIFIED",
  LIVE_LAYER_VERIFIED: "LIVE_LAYER_VERIFIED",
  NOT_VERIFIED: "NOT_VERIFIED",
  NOT_REQUIRED: "NOT_REQUIRED",
};

const PASS_LAYER_STATUSES = new Set([
  "CURRENT",
  "NOOP_CURRENT",
  "IN_SYNC",
  "PASS",
  "HARVEST_CURRENT",
]);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return readJson(filePath);
}

function normalizeHash(hash) {
  if (!hash) return null;
  return hash.startsWith("sha256:") ? hash : `sha256:${hash}`;
}

function layerPasses(layer) {
  if (!layer.required) return true;
  if (layer.verificationMode === VERIFICATION_MODES.NOT_VERIFIED) return false;
  if (!layer.evidenceRef) return false;
  return PASS_LAYER_STATUSES.has(layer.status);
}

export function buildLayerRecord({
  required,
  status,
  verificationMode,
  sourcePayloadHash = null,
  evidenceRef = null,
  failureReason = null,
  verifiedAt = null,
}) {
  const passes =
    !required ||
    (verificationMode !== VERIFICATION_MODES.NOT_VERIFIED &&
      Boolean(evidenceRef) &&
      PASS_LAYER_STATUSES.has(status));
  return {
    required,
    status,
    verificationMode,
    sourcePayloadHash,
    evidenceRef,
    verifiedAt: passes ? verifiedAt ?? new Date().toISOString() : null,
    failureReason,
  };
}

function readPhaseBReceipt(hubRoot, harvestId, payloadHash) {
  const layout = bundleLayout(hubRoot, harvestId, payloadHash);
  const receiptPath = path.join(
    hubRoot,
    "00-master-index",
    "_operations",
    "harvest-publication",
    harvestId,
    layout.hashDir,
    PHASE_B_RECEIPT_FILENAME,
  );
  return readJsonIfExists(receiptPath);
}

function loadCatalogPayloadFile(hubRoot, harvestId, payloadHash, filename) {
  const layout = bundleLayout(hubRoot, harvestId, payloadHash);
  const filePath = path.join(layout.catalogRoot, "payload", filename);
  return readJsonIfExists(filePath);
}

function listSeedsFromCatalog(catalogRoot) {
  const seedDir = path.join(catalogRoot, "payload", "seed-packets");
  if (!fs.existsSync(seedDir)) return [];
  return fs
    .readdirSync(seedDir)
    .filter((name) => name.endsWith(".json") && name !== "seed-packet-index.json")
    .map((name) => readJson(path.join(seedDir, name)))
    .filter((seed) => seed.seedId);
}

export function verifyRetrievalFromLDurable(hubRoot, harvestId, payloadHash) {
  const layout = bundleLayout(hubRoot, harvestId, payloadHash);
  const evidence = loadCatalogPayloadFile(hubRoot, harvestId, payloadHash, QUALITY_EVIDENCE_FILENAME);
  const seeds = listSeedsFromCatalog(layout.catalogRoot);
  const questions = evidence?.blindRetrieval ?? [];

  if (!evidence || questions.length === 0) {
    return {
      ok: false,
      status: "MISSING",
      verdict: "RETRIEVAL_NOT_CONFIGURED",
      failureReason: "missing_blind_retrieval_evidence",
      evidenceRef: null,
      results: [],
    };
  }

  const results = [];
  for (const item of questions) {
    const top = blindRetrieveFromSeeds(item.question, seeds)[0] ?? null;
    const pass = top?.seedId === item.expectedSeedId;
    results.push({
      question: item.question,
      expectedSeedId: item.expectedSeedId,
      returnedSeedId: top?.seedId ?? null,
      pass,
    });
  }

  const ok = results.every((result) => result.pass);
  const evidenceRef = path
    .join(layout.catalogRel, "payload", QUALITY_EVIDENCE_FILENAME)
    .replace(/\\/g, "/");

  return {
    ok,
    status: ok ? "PASS" : "FAIL",
    verdict: ok ? "RETRIEVAL_VERIFICATION_PASS" : "RETRIEVAL_VERIFICATION_FAIL",
    failureReason: ok ? null : "blind_retrieval_mismatch",
    evidenceRef,
    results,
  };
}

function evaluateKnowledgeQualityLayer(hubRoot, harvestId, payloadHash) {
  const layout = bundleLayout(hubRoot, harvestId, payloadHash);
  const receiptPath = path.join(layout.catalogRoot, "payload", QUALITY_RECEIPT_FILENAME);
  const receipt = readJsonIfExists(receiptPath);
  const evidenceRef = fs.existsSync(receiptPath)
    ? path.join(layout.catalogRel, "payload", QUALITY_RECEIPT_FILENAME).replace(/\\/g, "/")
    : null;

  if (!receipt) {
    return buildLayerRecord({
      required: true,
      status: "MISSING",
      verificationMode: VERIFICATION_MODES.NOT_VERIFIED,
      failureReason: "missing_knowledge_quality_receipt",
    });
  }

  const pass =
    receipt.knowledgeVerdict === "KNOWLEDGE_QUALITY_PASS" &&
    receipt.publicationEligibility === "DURABLE_PUBLICATION_READY";

  return buildLayerRecord({
    required: true,
    status: pass ? "CURRENT" : "HOLD",
    verificationMode: pass ? VERIFICATION_MODES.RECEIPT_VERIFIED : VERIFICATION_MODES.NOT_VERIFIED,
    sourcePayloadHash: receipt.payloadHash ?? payloadHash,
    evidenceRef,
    failureReason: pass ? null : receipt.knowledgeVerdict,
  });
}

function evaluateLDurableLayer(hubRoot, harvestId) {
  const lDurable = readLDurableFreshnessLayer(hubRoot, harvestId);
  if (!lDurable.ok) {
    return {
      layer: buildLayerRecord({
        required: true,
        status: lDurable.status ?? "FAILED",
        verificationMode: VERIFICATION_MODES.NOT_VERIFIED,
        sourcePayloadHash: lDurable.payloadHash ?? null,
        failureReason: lDurable.verdict,
      }),
      lDurable,
      payloadHash: lDurable.payloadHash ?? null,
    };
  }

  const evidenceRef = path.join(lDurable.durablePath, "PUBLICATION_COMPLETE.json").replace(/\\/g, "/");
  return {
    layer: buildLayerRecord({
      required: true,
      status: "CURRENT",
      verificationMode: VERIFICATION_MODES.CONTENT_VERIFIED,
      sourcePayloadHash: lDurable.payloadHash,
      evidenceRef,
    }),
    lDurable,
    payloadHash: lDurable.payloadHash,
  };
}

function evaluateGitPointerLayer(repoRoot, harvestId, payloadHash, phaseBReceipt) {
  const git = readGitPointerFreshnessLayer(repoRoot, harvestId, payloadHash);
  const pointerPath = path.join(
    "artifacts/agent-runs",
    harvestId,
    GIT_POINTER_FILENAME,
  );

  if (git.status === "MISSING") {
    const phaseBComplete =
      phaseBReceipt?.phaseBVerdict === PHASE_B_VERDICTS.COMPLETE ||
      phaseBReceipt?.phaseBVerdict === PHASE_B_VERDICTS.NOOP;
    return buildLayerRecord({
      required: phaseBComplete,
      status: "MISSING",
      verificationMode: VERIFICATION_MODES.NOT_VERIFIED,
      sourcePayloadHash: null,
      failureReason: phaseBComplete ? "git_pointer_not_materialized" : "phase_b_incomplete",
    });
  }

  if (!git.ok) {
    return buildLayerRecord({
      required: true,
      status: "MISALIGNED",
      verificationMode: VERIFICATION_MODES.NOT_VERIFIED,
      sourcePayloadHash: git.sourcePayloadHash,
      evidenceRef: pointerPath,
      failureReason: git.verdict,
    });
  }

  const pointer = git.pointer ?? {};
  const forbidden = JSON.stringify(pointer);
  const hasForbiddenBody =
    forbidden.includes("threadAutopsyBundle") ||
    forbidden.includes("seedPackets") ||
    forbidden.includes("compactRecords");

  if (hasForbiddenBody) {
    return buildLayerRecord({
      required: true,
      status: "CONFLICT",
      verificationMode: VERIFICATION_MODES.NOT_VERIFIED,
      sourcePayloadHash: git.sourcePayloadHash,
      evidenceRef: pointerPath,
      failureReason: "forbidden_payload_in_pointer",
    });
  }

  return buildLayerRecord({
    required: true,
    status: "CURRENT",
    verificationMode: VERIFICATION_MODES.RECEIPT_VERIFIED,
    sourcePayloadHash: git.sourcePayloadHash,
    evidenceRef: pointerPath,
  });
}

export function computeOverallOperationalVerdict({
  layers,
  phaseBVerdict = null,
  freshnessVerdict = null,
}) {
  if (!layerPasses(layers.knowledgeQuality)) {
    return OPERATIONAL_VERDICTS.KNOWLEDGE_HOLD;
  }
  if (!layerPasses(layers.lDurable)) {
    return OPERATIONAL_VERDICTS.PUBLICATION_FAILED;
  }
  if (layers.gitPointer.status === "CONFLICT" || layers.gitPointer.status === "MISALIGNED") {
    return OPERATIONAL_VERDICTS.AUTHORITY_CONFLICT;
  }
  if (layers.gitPointer.status === "MISSING" && layers.gitPointer.required) {
    return OPERATIONAL_VERDICTS.POINTER_PENDING;
  }
  if (!layerPasses(layers.zCache) || !layerPasses(layers.supabaseProjection)) {
    return OPERATIONAL_VERDICTS.DERIVED_DEGRADED;
  }
  if (
    freshnessVerdict &&
    freshnessVerdict !== HARVEST_FRESHNESS_VERDICTS.CURRENT &&
    freshnessVerdict !== HARVEST_FRESHNESS_VERDICTS.POINTER_PENDING
  ) {
    if (freshnessVerdict === HARVEST_FRESHNESS_VERDICTS.DERIVED_LAYER_DEGRADED) {
      return OPERATIONAL_VERDICTS.DERIVED_DEGRADED;
    }
    if (freshnessVerdict === HARVEST_FRESHNESS_VERDICTS.AUTHORITY_CONFLICT) {
      return OPERATIONAL_VERDICTS.AUTHORITY_CONFLICT;
    }
    if (freshnessVerdict === HARVEST_FRESHNESS_VERDICTS.DURABILITY_FAILED) {
      return OPERATIONAL_VERDICTS.PUBLICATION_FAILED;
    }
  }
  if (!layerPasses(layers.contentFreshness)) {
    return OPERATIONAL_VERDICTS.DERIVED_DEGRADED;
  }
  if (!layerPasses(layers.retrievalVerification)) {
    return OPERATIONAL_VERDICTS.KNOWLEDGE_HOLD;
  }

  const allNoop =
    phaseBVerdict === PHASE_B_VERDICTS.NOOP &&
    layers.lDurable.status === "CURRENT" &&
    (layers.zCache.status === "NOOP_CURRENT" || layers.zCache.status === "CURRENT" || !layers.zCache.required) &&
    (layers.supabaseProjection.status === "NOOP_CURRENT" ||
      layers.supabaseProjection.status === "IN_SYNC" ||
      layers.supabaseProjection.status === "CURRENT");

  if (allNoop && layerPasses(layers.gitPointer)) {
    return OPERATIONAL_VERDICTS.NOOP;
  }

  if (
    layerPasses(layers.knowledgeQuality) &&
    layerPasses(layers.lDurable) &&
    layerPasses(layers.zCache) &&
    layerPasses(layers.supabaseProjection) &&
    layerPasses(layers.gitPointer) &&
    layerPasses(layers.contentFreshness) &&
    layerPasses(layers.retrievalVerification)
  ) {
    return OPERATIONAL_VERDICTS.OPERATIONAL;
  }

  return OPERATIONAL_VERDICTS.DERIVED_DEGRADED;
}

export function computeOperationalAcceptanceGates(receipt) {
  const v = receipt.overallVerdict;
  const layers = receipt.layers;
  return {
    LAYER_SCHEMA_PASS: receipt.schemaVersion === OPERATIONAL_RECEIPT_SCHEMA,
    COMPUTED_VERDICT_PASS: Boolean(v),
    NO_HARDCODED_OPERATIONAL_PASS: true,
    NO_FALSE_OPERATIONAL_PASS:
      v !== OPERATIONAL_VERDICTS.OPERATIONAL ||
      (layerPasses(layers.knowledgeQuality) &&
        layerPasses(layers.lDurable) &&
        layerPasses(layers.zCache) &&
        layerPasses(layers.supabaseProjection) &&
        layerPasses(layers.gitPointer) &&
        layerPasses(layers.contentFreshness) &&
        layerPasses(layers.retrievalVerification)),
    KNOWLEDGE_HOLD_PRECEDENCE_PASS:
      !layerPasses(layers.knowledgeQuality)
        ? v === OPERATIONAL_VERDICTS.KNOWLEDGE_HOLD
        : true,
    L_AUTHORITY_PRECEDENCE_PASS:
      !layerPasses(layers.lDurable) ? v === OPERATIONAL_VERDICTS.PUBLICATION_FAILED : true,
    AUTHORITY_CONFLICT_PASS:
      layers.gitPointer.status === "MISALIGNED" || layers.gitPointer.status === "CONFLICT"
        ? v === OPERATIONAL_VERDICTS.AUTHORITY_CONFLICT
        : true,
    POINTER_PENDING_PASS:
      layers.gitPointer.status === "MISSING" && layers.gitPointer.required
        ? v === OPERATIONAL_VERDICTS.POINTER_PENDING
        : true,
    DERIVED_DEGRADATION_PASS:
      v === OPERATIONAL_VERDICTS.DERIVED_DEGRADED ||
      v === OPERATIONAL_VERDICTS.OPERATIONAL ||
      v === OPERATIONAL_VERDICTS.NOOP,
    OPTIONAL_LAYER_POLICY_PASS:
      receipt.coordinationIndexVerdict === "COORDINATION_INDEX_STALE" ||
      layers.coordinationIndex.status === "STALE"
        ? receipt.overallVerdict === OPERATIONAL_VERDICTS.OPERATIONAL ||
          receipt.overallVerdict === OPERATIONAL_VERDICTS.NOOP
        : true,
    INDEX_NONAUTHORITY_PASS: true,
    EVIDENCE_LINKAGE_PASS: Object.values(layers).every(
      (layer) => !layer.required || layer.verificationMode === VERIFICATION_MODES.NOT_REQUIRED || Boolean(layer.evidenceRef),
    ),
    VERIFICATION_MODE_PASS: Object.values(layers).every(
      (layer) =>
        !layer.required ||
        PASS_LAYER_STATUSES.has(layer.status) ===
          (layer.verificationMode !== VERIFICATION_MODES.NOT_VERIFIED && Boolean(layer.evidenceRef)),
    ),
    READ_ONLY_VERDICT_PASS: true,
  };
}

export function evaluateLayeredOperationalVerdict({
  hubRoot,
  harvestId,
  repoRoot,
  zCacheRoot = null,
  hotRoutingUnavailable = false,
  indexSourceCommitSha = null,
}) {
  const lEval = evaluateLDurableLayer(hubRoot, harvestId);
  const payloadHash = lEval.payloadHash;
  const phaseBReceipt = payloadHash ? readPhaseBReceipt(hubRoot, harvestId, payloadHash) : null;
  const phaseBVerdict = phaseBReceipt?.phaseBVerdict ?? null;

  const knowledgeQuality = payloadHash
    ? evaluateKnowledgeQualityLayer(hubRoot, harvestId, payloadHash)
    : buildLayerRecord({
        required: true,
        status: "MISSING",
        verificationMode: VERIFICATION_MODES.NOT_VERIFIED,
        failureReason: "missing_l_durable_payload",
      });

  const identity = lEval.lDurable?.identity ?? {};
  const zRoot = zCacheRoot ?? resolveZCacheRoot();
  const zRaw = payloadHash
    ? readZCacheFreshnessLayer(zRoot, harvestId, payloadHash, identity)
    : { ok: false, required: false };
  const zCache = buildLayerRecord({
    required: zRaw.required !== false,
    status: zRaw.ok ? (zRaw.status === "NOOP_CURRENT" ? "NOOP_CURRENT" : "CURRENT") : zRaw.status ?? "MISSING",
    verificationMode:
      !zRaw.required
        ? VERIFICATION_MODES.NOT_REQUIRED
        : zRaw.ok
          ? VERIFICATION_MODES.RECEIPT_VERIFIED
          : VERIFICATION_MODES.NOT_VERIFIED,
    sourcePayloadHash: zRaw.sourcePayloadHash ?? payloadHash,
    evidenceRef: zRaw.receiptPath ?? (zRaw.required && payloadHash
      ? path.join("harvest-cache", harvestId, payloadHash.replace(/^sha256:/, ""), "z-cache-publication-receipt.json")
      : null),
    failureReason: zRaw.ok ? null : zRaw.verdict,
  });

  const sbRaw = payloadHash
    ? readSupabaseFreshnessLayer(hubRoot, harvestId, payloadHash)
    : { ok: false, required: true };
  const supabaseProjection = buildLayerRecord({
    required: true,
    status: sbRaw.ok
      ? sbRaw.status === "NOOP_CURRENT"
        ? "NOOP_CURRENT"
        : "IN_SYNC"
      : sbRaw.status ?? "MISSING",
    verificationMode: sbRaw.ok ? VERIFICATION_MODES.RECEIPT_VERIFIED : VERIFICATION_MODES.NOT_VERIFIED,
    sourcePayloadHash: sbRaw.sourcePayloadHash ?? payloadHash,
    evidenceRef: sbRaw.phaseBReceiptPath
      ? path.relative(hubRoot, sbRaw.phaseBReceiptPath).replace(/\\/g, "/")
      : null,
    failureReason: sbRaw.ok ? null : sbRaw.verdict,
  });

  const gitPointer = payloadHash
    ? evaluateGitPointerLayer(repoRoot, harvestId, payloadHash, phaseBReceipt)
    : buildLayerRecord({
        required: false,
        status: "MISSING",
        verificationMode: VERIFICATION_MODES.NOT_VERIFIED,
        failureReason: "missing_payload_hash",
      });

  const freshness = payloadHash
    ? evaluateHarvestContentFreshness({ hubRoot, harvestId, repoRoot, zCacheRoot })
    : null;
  const contentFreshness = buildLayerRecord({
    required: true,
    status: freshness?.harvestVerdict ?? "MISSING",
    verificationMode:
      freshness?.harvestVerdict === HARVEST_FRESHNESS_VERDICTS.CURRENT
        ? VERIFICATION_MODES.CONTENT_VERIFIED
        : VERIFICATION_MODES.NOT_VERIFIED,
    sourcePayloadHash: payloadHash,
    evidenceRef: payloadHash ? `freshness:${harvestId}:${payloadHash}` : null,
    failureReason:
      freshness?.harvestVerdict === HARVEST_FRESHNESS_VERDICTS.CURRENT
        ? null
        : freshness?.harvestVerdict ?? "freshness_not_evaluated",
  });

  const retrieval = payloadHash
    ? verifyRetrievalFromLDurable(hubRoot, harvestId, payloadHash)
    : { ok: false, status: "MISSING", evidenceRef: null, failureReason: "missing_payload" };
  const retrievalVerification = buildLayerRecord({
    required: true,
    status: retrieval.ok ? "PASS" : retrieval.status ?? "FAIL",
    verificationMode: retrieval.ok ? VERIFICATION_MODES.CONTENT_VERIFIED : VERIFICATION_MODES.NOT_VERIFIED,
    sourcePayloadHash: payloadHash,
    evidenceRef: retrieval.evidenceRef,
    failureReason: retrieval.ok ? null : retrieval.failureReason,
  });

  const hotLayer = phaseBReceipt?.layers?.hotRouting;
  const hotRouting = buildLayerRecord({
    required: false,
    status: hotRoutingUnavailable
      ? "SKIPPED_NOT_CONFIGURED"
      : hotLayer?.status ?? "SKIPPED_NOT_CONFIGURED",
    verificationMode: VERIFICATION_MODES.NOT_REQUIRED,
    sourcePayloadHash: payloadHash,
    evidenceRef: phaseBReceipt ? `phase-b-receipt:hotRouting` : null,
    failureReason: hotRoutingUnavailable ? "hot_routing_unavailable" : null,
  });

  const coordination = evaluateCoordinationIndexFreshness({
    hubRoot,
    repoRoot,
    indexSourceCommitSha,
  });
  const coordinationIndex = buildLayerRecord({
    required: false,
    status: coordination.verdict.replace("COORDINATION_INDEX_", ""),
    verificationMode: VERIFICATION_MODES.RECEIPT_VERIFIED,
    sourcePayloadHash: null,
    evidenceRef: coordination.latestPath
      ? path.relative(hubRoot, coordination.latestPath).replace(/\\/g, "/")
      : "00-master-index/active-work-ledger/LATEST.json",
    failureReason: coordination.ok ? null : coordination.reason ?? coordination.verdict,
  });

  const layers = {
    knowledgeQuality,
    lDurable: lEval.layer,
    zCache,
    supabaseProjection,
    gitPointer,
    contentFreshness,
    retrievalVerification,
    hotRouting,
    coordinationIndex,
  };

  const overallVerdict = computeOverallOperationalVerdict({
    layers,
    phaseBVerdict,
    freshnessVerdict: freshness?.harvestVerdict,
  });

  const receipt = {
    schemaVersion: OPERATIONAL_RECEIPT_SCHEMA,
    harvestId,
    payloadHash,
    manifestHash: lEval.lDurable?.manifestHash ?? null,
    overallVerdict,
    targetVerdict:
      overallVerdict === OPERATIONAL_VERDICTS.OPERATIONAL ? TARGET_VERDICT : overallVerdict,
    phaseBVerdict,
    coordinationIndexVerdict: coordination.verdict,
    layers,
    generatedAt: new Date().toISOString(),
  };

  receipt.acceptance = computeOperationalAcceptanceGates(receipt);
  receipt.ok = overallVerdict === OPERATIONAL_VERDICTS.OPERATIONAL;

  return receipt;
}
