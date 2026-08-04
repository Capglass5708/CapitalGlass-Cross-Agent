import fs from "node:fs";
import path from "node:path";

import {
  bundleLayout,
  isBundlePublicationComplete,
  publishLDurableBundle,
  readBundleMetadata,
  readPublishedBundle,
} from "./l-durable-bundle-lib.mjs";
import { applySupabaseProjection } from "./supabase-projection-adapter-lib.mjs";
import {
  PHASE_B_RECEIPT_SCHEMA,
  buildPhaseBState,
  computePhaseBVerdict,
  createInitialLayerState,
  mapLDurableVerdict,
  mapSupabaseResult,
  mapZCacheResult,
  applyLayerResult,
  PHASE_B_VERDICTS,
} from "./publication-layer-verdict-lib.mjs";
import {
  buildPointerCandidate,
  writePhaseBOperations,
  readPointerCandidate,
} from "./publication-pointer-candidate-lib.mjs";
import { publishZCacheFromL } from "./z-cache-publication-adapter-lib.mjs";

export function readDurablePublicationContext(hubRoot, harvestId, payloadHash) {
  const layout = bundleLayout(hubRoot, harvestId, payloadHash);
  const published = readPublishedBundle(hubRoot, harvestId);
  if (published && published.identity.payloadHash === payloadHash) {
    return {
      harvestId,
      manifestHash: published.identity.manifestHash,
      payloadHash: published.identity.payloadHash,
      authoritySourceCommit: published.identity.authoritySourceCommit,
      durablePath: layout.catalogRel,
      requiredLayers: published.identity.requiredLayers ?? [],
      retrievalEligible: published.identity.retrievalEligible ?? true,
      aiCacheEligible: published.identity.aiCacheEligible ?? false,
      harvestTier: published.identity.harvestTier,
    };
  }

  const metadata = readBundleMetadata(layout.catalogRoot);
  if (metadata && isBundlePublicationComplete(layout.catalogRoot)) {
    const { identity } = metadata;
    return {
      harvestId,
      manifestHash: identity.manifestHash,
      payloadHash: identity.payloadHash,
      authoritySourceCommit: identity.authoritySourceCommit,
      durablePath: layout.catalogRel,
      requiredLayers: identity.requiredLayers ?? [],
      retrievalEligible: identity.retrievalEligible ?? true,
      aiCacheEligible: identity.aiCacheEligible ?? false,
      harvestTier: identity.harvestTier,
    };
  }

  const stagedMeta = readBundleMetadata(layout.stagingRoot);
  if (stagedMeta) {
    const { identity } = stagedMeta;
    return {
      harvestId,
      manifestHash: identity.manifestHash,
      payloadHash: identity.payloadHash,
      authoritySourceCommit: identity.authoritySourceCommit,
      durablePath: layout.catalogRel,
      requiredLayers: identity.requiredLayers ?? [],
      retrievalEligible: identity.retrievalEligible ?? true,
      aiCacheEligible: identity.aiCacheEligible ?? false,
      harvestTier: identity.harvestTier,
    };
  }

  throw new Error("MISSING_DURABLE_PUBLICATION_CONTEXT");
}

export function createDefaultLDurablePublisher() {
  return ({ hubRoot, harvestId, payloadHash }) => {
    const receipt = publishLDurableBundle({ hubRoot, harvestId, payloadHash });
    return {
      ok: ["L_DURABLE_PUBLISH_PASS", "NOOP_CURRENT"].includes(receipt.verdict),
      verdict: receipt.verdict,
      durablePath: receipt.durablePath,
      receipt,
    };
  };
}

export function createDefaultZPublisher(options = {}) {
  return (context) => publishZCacheFromL(context, options);
}

export function createDefaultSupabaseProjector(options = {}) {
  return (context, runtimeOptions = {}) =>
    applySupabaseProjection(context, {
      ...options,
      ...runtimeOptions,
      hubRoot: runtimeOptions.hubRoot ?? options.hubRoot,
    });
}

export function createDefaultLayerVerifier() {
  return ({ layers, context }) => {
    const errors = [];
    if (!context?.payloadHash) {
      errors.push("MISSING_PAYLOAD_HASH");
    }
    if (layers.lDurable.required && layers.lDurable.status === "FAILED_REQUIRED") {
      errors.push("L_DURABLE_FAILED");
    }
    return { ok: errors.length === 0, errors };
  };
}

export function createDefaultOperationWriter() {
  return ({ hubRoot, harvestId, payloadHash, phaseBReceipt, pointerCandidate }) =>
    writePhaseBOperations({
      hubRoot,
      harvestId,
      payloadHash,
      phaseBReceipt,
      pointerCandidate,
    });
}

/**
 * Phase B orchestrator — deterministic stage order, injectable adapters for tests.
 * Does not mutate Git, artifacts/agent-runs, or harvest source trees.
 */
export function runPhaseBPublication({
  hubRoot,
  harvestId,
  payloadHash,
  identity: inputIdentity = null,
  skipSupabase = false,
  lDurablePublisher = createDefaultLDurablePublisher(),
  zPublisher = createDefaultZPublisher({ zCacheRoot: undefined }),
  supabaseProjector = createDefaultSupabaseProjector({ hubRoot, skipApply: skipSupabase }),
  hotRoutingPublisher = null,
  layerVerifier = createDefaultLayerVerifier(),
  operationWriter = createDefaultOperationWriter(),
  zPublisherOptions = {},
  supabaseOptions = {},
} = {}) {
  const stages = [];
  const startedAt = new Date().toISOString();

  let retrievalEligible = inputIdentity?.retrievalEligible ?? true;
  let aiCacheEligible = inputIdentity?.aiCacheEligible ?? false;

  if (inputIdentity) {
    retrievalEligible = inputIdentity.retrievalEligible ?? retrievalEligible;
    aiCacheEligible = inputIdentity.aiCacheEligible ?? aiCacheEligible;
  }

  const layers = createInitialLayerState({ retrievalEligible, aiCacheEligible, skipSupabase });

  // Stage 1 — L: durable bundle (always first)
  let lResult;
  try {
    lResult = lDurablePublisher({ hubRoot, harvestId, payloadHash });
    stages.push({ stage: "lDurable", ok: lResult.ok, verdict: lResult.verdict });
    applyLayerResult(layers, "lDurable", { status: mapLDurableVerdict(lResult.verdict) });
  } catch (error) {
    stages.push({ stage: "lDurable", ok: false, error: error.message });
    applyLayerResult(layers, "lDurable", { status: "FAILED_REQUIRED", error: error.message });
    const phaseBVerdict = PHASE_B_VERDICTS.BLOCKED;
    const state = buildPhaseBState({
      harvestId,
      identity: inputIdentity ?? { harvestId, payloadHash },
      layers,
      phaseBVerdict,
    });
    return {
      ok: false,
      phaseBVerdict,
      harvestId,
      payloadHash,
      stages,
      layers,
      state,
      startedAt,
      completedAt: new Date().toISOString(),
    };
  }

  if (!lResult.ok) {
    applyLayerResult(layers, "lDurable", { status: "FAILED_REQUIRED" });
    const phaseBVerdict = PHASE_B_VERDICTS.BLOCKED;
    return {
      ok: false,
      phaseBVerdict,
      harvestId,
      payloadHash,
      stages,
      layers,
      state: buildPhaseBState({
        harvestId,
        identity: inputIdentity ?? { harvestId, payloadHash },
        layers,
        phaseBVerdict,
      }),
      startedAt,
      completedAt: new Date().toISOString(),
    };
  }

  // Read durable identity from L: — not Git worktree
  const context = readDurablePublicationContext(hubRoot, harvestId, payloadHash);
  const identity = inputIdentity ?? context;

  // Stage 2 — Z: cache from L:
  if (layers.zCache.required) {
    const zResult = mapZCacheResult(zPublisher(context));
    stages.push({ stage: "zCache", ok: zResult.ok !== false, status: zResult.status, verdict: zResult.verdict });
    applyLayerResult(layers, "zCache", zResult);
  }

  // Stage 3 — Supabase compact projection from L:
  const supabaseResult = mapSupabaseResult(
    supabaseProjector(
      { ...context, phaseBStatus: "PHASE_B_IN_PROGRESS" },
      {
        ...supabaseOptions,
        skipApply: skipSupabase,
        hubRoot,
        phaseBVerdict: "PHASE_B_IN_PROGRESS",
      },
    ),
  );
  stages.push({
    stage: "supabaseProjection",
    ok: supabaseResult.ok !== false,
    status: supabaseResult.status,
    verdict: supabaseResult.verdict,
  });
  applyLayerResult(layers, "supabaseProjection", supabaseResult);

  // Stage 4 — optional hot routing (never fails Phase B)
  if (hotRoutingPublisher) {
    try {
      const hotResult = hotRoutingPublisher(context);
      stages.push({ stage: "hotRouting", ok: true, ...hotResult });
      applyLayerResult(layers, "hotRouting", hotResult);
    } catch {
      applyLayerResult(layers, "hotRouting", { status: "SKIPPED_NOT_CONFIGURED" });
      stages.push({ stage: "hotRouting", ok: true, status: "SKIPPED_NOT_CONFIGURED" });
    }
  }

  // Stage 5 — verify layers
  const verification = layerVerifier({ layers, context, identity });
  stages.push({ stage: "layerVerifier", ok: verification.ok, errors: verification.errors ?? [] });

  const phaseBVerdict = computePhaseBVerdict(layers);
  const state = buildPhaseBState({ harvestId, identity: context, layers, phaseBVerdict });

  const phaseBReceipt = {
    schemaVersion: PHASE_B_RECEIPT_SCHEMA,
    harvestId,
    manifestHash: context.manifestHash,
    payloadHash: context.payloadHash,
    authoritySourceCommit: context.authoritySourceCommit,
    durablePath: context.durablePath,
    layers,
    phaseBVerdict,
    stages,
    startedAt,
    completedAt: new Date().toISOString(),
    generatedAt: new Date().toISOString(),
  };

  const pointerCandidate = buildPointerCandidate({
    identity: context,
    durablePath: context.durablePath,
    layers,
    phaseBVerdict,
    zCache: { sourcePayloadHash: layers.zCache.sourcePayloadHash ?? context.payloadHash },
    supabaseProjection: {
      sourcePayloadHash: layers.supabaseProjection.sourcePayloadHash ?? context.payloadHash,
    },
  });

  const operations = operationWriter({
    hubRoot,
    harvestId,
    payloadHash,
    phaseBReceipt,
    pointerCandidate,
  });

  const ok =
    phaseBVerdict === PHASE_B_VERDICTS.COMPLETE || phaseBVerdict === PHASE_B_VERDICTS.NOOP;

  return {
    ok,
    phaseBVerdict,
    harvestId,
    payloadHash,
    identity: context,
    layers,
    state,
    stages,
    phaseBReceipt,
    pointerCandidate,
    operations,
    startedAt,
    completedAt: phaseBReceipt.completedAt,
  };
}

export function readExistingPhaseBReceipt(hubRoot, harvestId, payloadHash) {
  const ops = path.join(
    hubRoot,
    "00-master-index",
    "_operations",
    "harvest-publication",
    harvestId,
    payloadHash.replace(/^sha256:/, ""),
    "phase-b-receipt.json",
  );
  if (!fs.existsSync(ops)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(ops, "utf8"));
}

export { readPointerCandidate };
