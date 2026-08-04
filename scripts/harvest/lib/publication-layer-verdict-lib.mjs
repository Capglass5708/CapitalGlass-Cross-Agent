export const PHASE_B_RECEIPT_SCHEMA = "harvest-phase-b-publication-receipt-v1@1.0.0";

export const PHASE_B_VERDICTS = {
  COMPLETE: "PHASE_B_COMPLETE",
  DEGRADED: "PHASE_B_DEGRADED",
  BLOCKED: "PHASE_B_BLOCKED",
  NOOP: "NOOP_CURRENT",
};

const PASS_STATUSES = new Set([
  "CURRENT",
  "NOOP_CURRENT",
  "IN_SYNC",
  "NOT_REQUIRED",
  "SKIPPED_NOT_CONFIGURED",
  "PENDING_PHASE_C",
]);

const NOOP_STATUSES = new Set(["NOOP_CURRENT", "NOT_REQUIRED", "SKIPPED_NOT_CONFIGURED", "PENDING_PHASE_C"]);

export function createInitialLayerState({ retrievalEligible, aiCacheEligible, skipSupabase = false }) {
  const zRequired = Boolean(retrievalEligible || aiCacheEligible);
  return {
    lDurable: { required: true, status: "PENDING" },
    zCache: { required: zRequired, status: zRequired ? "PENDING" : "NOT_REQUIRED" },
    supabaseProjection: {
      required: true,
      status: skipSupabase ? "SKIPPED" : "PENDING",
      ...(skipSupabase ? { skipReason: "skip-supabase" } : {}),
    },
    hotRouting: { required: false, status: "SKIPPED_NOT_CONFIGURED" },
    gitPointer: { required: false, status: "PENDING_PHASE_C" },
  };
}

export function mapLDurableVerdict(verdict) {
  if (verdict === "L_DURABLE_PUBLISH_PASS") return "CURRENT";
  if (verdict === "NOOP_CURRENT") return "NOOP_CURRENT";
  return "FAILED_REQUIRED";
}

export function mapZCacheResult(result) {
  if (result.status) return result;
  if (result.ok === false) return { status: "FAILED_REQUIRED", ...result };
  return { status: result.verdict === "NOOP_CURRENT" ? "NOOP_CURRENT" : "CURRENT", ...result };
}

export function mapSupabaseResult(result) {
  if (result.status) return result;
  if (result.ok === false) return { status: "FAILED_REQUIRED", ...result };
  if (result.verdict === "NOOP_CURRENT") return { status: "NOOP_CURRENT", ...result };
  return { status: "IN_SYNC", ...result };
}

export function applyLayerResult(layers, layerKey, result) {
  const layer = layers[layerKey];
  if (!layer) return;
  const status = result.status ?? (result.ok === false ? "FAILED_REQUIRED" : "CURRENT");
  layer.status = status;
  if (result.skipReason) layer.skipReason = result.skipReason;
  if (result.error) layer.error = result.error;
  if (result.sourcePayloadHash) layer.sourcePayloadHash = result.sourcePayloadHash;
  if (result.verdict) layer.verdict = result.verdict;
}

export function layerPasses(layer) {
  if (!layer.required) {
    return PASS_STATUSES.has(layer.status) || layer.status === "SKIPPED";
  }
  if (layer.status === "SKIPPED" && layer.required) {
    return false;
  }
  return PASS_STATUSES.has(layer.status);
}

export function computePhaseBVerdict(layers) {
  if (layers.lDurable.status === "FAILED_REQUIRED" || layers.lDurable.status === "PENDING") {
    if (layers.lDurable.status === "FAILED_REQUIRED") {
      return PHASE_B_VERDICTS.BLOCKED;
    }
  }

  if (layers.lDurable.status === "FAILED_REQUIRED") {
    return PHASE_B_VERDICTS.BLOCKED;
  }

  const requiredLayers = Object.entries(layers).filter(([, layer]) => layer.required);
  const hasRequiredFailure = requiredLayers.some(
    ([, layer]) => layer.status === "FAILED_REQUIRED" || layer.status === "SKIPPED",
  );

  const allNoop =
    layers.lDurable.status === "NOOP_CURRENT" &&
    (layers.zCache.status === "NOOP_CURRENT" || layers.zCache.status === "NOT_REQUIRED") &&
    (layers.supabaseProjection.status === "NOOP_CURRENT" ||
      layers.supabaseProjection.status === "NOT_REQUIRED") &&
    requiredLayers.every(
      ([, layer]) =>
        NOOP_STATUSES.has(layer.status) || layer.status === "NOOP_CURRENT",
    );

  if (allNoop) {
    return PHASE_B_VERDICTS.NOOP;
  }

  if (hasRequiredFailure) {
    return PHASE_B_VERDICTS.DEGRADED;
  }

  const allRequiredPass = requiredLayers.every(([, layer]) => layerPasses(layer));
  if (!allRequiredPass) {
    return PHASE_B_VERDICTS.BLOCKED;
  }

  return PHASE_B_VERDICTS.COMPLETE;
}

export function buildPhaseBState({ harvestId, identity, layers, phaseBVerdict }) {
  return {
    harvestId,
    identity: {
      manifestHash: identity.manifestHash,
      payloadHash: identity.payloadHash,
      authoritySourceCommit: identity.authoritySourceCommit,
    },
    layers,
    phaseBVerdict,
  };
}
