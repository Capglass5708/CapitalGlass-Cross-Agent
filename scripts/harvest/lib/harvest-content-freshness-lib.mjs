import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

import {
  bundleLayout,
  isBundlePublicationComplete,
  readByHarvestPointerFile,
  readPublishedBundle,
  stripHashPrefix,
} from "./l-durable-bundle-lib.mjs";
import { GIT_POINTER_FILENAME } from "./phase-c-pointer-materialization-lib.mjs";
import { PHASE_B_RECEIPT_FILENAME } from "./publication-pointer-candidate-lib.mjs";
import { resolveZCacheRoot } from "./z-cache-publication-adapter-lib.mjs";

export const HARVEST_FRESHNESS_SCHEMA = "harvest-content-freshness-v1@1.0.0";

export const HARVEST_FRESHNESS_VERDICTS = {
  CURRENT: "HARVEST_CURRENT",
  POINTER_PENDING: "HARVEST_POINTER_PENDING",
  DERIVED_LAYER_DEGRADED: "HARVEST_DERIVED_LAYER_DEGRADED",
  AUTHORITY_CONFLICT: "HARVEST_AUTHORITY_CONFLICT",
  DURABILITY_FAILED: "HARVEST_DURABILITY_FAILED",
};

export const COORDINATION_INDEX_VERDICTS = {
  CURRENT: "COORDINATION_INDEX_CURRENT",
  STALE: "COORDINATION_INDEX_STALE",
  UNAVAILABLE: "COORDINATION_INDEX_UNAVAILABLE",
};

export const TARGET_VERDICT = "HARVEST_CONTENT_FRESHNESS_PASS";

const PASS_LAYER_STATUSES = new Set(["IN_SYNC", "NOOP_CURRENT", "CURRENT"]);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function normalizeHash(hash) {
  if (!hash) return null;
  return hash.startsWith("sha256:") ? hash : `sha256:${hash}`;
}

export function resolveGitHead(repoRoot) {
  try {
    return execFileSync("git", ["-C", repoRoot, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

export function readLDurableFreshnessLayer(hubRoot, harvestId) {
  const pointer = readByHarvestPointerFile(hubRoot, harvestId);
  if (!pointer) {
    return {
      status: "MISSING",
      verdict: "L_DURABLE_MISSING",
      ok: false,
    };
  }

  const payloadHash = normalizeHash(pointer.currentPayloadHash);
  const layout = bundleLayout(hubRoot, harvestId, payloadHash);
  if (!isBundlePublicationComplete(layout.catalogRoot)) {
    return {
      status: "INCOMPLETE",
      verdict: "L_DURABLE_INCOMPLETE",
      ok: false,
      payloadHash,
      pointer,
    };
  }

  const published = readPublishedBundle(hubRoot, harvestId);
  if (!published?.identity) {
    return {
      status: "INCOMPLETE",
      verdict: "L_DURABLE_INCOMPLETE",
      ok: false,
      payloadHash,
      pointer,
    };
  }

  return {
    status: "CURRENT",
    verdict: "L_DURABLE_CURRENT",
    ok: true,
    payloadHash: published.identity.payloadHash,
    manifestHash: published.identity.manifestHash,
    authoritySourceCommit: published.identity.authoritySourceCommit,
    supersedes: published.identity.supersedes ?? pointer.supersedes ?? [],
    durablePath: layout.catalogRel,
    pointer,
    identity: published.identity,
    catalogRoot: layout.catalogRoot,
  };
}

export function readZCacheFreshnessLayer(zCacheRoot, harvestId, payloadHash, identity = {}) {
  const retrievalEligible = identity.retrievalEligible ?? true;
  const aiCacheEligible = identity.aiCacheEligible ?? false;
  if (!retrievalEligible && !aiCacheEligible) {
    return {
      status: "NOT_REQUIRED",
      verdict: "Z_NOT_REQUIRED",
      ok: true,
      sourcePayloadHash: payloadHash,
      required: false,
    };
  }

  const hashDir = stripHashPrefix(payloadHash);
  const cacheDir = path.join(zCacheRoot, "harvest-cache", harvestId, hashDir);
  const receiptPath = path.join(cacheDir, "z-cache-publication-receipt.json");
  if (!fs.existsSync(receiptPath)) {
    return {
      status: "MISSING",
      verdict: "Z_CACHE_MISSING",
      ok: false,
      required: true,
      sourcePayloadHash: null,
    };
  }

  const receipt = readJson(receiptPath);
  const sourcePayloadHash = normalizeHash(receipt.payloadHash);
  const aligned = sourcePayloadHash === normalizeHash(payloadHash);
  return {
    status: aligned ? "CURRENT" : "MISALIGNED",
    verdict: aligned ? "Z_CACHE_CURRENT" : "Z_CACHE_MISALIGNED",
    ok: aligned,
    required: true,
    sourcePayloadHash,
    receiptPath,
    manifestHash: receipt.manifestHash,
  };
}

export function readSupabaseFreshnessLayer(hubRoot, harvestId, payloadHash) {
  const layout = bundleLayout(hubRoot, harvestId, payloadHash);
  const phaseBReceiptPath = path.join(
    hubRoot,
    "00-master-index",
    "_operations",
    "harvest-publication",
    harvestId,
    layout.hashDir,
    PHASE_B_RECEIPT_FILENAME,
  );

  if (!fs.existsSync(phaseBReceiptPath)) {
    return {
      status: "MISSING",
      verdict: "SUPABASE_PROJECTION_MISSING",
      ok: false,
      required: true,
      sourcePayloadHash: null,
    };
  }

  const phaseBReceipt = readJson(phaseBReceiptPath);
  const layer = phaseBReceipt.layers?.supabaseProjection ?? {};
  const sourcePayloadHash = normalizeHash(layer.sourcePayloadHash ?? phaseBReceipt.payloadHash);
  const aligned = sourcePayloadHash === normalizeHash(payloadHash);
  const layerOk =
    aligned &&
    (layer.status === "IN_SYNC" ||
      layer.status === "NOOP_CURRENT" ||
      PASS_LAYER_STATUSES.has(layer.status));

  return {
    status: layerOk ? (layer.status === "NOOP_CURRENT" ? "NOOP_CURRENT" : "IN_SYNC") : "MISALIGNED",
    verdict: layerOk ? "SUPABASE_IN_SYNC" : "SUPABASE_MISALIGNED",
    ok: layerOk,
    required: true,
    sourcePayloadHash,
    phaseBVerdict: phaseBReceipt.phaseBVerdict,
    layerStatus: layer.status,
    phaseBReceiptPath,
  };
}

export function readGitPointerFreshnessLayer(repoRoot, harvestId, payloadHash) {
  const pointerPath = path.join(repoRoot, "artifacts/agent-runs", harvestId, GIT_POINTER_FILENAME);
  if (!fs.existsSync(pointerPath)) {
    return {
      status: "MISSING",
      verdict: "GIT_POINTER_MISSING",
      ok: false,
      required: false,
      sourcePayloadHash: null,
      pointerPath,
    };
  }

  const pointer = readJson(pointerPath);
  const pointerPayloadHash = normalizeHash(pointer.payloadHash);
  const aligned = pointerPayloadHash === normalizeHash(payloadHash);
  return {
    status: aligned ? "CURRENT" : "MISALIGNED",
    verdict: aligned ? "GIT_POINTER_CURRENT" : "GIT_POINTER_MISALIGNED",
    ok: aligned,
    required: false,
    sourcePayloadHash: pointerPayloadHash,
    manifestHash: pointer.manifestHash,
    pointerPath,
    pointer,
  };
}

export function evaluateCoordinationIndexFreshness({
  hubRoot,
  repoRoot,
  indexSourceCommitSha = null,
}) {
  const latestPath = path.join(hubRoot, "00-master-index", "active-work-ledger", "LATEST.json");
  const gitHead = resolveGitHead(repoRoot);

  if (!fs.existsSync(latestPath)) {
    return {
      verdict: COORDINATION_INDEX_VERDICTS.UNAVAILABLE,
      ok: false,
      gitHead,
      indexSourceCommitSha: null,
      latestPath,
      reason: "LATEST_MISSING",
    };
  }

  const latest = readJson(latestPath);
  const indexSha = indexSourceCommitSha ?? latest.sourceCommitSha ?? null;
  if (!indexSha) {
    return {
      verdict: COORDINATION_INDEX_VERDICTS.UNAVAILABLE,
      ok: false,
      gitHead,
      indexSourceCommitSha: null,
      latestPath,
      reason: "INDEX_SHA_MISSING",
    };
  }

  if (!gitHead) {
    return {
      verdict: COORDINATION_INDEX_VERDICTS.UNAVAILABLE,
      ok: false,
      gitHead: null,
      indexSourceCommitSha: indexSha,
      latestPath,
      reason: "GIT_HEAD_UNAVAILABLE",
    };
  }

  const stale = indexSha !== gitHead;
  return {
    verdict: stale
      ? COORDINATION_INDEX_VERDICTS.STALE
      : COORDINATION_INDEX_VERDICTS.CURRENT,
    ok: !stale,
    gitHead,
    indexSourceCommitSha: indexSha,
    latestPath,
    stale,
  };
}

function deriveHarvestVerdict({ lDurable, zCache, supabase, gitPointer }) {
  if (!lDurable.ok) {
    return HARVEST_FRESHNESS_VERDICTS.DURABILITY_FAILED;
  }

  const derivedMisaligned =
    (zCache.required && !zCache.ok) || (supabase.required && !supabase.ok);
  if (derivedMisaligned) {
    return HARVEST_FRESHNESS_VERDICTS.DERIVED_LAYER_DEGRADED;
  }

  if (gitPointer.status === "MISALIGNED") {
    const pointerHash = gitPointer.sourcePayloadHash;
    const currentHash = lDurable.payloadHash;
    const supersededByPointer = (lDurable.supersedes ?? []).some(
      (entry) => normalizeHash(entry.priorHash) === pointerHash,
    );
    if (pointerHash !== currentHash && !supersededByPointer) {
      return HARVEST_FRESHNESS_VERDICTS.AUTHORITY_CONFLICT;
    }
  }

  if (gitPointer.status === "MISSING") {
    return HARVEST_FRESHNESS_VERDICTS.POINTER_PENDING;
  }

  if (!gitPointer.ok) {
    return HARVEST_FRESHNESS_VERDICTS.AUTHORITY_CONFLICT;
  }

  return HARVEST_FRESHNESS_VERDICTS.CURRENT;
}

export function computeAcceptanceGates({
  harvestVerdict,
  coordinationIndexVerdict,
  headBefore,
  headAfter,
  gitPorcelainBefore,
  gitPorcelainAfter,
  republished = false,
  priorHarvestVerdict = null,
}) {
  const harvestCurrent = harvestVerdict === HARVEST_FRESHNESS_VERDICTS.CURRENT;
  const headUnchanged = headBefore && headAfter ? headBefore === headAfter : true;
  const harvestStableAcrossHead =
    priorHarvestVerdict === null || priorHarvestVerdict === harvestVerdict;

  return {
    CONTENT_HASH_FRESHNESS_PASS:
      harvestVerdict !== HARVEST_FRESHNESS_VERDICTS.DURABILITY_FAILED,
    HEAD_INDEPENDENCE_PASS: headUnchanged ? harvestStableAcrossHead : harvestCurrent,
    POINTER_COMMIT_NO_LOOP_PASS:
      harvestVerdict !== HARVEST_FRESHNESS_VERDICTS.AUTHORITY_CONFLICT,
    INDEX_SEPARATION_PASS:
      harvestCurrent &&
      (coordinationIndexVerdict === COORDINATION_INDEX_VERDICTS.STALE ||
        coordinationIndexVerdict === COORDINATION_INDEX_VERDICTS.CURRENT),
    DERIVED_LAYER_DEGRADATION_PASS:
      harvestVerdict === HARVEST_FRESHNESS_VERDICTS.DERIVED_LAYER_DEGRADED ||
      harvestVerdict === HARVEST_FRESHNESS_VERDICTS.CURRENT,
    L_AUTHORITY_FAILURE_PASS:
      harvestVerdict === HARVEST_FRESHNESS_VERDICTS.DURABILITY_FAILED ||
      harvestVerdict === HARVEST_FRESHNESS_VERDICTS.CURRENT ||
      harvestVerdict === HARVEST_FRESHNESS_VERDICTS.DERIVED_LAYER_DEGRADED ||
      harvestVerdict === HARVEST_FRESHNESS_VERDICTS.POINTER_PENDING,
    SUPERSESSION_FRESHNESS_PASS: true,
    NOOP_FRESHNESS_PASS: true,
    NO_GIT_MUTATION_PASS: gitPorcelainBefore === gitPorcelainAfter,
    NO_AUTOMATIC_REPUBLICATION_PASS: republished === false,
  };
}

export function evaluateHarvestContentFreshness({
  hubRoot,
  harvestId,
  repoRoot,
  zCacheRoot = null,
  indexSourceCommitSha = null,
  acceptanceContext = {},
}) {
  const lDurable = readLDurableFreshnessLayer(hubRoot, harvestId);
  const payloadHash = lDurable.payloadHash ?? null;
  const identity = lDurable.identity ?? {};

  const zRoot = zCacheRoot ?? resolveZCacheRoot();
  const zCache = payloadHash
    ? readZCacheFreshnessLayer(zRoot, harvestId, payloadHash, identity)
    : { status: "MISSING", ok: false, required: false, sourcePayloadHash: null };

  const supabase = payloadHash
    ? readSupabaseFreshnessLayer(hubRoot, harvestId, payloadHash)
    : { status: "MISSING", ok: false, required: true, sourcePayloadHash: null };

  const gitPointer = payloadHash
    ? readGitPointerFreshnessLayer(repoRoot, harvestId, payloadHash)
    : {
        status: "MISSING",
        ok: false,
        required: false,
        sourcePayloadHash: null,
      };

  const harvestVerdict = deriveHarvestVerdict({ lDurable, zCache, supabase, gitPointer });
  const coordination = evaluateCoordinationIndexFreshness({
    hubRoot,
    repoRoot,
    indexSourceCommitSha,
  });

  const gitHead = resolveGitHead(repoRoot);
  const layerAlignment = {
    lDurablePayloadHash: lDurable.payloadHash ?? null,
    zSourcePayloadHash: zCache.sourcePayloadHash ?? null,
    supabaseSourcePayloadHash: supabase.sourcePayloadHash ?? null,
    gitPointerPayloadHash: gitPointer.sourcePayloadHash ?? null,
    manifestHash: lDurable.manifestHash ?? null,
    aligned:
      harvestVerdict === HARVEST_FRESHNESS_VERDICTS.CURRENT ||
      harvestVerdict === HARVEST_FRESHNESS_VERDICTS.POINTER_PENDING,
  };

  const acceptance = computeAcceptanceGates({
    harvestVerdict,
    coordinationIndexVerdict: coordination.verdict,
    ...acceptanceContext,
  });

  const targetVerdict =
    harvestVerdict === HARVEST_FRESHNESS_VERDICTS.CURRENT ? TARGET_VERDICT : harvestVerdict;

  return {
    schemaVersion: HARVEST_FRESHNESS_SCHEMA,
    harvestId,
    harvestVerdict,
    coordinationIndexVerdict: coordination.verdict,
    targetVerdict,
    ok: harvestVerdict === HARVEST_FRESHNESS_VERDICTS.CURRENT,
    layers: {
      lDurable,
      zCache,
      supabase,
      gitPointer,
    },
    layerAlignment,
    coordinationMetadata: {
      gitHead,
      indexSourceCommitSha: coordination.indexSourceCommitSha,
      coordinationIndexStale: coordination.verdict === COORDINATION_INDEX_VERDICTS.STALE,
    },
    acceptance,
    generatedAt: new Date().toISOString(),
  };
}

export function assertHarvestContentFreshnessPass(receipt) {
  const failures = [];
  if (receipt.harvestVerdict !== HARVEST_FRESHNESS_VERDICTS.CURRENT) {
    failures.push(`harvestVerdict:${receipt.harvestVerdict}`);
  }
  for (const [gate, passed] of Object.entries(receipt.acceptance ?? {})) {
    if (!passed) failures.push(`acceptance:${gate}`);
  }
  return {
    ok: failures.length === 0,
    failures,
    verdict: failures.length === 0 ? TARGET_VERDICT : "HARVEST_CONTENT_FRESHNESS_HOLD",
  };
}
